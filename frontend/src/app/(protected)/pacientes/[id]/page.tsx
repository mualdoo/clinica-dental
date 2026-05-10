'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    usePatient,
    useCreateHealthAlert,
    useHealthAlerts,
    usePatchPatient,
} from '@/hooks/use-patient'
import type { HealthAlertType } from '@/types/patient'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft,
    Phone,
    AlertTriangle,
    User,
    Droplets,
    CheckCircle2,
    Loader2,
    Plus,
    X,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { TabResumen } from './tabs/resumen'
import { TabOdontograma } from './tabs/odontograma'
import { TabHistoria } from './tabs/historia'
import { TabArchivos } from './tabs/archivos'
import { TabPresupuestos } from './tabs/presupuestos'

function calcAge(birthDate: string): number {
    return Math.floor(
        (Date.now() - new Date(birthDate).getTime()) /
            (1000 * 60 * 60 * 24 * 365.25)
    )
}

// ─── Tipos y constantes locales ───────────────────────────────────────────────

const ALERT_TYPE_OPTIONS: { value: HealthAlertType; label: string }[] = [
    { value: 'allergy', label: 'Alergia' },
    { value: 'condition', label: 'Condición' },
    { value: 'medication', label: 'Medicamento' },
    { value: 'other', label: 'Otro' },
]

const ALERT_TYPE_COLORS: Record<HealthAlertType, string> = {
    allergy: 'bg-rose-100 text-rose-700 border-rose-200',
    condition: 'bg-amber-100 text-amber-700 border-amber-200',
    medication: 'bg-violet-100 text-violet-700 border-violet-200',
    other: 'bg-slate-100 text-slate-600 border-slate-200',
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
    drafts: z.array(
        z.object({
            type: z.enum(['allergy', 'condition', 'medication', 'other']),
            content: z.string().min(1),
        })
    ),
    newType: z.enum(['allergy', 'condition', 'medication', 'other']),
    newContent: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

// ─── Dialog de alertas médicas ────────────────────────────────────────────────
export function MedicalAlertsDialog({
    patientId,
    open,
    onOpenChange,
}: {
    patientId: string
    open: boolean
    onOpenChange: (v: boolean) => void
}) {
    const [isSaving, setIsSaving] = useState(false)

    // Mocks de tus hooks reales:
    const { mutateAsync: createAlert } = useCreateHealthAlert(patientId)
    const { mutate: patchPatient } = usePatchPatient()

    const {
        register,
        control,
        handleSubmit,
        getValues,
        setValue,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            drafts: [],
            newType: 'allergy',
            newContent: '',
        },
    })

    const {
        fields: drafts,
        append,
        remove,
    } = useFieldArray({
        control,
        name: 'drafts',
    })

    function handleAddDraft() {
        const content = getValues('newContent')?.trim()
        if (!content) {
            setError('newContent', {
                type: 'manual',
                message: 'Escribe el contenido de la alerta',
            })
            return
        }

        clearErrors('newContent')
        append({ type: getValues('newType'), content })
        setValue('newContent', '') // Limpiamos el textarea
    }

    async function onSubmit(data: FormValues) {
        setIsSaving(true)
        try {
            // Guarda todas las alertas en paralelo
            await Promise.all(data.drafts.map((d) => createAlert(d)))
        } finally {
            // Siempre marca como completado, haya alertas o no
            patchPatient(
                { id: patientId, dto: { completed: true } as any },
                {
                    onSuccess: () => {
                        setIsSaving(false)
                        onOpenChange(false)
                    },
                }
            )
        }
    }

    function handleSkip() {
        patchPatient(
            { id: patientId, dto: { completed: true } as any },
            { onSuccess: () => onOpenChange(false) }
        )
    }

    return (
        <Dialog open={open} onOpenChange={() => {}}>
            {/* Sin onOpenChange en el trigger — el dialog no se cierra con click fuera */}
            <DialogContent
                className="max-w-lg max-h-[90vh] overflow-y-auto"
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 mb-1">
                        <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                    <DialogTitle>Alertas médicas del paciente</DialogTitle>
                    <DialogDescription>
                        Registra alergias, condiciones o medicamentos
                        importantes antes de continuar. Esta información es
                        visible para todo el equipo al abrir el expediente.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-4 py-2"
                >
                    {/* Alertas ya agregadas */}
                    {drafts.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Alertas a registrar ({drafts.length})
                            </p>
                            {drafts.map((draft, i) => (
                                <div
                                    key={draft.id} // useFieldArray inyecta un ID único a cada elemento
                                    className={`flex items-start justify-between gap-2 rounded-lg border px-3 py-2.5 ${ALERT_TYPE_COLORS[draft.type]}`}
                                >
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="text-[10px] font-bold uppercase tracking-wide">
                                            {
                                                ALERT_TYPE_OPTIONS.find(
                                                    (o) =>
                                                        o.value === draft.type
                                                )?.label
                                            }
                                        </span>
                                        <p className="text-xs">
                                            {draft.content}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => remove(i)}
                                        className="shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Formulario para nueva alerta */}
                    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Agregar alerta
                        </p>

                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">Tipo</Label>
                            <Controller
                                control={control}
                                name="newType"
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ALERT_TYPE_OPTIONS.map((o) => (
                                                <SelectItem
                                                    key={o.value}
                                                    value={o.value}
                                                >
                                                    {o.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs" htmlFor="newContent">
                                Descripción
                            </Label>
                            <Textarea
                                id="newContent"
                                {...register('newContent', {
                                    onChange: () => clearErrors('newContent'),
                                })}
                                placeholder="Ej. Alergia a la penicilina, diabetes tipo 2…"
                                rows={2}
                                className={`resize-none text-sm ${errors.newContent ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            />
                            {errors.newContent && (
                                <p className="text-xs text-destructive">
                                    {errors.newContent.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="button" // Muy importante para que no dispare el form submit principal
                            variant="outline"
                            size="sm"
                            className="gap-1.5 w-fit"
                            onClick={handleAddDraft}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Agregar alerta
                        </Button>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-muted-foreground text-sm"
                            disabled={isSaving}
                            onClick={handleSkip}
                        >
                            Sin alertas por ahora
                        </Button>
                        <Button
                            type="submit"
                            className="gap-2"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4" />
                            )}
                            {drafts.length > 0
                                ? `Guardar ${drafts.length} alerta${drafts.length !== 1 ? 's' : ''}`
                                : 'Confirmar sin alertas'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ─── Botón flotante para agregar alertas después ──────────────────────────────
function AddAlertButton({ patientId }: { patientId: string }) {
    const [open, setOpen] = useState(false)
    const { mutateAsync: createAlert } = useCreateHealthAlert(patientId)
    const [type, setType] = useState<HealthAlertType>('allergy')
    const [content, setContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    async function handleSave() {
        if (!content.trim()) return
        setIsSaving(true)
        try {
            await createAlert({ type, content: content.trim() })
            setContent('')
            setOpen(false)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors shrink-0"
            >
                <Plus className="h-3 w-3" />
                Agregar alerta
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Nueva alerta médica</DialogTitle>
                        <DialogDescription>
                            Se mostrará en el header del expediente.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-2">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">Tipo</Label>
                            <Select
                                value={type}
                                onValueChange={(v) =>
                                    setType(v as HealthAlertType)
                                }
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALERT_TYPE_OPTIONS.map((o) => (
                                        <SelectItem
                                            key={o.value}
                                            value={o.value}
                                        >
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">Descripción</Label>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Ej. Alergia a la penicilina…"
                                rows={3}
                                className="resize-none text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            disabled={isSaving || !content.trim()}
                            onClick={handleSave}
                            className="gap-2"
                        >
                            {isSaving && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default function PacientePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const [alertsDialogOpen, setAlertsDialogOpen] = useState(false)
    const { id } = use(params)
    const router = useRouter()

    const { data: patientRes, isLoading } = usePatient(id)
    const { data: alertsRes } = useHealthAlerts(id)

    const patient = patientRes?.data
    const alerts = alertsRes?.pages.flatMap((p) => p.data.data) ?? []

    useEffect(() => {
        if (patient && !patient.completed) {
            setAlertsDialogOpen(true)
        }
    }, [patient])

    if (isLoading) return <PatientSkeleton />
    if (!patient)
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <User className="h-10 w-10 opacity-20" />
                <p className="text-sm">Paciente no encontrado</p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                >
                    Volver
                </Button>
            </div>
        )

    return (
        <div className="flex flex-col gap-0 min-h-screen">
            {/* ── Header fijo ── */}
            <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
                <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col gap-3">
                    {/* Fila 1: volver + nombre */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                                {patient.name[0]}
                                {patient.lastName[0]}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-base font-bold text-foreground truncate leading-tight">
                                    {patient.name} {patient.lastName}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                                    <span>
                                        {calcAge(patient.birthDate)} años
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {patient.phone}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Droplets className="h-3 w-3 text-rose-500" />
                                        {patient.bloodType}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fila 2: alertas de salud */}
                    {alerts.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800 px-3 py-1.5"
                                >
                                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                                    <span className="text-lg font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                                        {alert.type}:
                                    </span>
                                    <span className="text-lg text-rose-700 dark:text-rose-300">
                                        {alert.content}
                                    </span>
                                </div>
                            ))}
                            {/* ← Botón para agregar alertas después */}
                            <AddAlertButton patientId={id} />
                        </div>
                    )}

                    {/* Si no hay alertas pero el paciente ya está completado, muestra solo el botón */}
                    {alerts.length === 0 && patient?.completed && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Sin alertas médicas
                            </span>
                            <AddAlertButton patientId={id} />
                        </div>
                    )}

                    {/* Dialog de configuración inicial */}
                    <MedicalAlertsDialog
                        patientId={id}
                        open={alertsDialogOpen}
                        onOpenChange={setAlertsDialogOpen}
                    />
                </div>

                {/* Tabs nav pegada al header */}
                <div className="mx-auto max-w-5xl px-4">
                    <Tabs defaultValue="resumen" className="w-full">
                        <TabsList className="w-full">
                            {[
                                { value: 'resumen', label: 'Resumen' },
                                { value: 'odontograma', label: 'Odontograma' },
                                {
                                    value: 'historia',
                                    label: 'Historia Clínica',
                                },
                                { value: 'archivos', label: 'Archivos' },
                                {
                                    value: 'presupuestos',
                                    label: 'Presupuestos',
                                },
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="relative h-9"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* ── Contenido de tabs ── */}
                        <div className="mx-auto max-w-5xl px-4 py-5">
                            <TabsContent value="resumen">
                                <TabResumen patientId={id} />
                            </TabsContent>
                            <TabsContent value="odontograma">
                                <TabOdontograma patientId={id} />
                            </TabsContent>
                            <TabsContent value="historia">
                                <TabHistoria patientId={id} />
                            </TabsContent>
                            <TabsContent value="archivos">
                                <TabArchivos patientId={id} />
                            </TabsContent>
                            <TabsContent value="presupuestos">
                                <TabPresupuestos patientId={id} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

function PatientSkeleton() {
    return (
        <div className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3">
            <div className="mx-auto max-w-5xl flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse shrink-0" />
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-56 rounded bg-muted animate-pulse" />
                </div>
            </div>
        </div>
    )
}

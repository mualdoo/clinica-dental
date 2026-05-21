'use client'

import { useState, useMemo } from 'react'
import {
    Loader2,
    CheckCircle2,
    ReceiptText,
    Smile,
    AlertCircle,
    ChevronRight,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppointments, usePatchAppointment } from '@/hooks/use-agenda'
import { useTeeth } from '@/hooks/use-patient'
import { useTreatments, useCreateQuote } from '@/hooks/use-billing'
import {
    conditionFromString,
    CONDITION_LABELS,
    CONDITION_COLORS,
} from '@/types/odontograma'
import type { Tooth } from '@/types/patient'
import type { Appointment } from '@/types/agenda'
import { quoteItemService } from '@/lib/api/billing-service'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
}

// ─── Fila de diente ───────────────────────────────────────────────────────────
function ToothRow({
    tooth,
    selected,
    onToggle,
}: {
    tooth: Tooth
    selected: boolean
    onToggle: () => void
}) {
    const condition = conditionFromString(tooth.condition)
    const color = CONDITION_COLORS[condition]
    const label = CONDITION_LABELS[condition]

    if (condition === 'sano') return null

    return (
        <button
            onClick={onToggle}
            className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all
        ${
            selected
                ? 'border-primary/40 bg-primary/5'
                : 'border-border/50 bg-card hover:border-primary/20 hover:bg-muted/30'
        }`}
        >
            {/* Checkbox visual */}
            <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors
        ${selected ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}
            >
                {selected && (
                    <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                )}
            </div>

            {/* Color de condición */}
            <span
                className="h-3 w-3 rounded-full shrink-0 border border-black/10"
                style={{
                    backgroundColor:
                        color === 'transparent' ? '#e5e7eb' : color,
                }}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                    Diente #{tooth.number}
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        {tooth.surface}
                    </span>
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>

            {selected && (
                <ChevronRight className="h-4 w-4 text-primary shrink-0" />
            )}
        </button>
    )
}

// ─── Contenido del dialog ────────────────────────────────────────────────────
function OngoingContent({
    appointment,
    patientId,
    onClose,
}: {
    appointment: Appointment
    patientId: string
    onClose: () => void
}) {
    const [selectedTeethIds, setSelectedTeethIds] = useState<Set<string>>(
        new Set()
    )
    const [step, setStep] = useState<'review' | 'creating' | 'done'>('review')
    const [createdQuoteId, setCreatedQuoteId] = useState<string | null>(null)

    // Carga los dientes en el rango de la cita
    const { data: teethData, isLoading: teethLoading } = useTeeth(patientId, {
        startTime: appointment.startTime,
        endTime: appointment.endTime,
    })

    // Tratamientos — se buscarán por nombre de condición al crear
    const { data: treatmentsData } = useTreatments()
    const treatments = treatmentsData?.data.data ?? []

    const { mutateAsync: createQuote } = useCreateQuote()
    const { mutate: patchAppointment, isPending: patching } =
        usePatchAppointment()

    const allTeeth: Tooth[] = teethData?.pages.flatMap((p) => p.data.data) ?? []

    // Solo dientes con condición no sana
    const relevantTeeth = useMemo(
        () =>
            allTeeth.filter((t) => conditionFromString(t.condition) !== 'sano'),
        [allTeeth]
    )

    const selectedTeeth = relevantTeeth.filter((t) =>
        selectedTeethIds.has(t.id)
    )

    function toggleTooth(id: string) {
        setSelectedTeethIds((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    function toggleAll() {
        if (selectedTeethIds.size === relevantTeeth.length) {
            setSelectedTeethIds(new Set())
        } else {
            setSelectedTeethIds(new Set(relevantTeeth.map((t) => t.id)))
        }
    }

    // ── Crear presupuesto con items mapeados ──────────────────────────────────
    async function handleCreateQuote() {
        if (selectedTeeth.length === 0) return
        setStep('creating')

        try {
            // 1. Crea el quote
            const quoteRes = await createQuote({
                patientId,
                notes: `Generado desde cita del ${formatTime(appointment.startTime)}`,
                validUntil: new Date(Date.now() + 30 * 86400000)
                    .toISOString()
                    .split('T')[0],
                status: 'draft',
            })
            const quoteId = quoteRes.data.id
            setCreatedQuoteId(quoteId)

            // 2. Por cada diente seleccionado, busca el tratamiento por nombre de condición
            //    y crea un quoteItem
            await Promise.all(
                selectedTeeth.map(async (tooth) => {
                    const conditionName = conditionFromString(tooth.condition)

                    // Busca el tratamiento cuyo name coincide con la condición
                    const treatment = treatments.find(
                        (t) =>
                            t.name.toLowerCase() === conditionName.toLowerCase()
                    )

                    if (!treatment) {
                        console.warn(
                            `[Quote] Sin tratamiento para condición: ${conditionName}`
                        )
                        return
                    }

                    // Usa el createQuoteItem con el quoteId recién creado
                    await quoteItemService.create(quoteId, {
                        treatmentId: treatment.id,
                        toothNumber: tooth.number,
                        discount: 0,
                    })
                })
            )

            setStep('done')
        } catch (err) {
            console.error('[Quote] Error creando presupuesto:', err)
            setStep('review')
        }
    }

    // ── Finalizar cita ────────────────────────────────────────────────────────
    function handleFinish() {
        patchAppointment(
            { id: appointment.id, dto: { status: 'completed' } },
            { onSuccess: onClose }
        )
    }

    // ── Estado: cargando dientes ──────────────────────────────────────────────
    if (teethLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Cargando odontograma de la cita…</p>
            </div>
        )
    }

    // ── Estado: presupuesto creado ────────────────────────────────────────────
    if (step === 'done') {
        return (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <ReceiptText className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                    <p className="text-base font-bold text-foreground">
                        Presupuesto creado
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Se generó con {selectedTeeth.length} tratamiento
                        {selectedTeeth.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button
                    className="w-full gap-2"
                    onClick={handleFinish}
                    disabled={patching}
                >
                    {patching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4" />
                    )}
                    Finalizar cita
                </Button>
            </div>
        )
    }

    // ── Estado: creando ───────────────────────────────────────────────────────
    if (step === 'creating') {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Generando presupuesto…</p>
            </div>
        )
    }

    // ── Vista principal ───────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-4">
            {/* Info de la cita */}
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Smile className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">
                        Cita en curso
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatTime(appointment.startTime)} —{' '}
                        {formatTime(appointment.endTime)}
                        {' · '}Cubículo #{appointment.cubicleId.slice(-4)}
                    </p>
                </div>
                <Badge
                    variant="outline"
                    className="ml-auto text-[10px] bg-sky-50 text-sky-700 border-sky-200 shrink-0"
                >
                    En curso
                </Badge>
            </div>

            {/* Lista de dientes */}
            {relevantTeeth.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 opacity-20" />
                    <p className="text-sm">
                        Sin condiciones registradas en esta cita
                    </p>
                    <p className="text-xs opacity-60 text-center">
                        Puedes finalizar la cita directamente
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {/* Seleccionar todos */}
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Condiciones registradas ({relevantTeeth.length})
                        </p>
                        <button
                            onClick={toggleAll}
                            className="text-xs text-primary hover:underline font-medium"
                        >
                            {selectedTeethIds.size === relevantTeeth.length
                                ? 'Deseleccionar todos'
                                : 'Seleccionar todos'}
                        </button>
                    </div>

                    <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
                        {relevantTeeth.map((tooth) => (
                            <ToothRow
                                key={tooth.id}
                                tooth={tooth}
                                selected={selectedTeethIds.has(tooth.id)}
                                onToggle={() => toggleTooth(tooth.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Acciones */}
            <div className="flex flex-col gap-2 pt-1 border-t border-border/40">
                {relevantTeeth.length > 0 && (
                    <Button
                        className="w-full gap-2"
                        disabled={selectedTeethIds.size === 0}
                        onClick={handleCreateQuote}
                    >
                        <ReceiptText className="h-4 w-4" />
                        Crear presupuesto
                        {selectedTeethIds.size > 0 && (
                            <Badge
                                variant="secondary"
                                className="ml-1 text-[10px] px-1.5 py-0"
                            >
                                {selectedTeethIds.size}
                            </Badge>
                        )}
                    </Button>
                )}

                <Button
                    variant={relevantTeeth.length === 0 ? 'default' : 'outline'}
                    className="w-full gap-2"
                    onClick={handleFinish}
                    disabled={patching}
                >
                    {patching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4" />
                    )}
                    Finalizar cita sin presupuesto
                </Button>
            </div>
        </div>
    )
}

// ─── Dialog principal ─────────────────────────────────────────────────────────
interface OngoingAppointmentDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    patientId: string
}

export function OngoingAppointmentDialog({
    open,
    onOpenChange,
    patientId,
}: OngoingAppointmentDialogProps) {
    // Cita en curso del paciente
    const { data } = useAppointments({ status: 'ongoing', patientId })
    const appointment = data?.data.data.flatMap((p) => p)[0]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Cita en Curso</DialogTitle>
                    <DialogDescription>
                        Revisa las condiciones registradas y genera un
                        presupuesto o finaliza la cita.
                    </DialogDescription>
                </DialogHeader>

                {!appointment ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 opacity-20" />
                        <p className="text-sm">
                            No hay cita en curso para este paciente
                        </p>
                    </div>
                ) : (
                    <OngoingContent
                        appointment={appointment}
                        patientId={patientId}
                        onClose={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import {
    FileText,
    Loader2,
    User,
    Plus,
    ChevronDown,
    ChevronUp,
    Pencil,
    Trash2,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    ClinicalNoteForm,
    type ClinicalNoteFormValues,
} from '@/components/agenda/clinical-note-form'
import {
    useClinicalNotes,
    useCreateClinicalNote,
    usePatchClinicalNote,
    useDeleteClinicalNote,
} from '@/hooks/use-patient'
import { useAuthStore } from '@/store/auth-store'
import type { ClinicalNote } from '@/types/patient'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDateLong(id: string) {
    // Mientras no tengas createdAt en el modelo, usamos el id como fallback
    // Reemplaza por: new Date(note.createdAt) cuando lo tengas
    return new Date().toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

const SOAP_FIELDS: {
    key: keyof Pick<
        ClinicalNote,
        'subjective' | 'objective' | 'assessment' | 'plan'
    >
    label: string
    color: string
}[] = [
    {
        key: 'subjective',
        label: 'Subjetivo',
        color: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300',
    },
    {
        key: 'objective',
        label: 'Objetivo',
        color: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300',
    },
    {
        key: 'assessment',
        label: 'Evaluación',
        color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
    },
    {
        key: 'plan',
        label: 'Plan',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
    },
]

// ─── Modal Add / Edit ─────────────────────────────────────────────────────────
function NoteModal({
    open,
    onOpenChange,
    patientId,
    note,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    patientId: string
    note?: ClinicalNote
}) {
    const { mutate: create, isPending: creating } =
        useCreateClinicalNote(patientId)
    const { mutate: patch, isPending: patching } =
        usePatchClinicalNote(patientId)
    const isEditing = !!note
    const isPending = creating || patching

    function handleSubmit(values: ClinicalNoteFormValues) {
        if (isEditing) {
            patch(
                { id: note.id, dto: values },
                { onSuccess: () => onOpenChange(false) }
            )
        } else {
            create(values, { onSuccess: () => onOpenChange(false) })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? 'Editar nota clínica'
                            : 'Nueva nota clínica'}
                    </DialogTitle>
                    <DialogDescription>
                        Formato SOAP — completa los 4 campos para registrar la
                        nota.
                    </DialogDescription>
                </DialogHeader>
                <ClinicalNoteForm
                    initialData={note}
                    isLoading={isPending}
                    onSubmit={handleSubmit}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

// ─── Diálogo de confirmación de eliminación ───────────────────────────────────
function DeleteNoteDialog({
    open,
    onOpenChange,
    onConfirm,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    onConfirm: () => void
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar nota clínica?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. La nota clínica será
                        eliminada permanentemente del expediente del paciente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

// ─── Tarjeta de nota ──────────────────────────────────────────────────────────
function NoteCard({
    note,
    patientId,
    canEdit,
    onEdit,
}: {
    note: ClinicalNote
    patientId: string
    canEdit: boolean
    onEdit: (n: ClinicalNote) => void
}) {
    const [expanded, setExpanded] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const { mutate: remove, isPending: removing } =
        useDeleteClinicalNote(patientId)

    function handleConfirmDelete() {
        remove(note.id, { onSuccess: () => setDeleteOpen(false) })
    }

    return (
        <>
            {/* Línea de timeline */}
            <div className="relative pl-7 pb-5 last:pb-0">
                <div className="absolute left-2.5 top-0 bottom-0 w-px bg-border last:hidden" />
                <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>

                <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
                    {/* Header de la nota */}
                    <div
                        className="flex items-start justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => setExpanded((e) => !e)}
                    >
                        <div className="flex flex-col gap-1 min-w-0">
                            <p className="text-xs text-muted-foreground capitalize">
                                {formatDateLong(note.id)}
                            </p>
                            <p className="text-sm font-semibold text-foreground line-clamp-1">
                                {note.subjective}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <User className="h-3 w-3 shrink-0" />
                                Dr. #{note.createdBy.slice(-6)}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            {/* Badges SOAP mini */}
                            <div className="hidden sm:flex gap-1">
                                {SOAP_FIELDS.map(
                                    ({ key, label, color }) =>
                                        note[key] && (
                                            <Badge
                                                key={key}
                                                variant="outline"
                                                className={`text-[9px] px-1.5 py-0 font-semibold ${color}`}
                                            >
                                                {label[0]}
                                            </Badge>
                                        )
                                )}
                            </div>

                            {/* Edit / Delete — solo si puede editar */}
                            {canEdit && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onEdit(note)
                                        }}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setDeleteOpen(true)
                                        }}
                                        disabled={removing}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                    >
                                        {removing ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                </>
                            )}

                            {expanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                        </div>
                    </div>

                    {/* Contenido expandido — campos SOAP */}
                    {expanded && (
                        <div className="border-t border-border/40 px-4 pb-4 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {SOAP_FIELDS.map(({ key, label, color }) => (
                                <div
                                    key={key}
                                    className="flex flex-col gap-1.5"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] px-2 py-0 font-bold ${color}`}
                                        >
                                            {label}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-foreground leading-relaxed">
                                        {note[key] || (
                                            <span className="text-muted-foreground italic text-xs">
                                                Sin información
                                            </span>
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <DeleteNoteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleConfirmDelete}
            />
        </>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function NotesSkeleton() {
    return (
        <div className="flex flex-col gap-5 pl-7">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                    <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                    <div className="h-20 rounded-xl bg-muted animate-pulse" />
                </div>
            ))}
        </div>
    )
}

// ─── Tab principal ────────────────────────────────────────────────────────────
export function TabHistoria({ patientId }: { patientId: string }) {
    const [modalOpen, setModalOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<ClinicalNote | undefined>()

    const user = useAuthStore((s) => s.user)
    const canEdit = user?.role === 'dentist' || user?.role === 'admin'

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useClinicalNotes(patientId)

    const loaderRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const el = loaderRef.current
        if (!el) return
        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) fetchNextPage()
            },
            { threshold: 0.5 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [hasNextPage, fetchNextPage])

    const notes = data?.pages.flatMap((p) => p.data.data) ?? []

    function openAdd() {
        setEditTarget(undefined)
        setModalOpen(true)
    }

    function openEdit(note: ClinicalNote) {
        setEditTarget(note)
        setModalOpen(true)
    }

    return (
        <div className="flex flex-col gap-4">
            {/* ── Toolbar ── */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {isLoading
                        ? 'Cargando…'
                        : `${notes.length} nota${notes.length !== 1 ? 's' : ''} clínica${notes.length !== 1 ? 's' : ''}`}
                </p>
                {canEdit && (
                    <Button size="sm" className="gap-1.5" onClick={openAdd}>
                        <Plus className="h-3.5 w-3.5" />
                        Nueva Nota
                    </Button>
                )}
            </div>

            {/* ── Timeline ── */}
            {isLoading ? (
                <NotesSkeleton />
            ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                    <FileText className="h-10 w-10 opacity-20" />
                    <p className="text-sm">Sin notas clínicas registradas</p>
                    {canEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={openAdd}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Agregar la primera nota
                        </Button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col">
                    {notes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            patientId={patientId}
                            canEdit={canEdit}
                            onEdit={openEdit}
                        />
                    ))}
                </div>
            )}

            {/* ── Scroll infinito ── */}
            <div ref={loaderRef} className="flex justify-center py-2">
                {isFetchingNextPage && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
            </div>

            {/* ── Modal ── */}
            <NoteModal
                open={modalOpen}
                onOpenChange={(v) => {
                    setModalOpen(v)
                    if (!v) setEditTarget(undefined)
                }}
                patientId={patientId}
                note={editTarget}
            />
        </div>
    )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Loader2, History, Pencil, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    CONDITION_COLORS,
    CONDITION_LABELS,
    conditionFromString,
    type ToothCondition,
} from '@/types/odontograma'
import type { Tooth } from '@/types/patient'

const CONDITIONS: ToothCondition[] = [
    'healthy',
    'cavity',
    'endodontics',
    'crown',
    'extraction',
    'implant',
]

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

// ─── Tab de diagnóstico ───────────────────────────────────────────────────────
function DiagnosisTab({
    current,
    isSaving,
    onApply,
}: {
    current?: Tooth
    isSaving: boolean
    onApply: (condition: ToothCondition, notes: string) => void
}) {
    const [selected, setSelected] = useState<ToothCondition>(
        current ? conditionFromString(current.condition) : 'healthy'
    )
    const [notes, setNotes] = useState(current?.notes ?? '')

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
                {CONDITIONS.map((c) => {
                    const isActive = selected === c
                    const color = CONDITION_COLORS[c]
                    return (
                        <button
                            key={c}
                            onClick={() => setSelected(c)}
                            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all
                ${
                    isActive
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
                        >
                            <span
                                className="h-3 w-3 rounded-full shrink-0 border border-black/10"
                                style={{
                                    backgroundColor:
                                        color === 'transparent'
                                            ? '#e5e7eb'
                                            : color,
                                }}
                            />
                            {CONDITION_LABELS[c]}
                        </button>
                    )
                })}
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Notas (opcional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observaciones adicionales…"
                    rows={2}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
            </div>

            <Button
                className="w-full gap-2"
                disabled={isSaving}
                onClick={() => onApply(selected, notes)}
            >
                {isSaving ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando…
                    </>
                ) : (
                    'Aplicar diagnóstico'
                )}
            </Button>
        </div>
    )
}

// ─── Tab de historial ─────────────────────────────────────────────────────────
function HistoryTab({ history }: { history: Tooth[] }) {
    const sorted = [...history].sort(
        (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    if (sorted.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                <History className="h-8 w-8 opacity-20" />
                <p className="text-sm">Sin historial para este diente</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {sorted.map((entry, i) => {
                const condition = conditionFromString(entry.condition)
                const color = CONDITION_COLORS[condition]
                const isLatest = i === 0
                return (
                    <div
                        key={entry.id}
                        className={`flex flex-col gap-1.5 rounded-lg border px-3 py-2.5 transition-colors
              ${isLatest ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/20'}`}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span
                                    className="h-3 w-3 rounded-full shrink-0 border border-black/10"
                                    style={{
                                        backgroundColor:
                                            color === 'transparent'
                                                ? '#e5e7eb'
                                                : color,
                                    }}
                                />
                                <span className="text-sm font-semibold text-foreground">
                                    {CONDITION_LABELS[condition]}
                                </span>
                                {isLatest && (
                                    <Badge
                                        variant="outline"
                                        className="text-[9px] px-1.5 py-0 text-primary border-primary/30"
                                    >
                                        Actual
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDateTime(entry.updatedAt)}
                            </div>
                        </div>
                        {entry.notes && (
                            <p className="text-xs text-muted-foreground pl-5">
                                {entry.notes}
                            </p>
                        )}
                        {entry.surface && (
                            <p className="text-[11px] text-muted-foreground pl-5">
                                Superficie: {entry.surface}
                            </p>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ─── Modal principal ──────────────────────────────────────────────────────────
interface ToothModalProps {
    toothNumber: number
    current?: Tooth
    history: Tooth[] // todos los registros de ese número de diente
    isSaving: boolean
    onApply: (condition: ToothCondition, notes: string) => void
    onClose: () => void
}

export function ToothModal({
    toothNumber,
    current,
    history,
    isSaving,
    onApply,
    onClose,
}: ToothModalProps) {
    const [activeTab, setActiveTab] = useState<'diagnosis' | 'history'>(
        'diagnosis'
    )
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    return (
        <div
            ref={overlayRef}
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose()
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
            <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div>
                        <h2 className="text-base font-bold text-foreground">
                            Diente {toothNumber}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {history.length} registro
                            {history.length !== 1 ? 's' : ''} en el historial
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Mini tabs */}
                <div className="flex gap-0 border-b border-border bg-muted/30">
                    {(
                        [
                            {
                                key: 'diagnosis',
                                label: 'Diagnóstico',
                                icon: <Pencil className="h-3.5 w-3.5" />,
                            },
                            {
                                key: 'history',
                                label: 'Historial',
                                icon: <History className="h-3.5 w-3.5" />,
                            },
                        ] as const
                    ).map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors relative
                ${
                    activeTab === key
                        ? 'text-primary bg-background'
                        : 'text-muted-foreground hover:text-foreground'
                }`}
                        >
                            {icon}
                            {label}
                            {activeTab === key && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Contenido */}
                <div className="p-5">
                    {activeTab === 'diagnosis' ? (
                        <DiagnosisTab
                            current={current}
                            isSaving={isSaving}
                            onApply={onApply}
                        />
                    ) : (
                        <HistoryTab history={history} />
                    )}
                </div>
            </div>
        </div>
    )
}

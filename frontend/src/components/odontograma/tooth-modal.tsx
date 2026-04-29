'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    CONDITION_COLORS,
    CONDITION_LABELS,
    type ToothCondition,
    type ToothState,
} from '@/types/odontograma'

const CONDITIONS: ToothCondition[] = [
    'healthy',
    'cavity',
    'endodontics',
    'crown',
    'extraction',
    'implant',
]

interface ToothModalProps {
    toothNumber: number
    current?: ToothState
    isSaving: boolean
    onApply: (condition: ToothCondition, notes: string) => void
    onClose: () => void
}

export function ToothModal({
    toothNumber,
    current,
    isSaving,
    onApply,
    onClose,
}: ToothModalProps) {
    const [selected, setSelected] = useState<ToothCondition>(
        current?.condition ?? 'healthy'
    )
    const [notes, setNotes] = useState(current?.notes ?? '')
    const overlayRef = useRef<HTMLDivElement>(null)

    // Cierra con Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    // Click fuera cierra
    function handleOverlay(e: React.MouseEvent) {
        if (e.target === overlayRef.current) onClose()
    }

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlay}
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
                            Selecciona el diagnóstico
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Condiciones */}
                <div className="p-5 flex flex-col gap-3">
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
                                    {/* Punto de color */}
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

                    {/* Notas */}
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
                </div>

                {/* Footer */}
                <div className="flex gap-2 px-5 pb-5">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="flex-1 gap-2"
                        disabled={isSaving}
                        onClick={() => onApply(selected, notes)}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Guardando…
                            </>
                        ) : (
                            'Aplicar'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

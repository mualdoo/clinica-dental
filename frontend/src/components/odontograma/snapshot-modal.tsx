'use client'

import { useState } from 'react'
import { CalendarDays, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'

interface SnapshotModalProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    onApply: (date: Date) => void
    onClear: () => void
    currentSnapshot: Date | null
}

export function SnapshotModal({
    open,
    onOpenChange,
    onApply,
    onClear,
    currentSnapshot,
}: SnapshotModalProps) {
    const [dateStr, setDateStr] = useState(
        currentSnapshot
            ? currentSnapshot.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    )

    function handleApply() {
        const date = new Date(dateStr + 'T00:00:00')
        onApply(date)
        onOpenChange(false)
    }

    function handleClear() {
        onClear()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Instantánea del Odontograma</DialogTitle>
                    <DialogDescription>
                        Elige una fecha para ver el estado del odontograma en
                        ese momento.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Fecha de referencia
                        </label>
                        <input
                            type="date"
                            value={dateStr}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setDateStr(e.target.value)}
                            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>

                    {currentSnapshot && (
                        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
                            <CalendarDays className="h-4 w-4 text-amber-600 shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                Mostrando instantánea del{' '}
                                <span className="font-semibold">
                                    {currentSnapshot.toLocaleDateString(
                                        'es-MX',
                                        {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        }
                                    )}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    {currentSnapshot && (
                        <Button
                            variant="outline"
                            className="gap-1.5 text-muted-foreground"
                            onClick={handleClear}
                        >
                            <X className="h-3.5 w-3.5" />
                            Quitar filtro
                        </Button>
                    )}
                    <Button className="flex-1 gap-1.5" onClick={handleApply}>
                        <CalendarDays className="h-3.5 w-3.5" />
                        Ver instantánea
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

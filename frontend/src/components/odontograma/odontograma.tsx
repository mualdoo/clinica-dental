'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { CalendarDays, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToothModal } from './tooth-modal'
import { SnapshotModal } from './snapshot-modal'
import {
    CONDITION_COLORS,
    CONDITION_LABELS,
    conditionFromString,
    conditionToString,
    buildTeethMap,
    type ToothCondition,
} from '@/types/odontograma'
import { useTeeth, useCreateTooth } from '@/hooks/use-patient'
import { patientKeys } from '@/hooks/use-patient'
import { useQueryClient } from '@tanstack/react-query'
import type { Tooth } from '@/types/patient'

const LEGEND_CONDITIONS = [
    'cavity',
    'endodontics',
    'crown',
    'extraction',
    'implant',
] as const

interface OdontogramaProps {
    patientId: string
    svgContent: string
    readOnly?: boolean
}

export function Odontograma({
    patientId,
    svgContent,
    readOnly = false,
}: OdontogramaProps) {
    const svgRef = useRef<HTMLDivElement>(null)
    const qc = useQueryClient()

    const [selected, setSelected] = useState<number | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [snapshotDate, setSnapshotDate] = useState<Date | null>(null)
    const [snapshotOpen, setSnapshotOpen] = useState(false)

    const { data } = useTeeth(patientId)
    const { mutateAsync: createTooth } = useCreateTooth(patientId)

    // Todos los registros de todos los dientes
    const allTeeth: Tooth[] = useMemo(
        () => data?.pages.flatMap((p) => p.data.data) ?? [],
        [data]
    )

    // Mantiene el mapa toothNumber → id para saber si hacer POST o PATCH
    useEffect(() => {
        const map: Record<number, string> = {}
        allTeeth.forEach((t) => {
            // Queda el más reciente por número
            if (
                !map[t.number] ||
                new Date(t.updatedAt) >
                    new Date(
                        allTeeth.find((x) => x.id === map[t.number])
                            ?.updatedAt ?? 0
                    )
            ) {
                map[t.number] = t.id
            }
        })
    }, [allTeeth])

    // Mapa de dientes según snapshot o estado actual
    const teethMap = useMemo(
        () => buildTeethMap(allTeeth, snapshotDate),
        [allTeeth, snapshotDate]
    )

    // Historial del diente seleccionado
    const selectedHistory = useMemo(
        () =>
            selected !== null
                ? allTeeth.filter((t) => t.number === selected)
                : [],
        [allTeeth, selected]
    )

    // Diente actual del seleccionado (el más reciente)
    const selectedCurrent = useMemo(
        () => (selected !== null ? teethMap[selected] : undefined),
        [teethMap, selected]
    )

    // ── Aplica colores al SVG ─────────────────────────────────────────────────
    useEffect(() => {
        console.log(
            '[SVG] teethMap cambió, repintando:',
            Object.keys(teethMap).length,
            'dientes'
        )
        const container = svgRef.current
        if (!container) return

        container.innerHTML = svgContent
        const svg = container.querySelector('svg')
        if (!svg) return

        svg.setAttribute('width', '100%')
        svg.removeAttribute('height')
        svg.style.maxWidth = '100%'

        container
            .querySelectorAll<SVGElement>("[id^='tooth_']")
            .forEach((el) => {
                const num = parseInt(el.id.replace('tooth_', ''), 10)
                const tooth = teethMap[num]
                const condition = tooth
                    ? conditionFromString(tooth.condition)
                    : 'healthy'
                const color = CONDITION_COLORS[condition]

                // Pinta el diente según la condición real (sin optimismo)
                el.style.fill = color === 'transparent' ? '' : color
                el.style.fillOpacity = color === 'transparent' ? '' : '0.55'
                el.style.stroke = color === 'transparent' ? '' : color
                el.style.strokeWidth = color === 'transparent' ? '' : '1.5'

                // Cursor y eventos solo si no es readonly y no hay snapshot activo
                if (!readOnly && !snapshotDate) {
                    el.style.cursor = 'pointer'
                    el.addEventListener('mouseenter', () => {
                        el.style.fillOpacity = '0.8'
                        el.style.filter = 'brightness(1.1)'
                    })
                    el.addEventListener('mouseleave', () => {
                        el.style.fillOpacity =
                            color === 'transparent' ? '' : '0.55'
                        el.style.filter = ''
                    })
                    el.addEventListener('click', () => setSelected(num))
                } else if (snapshotDate) {
                    // En modo snapshot el cursor indica que es solo lectura
                    el.style.cursor = 'default'
                }
            })
    }, [svgContent, teethMap, readOnly, snapshotDate])

    // ── Guarda cambio en el diente ────────────────────────────────────────────
    async function applyCondition(
        toothNumber: number,
        condition: ToothCondition,
        notes: string
    ) {
        setIsSaving(true)
        setSelected(null)

        try {
            const res = await createTooth({
                number: toothNumber,
                surface: 'vestibular',
                condition: conditionToString(condition),
                notes,
            })

            // Invalida el caché para que useTeeth recargue con el nuevo registro
            qc.invalidateQueries({ queryKey: patientKeys.teeth(patientId) })
        } catch {
            // El error ya lo maneja el hook con toast
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {/* ── Toolbar ── */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                {/* Leyenda */}
                <div className="flex flex-wrap gap-2">
                    {LEGEND_CONDITIONS.map((c) => (
                        <span
                            key={c}
                            className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground"
                        >
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: CONDITION_COLORS[c] }}
                            />
                            {CONDITION_LABELS[c]}
                        </span>
                    ))}
                </div>

                {/* Botón de instantánea */}
                {!readOnly && (
                    <div className="flex items-center gap-2">
                        {snapshotDate && (
                            <Badge
                                variant="outline"
                                className="gap-1.5 border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                            >
                                <History className="h-3 w-3" />
                                {snapshotDate.toLocaleDateString('es-MX', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </Badge>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setSnapshotOpen(true)}
                        >
                            <CalendarDays className="h-3.5 w-3.5" />
                            {snapshotDate ? 'Cambiar fecha' : 'Ver instantánea'}
                        </Button>
                    </div>
                )}
            </div>

            {/* ── Banner de modo snapshot ── */}
            {snapshotDate && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
                    <CalendarDays className="h-4 w-4 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-300 flex-1">
                        Viendo el odontograma tal como estaba el{' '}
                        <span className="font-semibold">
                            {snapshotDate.toLocaleDateString('es-MX', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </span>
                        . Los dientes no son editables en este modo.
                    </p>
                    <button
                        onClick={() => setSnapshotDate(null)}
                        className="text-amber-600 hover:text-amber-800 text-xs font-semibold underline shrink-0"
                    >
                        Salir
                    </button>
                </div>
            )}

            {/* ── SVG ── */}
            <div
                key={JSON.stringify(teethMap)}
                ref={svgRef}
                className={`w-full rounded-xl border bg-card p-4 shadow-sm overflow-hidden transition-all
          ${snapshotDate ? 'border-amber-200 opacity-90' : 'border-border/60'}`}
            />

            {/* ── Modal de diagnóstico + historial ── */}
            {selected !== null && !snapshotDate && (
                <ToothModal
                    toothNumber={selected}
                    current={selectedCurrent}
                    history={selectedHistory}
                    isSaving={isSaving}
                    onApply={(condition, notes) =>
                        applyCondition(selected, condition, notes)
                    }
                    onClose={() => setSelected(null)}
                />
            )}

            {/* ── Modal de instantánea ── */}
            <SnapshotModal
                open={snapshotOpen}
                onOpenChange={setSnapshotOpen}
                currentSnapshot={snapshotDate}
                onApply={(date) => setSnapshotDate(date)}
                onClear={() => setSnapshotDate(null)}
            />
        </div>
    )
}

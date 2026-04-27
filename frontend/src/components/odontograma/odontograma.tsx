'use client'

import { useEffect, useRef } from 'react'
import { ToothModal } from './tooth-modal'
import { CONDITION_COLORS, CONDITION_LABELS } from '@/types/odontograma'
import { useOdontograma, teethToState } from '@/hooks/use-odontograma'
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
    teeth: Tooth[] // datos cargados desde el hook useTeeth
    svgContent: string // el SVG como string que ya tienes
    readOnly?: boolean // para la vista del portal de paciente
}

export function Odontograma({
    patientId,
    teeth,
    svgContent,
    readOnly = false,
}: OdontogramaProps) {
    const svgRef = useRef<HTMLDivElement>(null)

    const {
        state,
        selected,
        isSaving,
        selectTooth,
        closeTooth,
        applyCondition,
    } = useOdontograma(patientId, teeth)

    // ── Aplica colores al SVG e inyecta listeners ──────────────────────────────
    useEffect(() => {
        const container = svgRef.current
        if (!container) return

        // Inyecta el SVG
        container.innerHTML = svgContent
        const svg = container.querySelector('svg')
        if (!svg) return

        // Hace el SVG responsivo
        svg.setAttribute('width', '100%')
        svg.removeAttribute('height')
        svg.style.maxWidth = '100%'

        // Por cada diente en el SVG
        container
            .querySelectorAll<SVGElement>("[id^='tooth_']")
            .forEach((el) => {
                const num = parseInt(el.id.replace('tooth_', ''), 10)
                const toothState = state[num]
                const condition = toothState?.condition ?? 'healthy'
                const color = CONDITION_COLORS[condition]

                // Aplica color de relleno
                el.style.fill = color === 'transparent' ? '' : color
                el.style.fillOpacity = color === 'transparent' ? '' : '0.55'
                el.style.stroke = color === 'transparent' ? '' : color
                el.style.strokeWidth = color === 'transparent' ? '' : '1.5'

                if (!readOnly) {
                    el.style.cursor = 'pointer'
                    // Hover
                    el.addEventListener('mouseenter', () => {
                        el.style.fillOpacity = '0.8'
                        el.style.filter = 'brightness(1.1)'
                    })
                    el.addEventListener('mouseleave', () => {
                        el.style.fillOpacity =
                            color === 'transparent' ? '' : '0.55'
                        el.style.filter = ''
                    })
                    // Click
                    el.addEventListener('click', () => selectTooth(num))
                }
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [svgContent, state, readOnly])

    const selectedState = selected !== null ? state[selected] : undefined

    return (
        <div className="flex flex-col gap-4">
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

            {/* SVG */}
            <div
                ref={svgRef}
                className="w-full rounded-xl border border-border/60 bg-card p-4 shadow-sm overflow-hidden"
            />

            {/* Modal de diagnóstico */}
            {selected !== null && (
                <ToothModal
                    toothNumber={selected}
                    current={selectedState}
                    isSaving={isSaving}
                    onApply={(condition, notes) =>
                        applyCondition(selected, condition, notes)
                    }
                    onClose={closeTooth}
                />
            )}
        </div>
    )
}

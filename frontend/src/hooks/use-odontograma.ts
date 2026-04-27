'use client'

import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { toothService } from '@/lib/api/patient-service'
import { patientKeys } from '@/hooks/use-patient'
import {
    conditionFromString,
    conditionToString,
    type OdontogramaState,
    type ToothCondition,
    type ToothState,
} from '@/types/odontograma'
import type { Tooth } from '@/types/patient'

/**
 * Convierte la lista de Tooth del backend al mapa local { [number]: ToothState }
 */
export function teethToState(teeth: Tooth[]): OdontogramaState {
    return teeth.reduce<OdontogramaState>((acc, t) => {
        acc[t.number] = {
            toothNumber: t.number,
            condition: conditionFromString(t.condition),
            notes: t.notes,
            surface: t.surface,
        }
        return acc
    }, {})
}

export function useOdontograma(patientId: string, initialTeeth: Tooth[]) {
    const qc = useQueryClient()

    // Estado local del mapa dental — se actualiza optimistamente
    const [state, setState] = useState<OdontogramaState>(() =>
        teethToState(initialTeeth)
    )

    // Diente seleccionado actualmente (para el modal)
    const [selected, setSelected] = useState<number | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // IDs de Tooth existentes en backend { [toothNumber]: toothId }
    const [toothIds, setToothIds] = useState<Record<number, string>>(() =>
        initialTeeth.reduce<Record<number, string>>((acc, t) => {
            acc[t.number] = t.id
            return acc
        }, {})
    )

    const selectTooth = useCallback((number: number) => {
        setSelected(number)
    }, [])

    const closeTooth = useCallback(() => {
        setSelected(null)
    }, [])

    /**
     * Aplica un diagnóstico al diente seleccionado.
     * Si ya existe en el backend → PATCH
     * Si es nuevo → POST (create)
     */
    const applyCondition = useCallback(
        async (toothNumber: number, condition: ToothCondition, notes = '') => {
            const prev = state[toothNumber]
            const next: ToothState = { toothNumber, condition, notes }

            // 1. Actualización optimista inmediata
            setState((s) => ({ ...s, [toothNumber]: next }))
            setSelected(null)
            setIsSaving(true)

            try {
                // POST — primer registro de este diente
                const res = await toothService.create(patientId, {
                    number: toothNumber,
                    surface: 'vestibular', // superficie por defecto
                    condition: conditionToString(condition),
                    notes,
                })
                // Guardamos el nuevo ID para futuros PATCH
                setToothIds((ids) => ({
                    ...ids,
                    [toothNumber]: res.data.id,
                }))

                // Invalida el caché de dientes para mantener sincronía
                qc.invalidateQueries({ queryKey: patientKeys.teeth(patientId) })
            } catch (err: unknown) {
                // Rollback optimista
                setState((s) => ({
                    ...s,
                    [toothNumber]: prev ?? {
                        toothNumber,
                        condition: 'healthy',
                    },
                }))
                toast.error(
                    err instanceof Error ? err.message : 'Error al guardar'
                )
            } finally {
                setIsSaving(false)
            }
        },
        [state, toothIds, patientId, qc]
    )

    return {
        state,
        selected,
        isSaving,
        selectTooth,
        closeTooth,
        applyCondition,
    }
}

'use client'

import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getOdontogramaSocket, destroyOdontogramaSocket } from '@/lib/socket'
import { patientKeys } from '@/hooks/use-patient'
import type { Tooth } from '@/types/patient'

interface ToothEvent {
    event: 'created' | 'updated' | 'deleted'
    tooth?: Tooth
    toothId?: string
    toothNumber?: number
}

export function useOdontogramaSocket(patientId: string) {
    const qc = useQueryClient()
    const socket = getOdontogramaSocket()

    useEffect(() => {
        if (!patientId) return

        socket.connect()
        socket.emit('join-patient', patientId)

        socket.on('tooth-updated', ({ event, tooth, toothId }: ToothEvent) => {
            qc.setQueriesData(
                { queryKey: patientKeys.teeth(patientId) },
                (old: any) => {
                    if (!old?.pages) return old

                    const mapPages = (fn: (teeth: Tooth[]) => Tooth[]) => ({
                        ...old,
                        pages: old.pages.map((page: any) => ({
                            ...page,
                            data: {
                                ...page.data,
                                data: fn(page.data.data),
                            },
                        })),
                    })

                    switch (event) {
                        case 'created':
                            qc.invalidateQueries({
                                queryKey: patientKeys.teeth(patientId),
                            })
                            return
                        // if (!tooth) return old
                        // Agrega el diente a la primera página
                        // return {
                        //     ...old,
                        //     pages: old.pages.map((page: any, i: number) =>
                        //         i === 0
                        //             ? {
                        //                   ...page,
                        //                   data: {
                        //                       ...page.data,
                        //                       data: [
                        //                           ...page.data.data,
                        //                           tooth,
                        //                       ],
                        //                       total: page.data.total + 1,
                        //                   },
                        //               }
                        //             : page
                        //     ),
                        // }

                        case 'updated':
                            if (!tooth) return old
                            return mapPages((teeth) =>
                                teeth.map((t) =>
                                    t.id === tooth.id ? tooth : t
                                )
                            )

                        case 'deleted':
                            if (!toothId) return old
                            return mapPages((teeth) =>
                                teeth.filter((t) => t.id !== toothId)
                            )

                        default:
                            return old
                    }
                }
            )
        })

        return () => {
            socket.emit('leave-patient', patientId)
            socket.off('tooth-updated')
            // No destruyas el socket aquí — se reutiliza si el usuario
            // navega entre tabs y vuelve al odontograma
        }
    }, [patientId, qc, socket])

    // Expuesto por si necesitas reconectar manualmente
    const reconnect = useCallback(() => {
        socket.disconnect()
        socket.connect()
        socket.emit('join-patient', patientId)
    }, [patientId, socket])

    return { reconnect }
}

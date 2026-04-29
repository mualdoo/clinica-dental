'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer' // npm install react-intersection-observer
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Clock, User, UserRound, Plus, Loader2 } from 'lucide-react'
import { useInfiniteAppointments } from '@/hooks/use-agenda'
import { format } from 'date-fns'
import { AppointmentForm } from '@/components/agenda/AppointmentForm'

const statusConfig = {
    arrived: { label: 'Llegó', className: 'bg-green-500 text-white' },
    waiting: { label: 'En espera', className: 'bg-yellow-500 text-black' },
    absent: { label: 'Faltó', className: 'bg-red-500 text-white' },
    scheduled: { label: 'Pendiente', className: 'bg-slate-200 text-slate-700' },
}

export default function AgendaPage() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteAppointments({ limit: 15 })

    // Para renderizar, normalmente "aplanas" todas las páginas en un solo array:
    const allAppointments = data?.pages.flatMap((page) => page.data.data) ?? []
    const { ref, inView } = useInView()
    const [open, setOpen] = useState(false)

    // Efecto para cargar más cuando el usuario llega al final
    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage()
        }
    }, [inView, hasNextPage, fetchNextPage])

    // if (status === 'pending')
    //     return (
    //         <div className="p-10 flex justify-center">
    //             <Loader2 className="animate-spin" />
    //         </div>
    //     )

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">
                    Agenda Diaria
                </h1>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Nueva Cita
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-150">
                        <DialogHeader>
                            <DialogTitle>Agendar Nueva Cita</DialogTitle>
                            <DialogDescription>
                                Completa los datos del paciente y asigna un
                                doctor disponible.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Usamos el prop onCreated que definimos para cerrar el modal al terminar */}
                        <AppointmentForm onCreated={() => setOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Vista de Lista Responsiva */}
            <div className="grid gap-4">
                {data?.pages.map((page) =>
                    page.data.data.map((appointment) => (
                        <Card
                            key={appointment.id}
                            className="overflow-hidden border-l-4 border-l-primary"
                        >
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    {/* Info Principal */}
                                    <div className="flex gap-4">
                                        <div className="bg-muted p-3 rounded-lg flex flex-col items-center justify-center min-w-17.5">
                                            <span className="text-xs uppercase font-bold text-muted-foreground">
                                                Hora
                                            </span>
                                            <span className="text-lg font-bold">
                                                {format(
                                                    new Date(
                                                        appointment.startTime
                                                    ),
                                                    'HH:mm'
                                                )}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 font-semibold">
                                                <User className="h-4 w-4 text-primary" />
                                                {appointment.patientId}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <UserRound className="h-3 w-3" />
                                                Dr. {appointment.dentistId} —
                                                Cubículo {appointment.cubicleId}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Estado y Acciones */}
                                    <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                                        <Badge
                                            className={
                                                statusConfig[
                                                    appointment.status as keyof typeof statusConfig
                                                ]?.className
                                            }
                                        >
                                            {
                                                statusConfig[
                                                    appointment.status as keyof typeof statusConfig
                                                ]?.label
                                            }
                                        </Badge>
                                        <Button variant="outline" size="sm">
                                            Detalles
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Indicador de Carga al Final */}
            <div ref={ref} className="py-8 flex justify-center">
                {isFetchingNextPage ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : hasNextPage ? (
                    <span className="text-sm text-muted-foreground">
                        Cargando más...
                    </span>
                ) : (
                    <span className="text-sm text-muted-foreground">
                        Fin de la agenda de hoy
                    </span>
                )}
            </div>
        </div>
    )
}

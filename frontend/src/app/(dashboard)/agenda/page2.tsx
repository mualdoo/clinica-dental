'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    Clock,
} from 'lucide-react'
import { useAppointments } from '@/hooks/use-agenda' // Tu hook de TanStack
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Mapeo de estados a colores de Shadcn/Tailwind (basado en tus requerimientos)
const statusConfig = {
    completed: {
        label: 'Llegó',
        variant: 'success',
        className: 'bg-green-500 hover:bg-green-600',
    },
    cancelled: {
        label: 'En espera',
        variant: 'warning',
        className: 'bg-yellow-500 hover:bg-yellow-600',
    },
    missed: {
        label: 'Faltó',
        variant: 'destructive',
        className: 'bg-red-500 hover:bg-red-600',
    },
    scheduled: { label: 'Programada', variant: 'outline', className: '' },
}

export default function AgendaPage() {
    const [page, setPage] = useState(1)
    const limit = 10

    // Llamada al hook con parámetros de paginación
    const {
        data: response,
        isLoading,
        isError,
    } = useAppointments({ page, limit })

    // Acceso a los datos según tu estructura PaginatedResponse<T>
    const appointments = response?.data.data || []
    const totalPages = response?.data.totalPages || 1

    if (isError)
        return (
            <div className="p-8 text-center text-red-500">
                Error al cargar la agenda.
            </div>
        )

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Agenda Médica
                    </h1>
                    <p className="text-muted-foreground">
                        Gestiona las citas y el flujo de pacientes de hoy.
                    </p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Nueva Cita
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        Citas Programadas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Hora</TableHead>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Doctor / Cubículo</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow
                                            key={i}
                                            className="animate-pulse"
                                        >
                                            <TableCell
                                                colSpan={5}
                                                className="h-12 bg-muted/50"
                                            />
                                        </TableRow>
                                    ))
                                ) : appointments.length > 0 ? (
                                    appointments.map((appointment) => (
                                        <TableRow key={appointment.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    {format(
                                                        new Date(
                                                            appointment.startTime
                                                        ),
                                                        'HH:mm'
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {appointment.patientId}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {appointment.patientId}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    Dr. {appointment.dentistId}
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] font-normal uppercase"
                                                >
                                                    {appointment.cubicleId ||
                                                        'Sin asignar'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        statusConfig[
                                                            appointment.status as keyof typeof statusConfig
                                                        ]?.className
                                                    }
                                                >
                                                    {statusConfig[
                                                        appointment.status as keyof typeof statusConfig
                                                    ]?.label ||
                                                        appointment.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center"
                                        >
                                            No hay citas programadas para este
                                            periodo.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Controles de Paginación */}
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                            Página {page} de {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPage((old) => Math.max(old - 1, 1))
                                }
                                disabled={page === 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4" /> Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPage((old) =>
                                        Math.min(old + 1, totalPages)
                                    )
                                }
                                disabled={page === totalPages || isLoading}
                            >
                                Siguiente <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

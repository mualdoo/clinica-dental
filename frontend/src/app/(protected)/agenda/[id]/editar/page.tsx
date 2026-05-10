'use client'

import { useRouter, useParams } from 'next/navigation'
import { AppointmentForm } from '@/components/agenda/AppointmentForm'
import { useAppointment, useAppointments } from '@/hooks/use-agenda'
import { Loader2 } from 'lucide-react'

export default function EditAppointmentPage() {
    const router = useRouter()
    const params = useParams()
    const appointmentId = params.id as string

    // 1. Datos iniciales de la cita
    const { data: initialData, isLoading: isLoadingAppointment } =
        useAppointment(appointmentId)

    // 2. Arreglo para la disponibilidad
    const { data: appointments = [], isLoading: isLoadingAppointments } =
        useAppointments()

    const handleSaved = () => {
        router.push('/agenda')
        router.refresh()
    }

    if (isLoadingAppointment || isLoadingAppointments) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">
                    Cargando información de la cita...
                </p>
            </div>
        )
    }

    if (!initialData) {
        return (
            <div className="container mx-auto py-8 text-center">
                <h2 className="text-2xl font-bold">Cita no encontrada</h2>
                <button
                    onClick={() => router.push('/agenda')}
                    className="mt-4 text-primary hover:underline"
                >
                    Volver a la agenda
                </button>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <AppointmentForm
                initialData={initialData.data}
                onSaved={handleSaved}
            />
        </div>
    )
}

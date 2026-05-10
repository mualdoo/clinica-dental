'use client'

import { useRouter } from 'next/navigation'
import { AppointmentForm } from '@/components/agenda/AppointmentForm'
// Se asume que este hook obtiene todas las citas o al menos un rango muy amplio
import { useAppointments } from '@/hooks/use-agenda'
import { Loader2 } from 'lucide-react'

export default function CreateAppointmentPage() {
    const router = useRouter()

    const { data: appointments = [], isLoading } = useAppointments()

    const handleSaved = () => {
        router.push('/agenda')
        router.refresh()
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">
                    Cargando disponibilidad...
                </p>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <AppointmentForm onSaved={handleSaved} />
        </div>
    )
}

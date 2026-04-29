'use client'

import { useRouter } from 'next/navigation'
import { UserCircle } from 'lucide-react'
import { PatientForm } from '@/components/patient/patient-form'
import { useCreatePatient } from '@/hooks/use-patient'
import { useAuthStore } from '@/store/auth-store'
import type { CreatePatientDto } from '@/types/patient'

export default function CompletarPerfilPage() {
    const router = useRouter()
    const user = useAuthStore((s) => s.user)
    const { mutate: createPatient, isPending } = useCreatePatient()

    function handleSubmit(data: CreatePatientDto) {
        createPatient(data, {
            onSuccess: (res) => {
                router.push(`/portal`)
            },
        })
    }

    return (
        <div className="mx-auto max-w-2xl flex flex-col gap-6 py-4">
            {/* Header */}
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <UserCircle className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        Completa tu Perfil
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Necesitamos algunos datos adicionales para tu expediente
                    </p>
                </div>
            </div>

            {/* Formulario — email y authUserId prellenados desde el store */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                <PatientForm
                    initialValues={{
                        email: user?.email ?? '',
                    }}
                    isLoading={isPending}
                    onSubmit={handleSubmit}
                    submitLabel="Guardar y Continuar"
                />
            </div>
        </div>
    )
}

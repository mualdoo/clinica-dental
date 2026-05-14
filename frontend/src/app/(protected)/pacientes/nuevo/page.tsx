'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PatientForm } from '@/components/patient/patient-form'
import { useCreatePatient } from '@/hooks/use-patient'
import type { CreatePatientDto } from '@/types/patient'

export default function NuevoPacientePage() {
    const router = useRouter()
    const { mutate: createPatient, isPending } = useCreatePatient()

    function handleSubmit(data: CreatePatientDto) {
        createPatient(data, {
            onSuccess: (res) => {
                router.push('/pacientes')
            },
        })
    }

    return (
        <div className="mx-auto max-w-2xl flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        Registrar Nuevo Paciente
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Completa los datos del paciente
                    </p>
                </div>
            </div>

            {/* Formulario */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                <PatientForm
                    isLoading={isPending}
                    onSubmit={handleSubmit}
                    onCancel={() => router.back()}
                />
            </div>
        </div>
    )
}

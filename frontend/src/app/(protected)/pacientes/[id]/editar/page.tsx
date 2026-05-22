'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { PatientForm } from '@/components/patient/patient-form'
import { usePatient, usePatchPatient } from '@/hooks/use-patient'
import type { CreatePatientDto } from '@/types/patient'

export default function EditarPacientePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()

    const { data: patientRes, isLoading } = usePatient(id)
    const { mutate: patchPatient, isPending } = usePatchPatient()

    const patient = patientRes?.data

    function handleSubmit(data: CreatePatientDto) {
        patchPatient(
            { id, dto: data },
            { onSuccess: () => router.push(`/pacientes/${id}`) }
        )
    }

    // ── Cargando ──────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="mx-auto max-w-2xl flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                    <div className="h-6 w-48 rounded bg-muted animate-pulse" />
                </div>
                <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm flex flex-col gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-9 rounded-lg bg-muted animate-pulse"
                        />
                    ))}
                </div>
            </div>
        )
    }

    // ── Paciente no encontrado ────────────────────────────────────────────────
    if (!patient) {
        return (
            <div className="mx-auto max-w-2xl flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <p className="text-sm">Paciente no encontrado</p>
                <button
                    onClick={() => router.back()}
                    className="text-xs text-primary hover:underline"
                >
                    Volver
                </button>
            </div>
        )
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
                        Editar Paciente
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {patient.name} {patient.lastName}
                    </p>
                </div>
            </div>

            {/* Formulario — prellenado con los datos actuales */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                <PatientForm
                    initialValues={{
                        email: patient.email,
                        name: patient.name,
                        lastName: patient.lastName,
                        birthDate: patient.birthDate,
                        gender: patient.gender,
                        phone: patient.phone,
                        address: patient.address,
                        bloodType: patient.bloodType,
                    }}
                    isLoading={isPending}
                    onSubmit={handleSubmit}
                    onCancel={() => router.back()}
                    submitLabel="Guardar cambios"
                />
            </div>
        </div>
    )
}

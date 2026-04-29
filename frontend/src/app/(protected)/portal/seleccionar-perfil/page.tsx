'use client'

import { useRouter } from 'next/navigation'
import { usePatients } from '@/hooks/use-patient'
import { useAuthStore } from '@/store/auth-store'
import { User, Plus, ChevronRight, Loader2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Patient } from '@/types/patient'

const MAX_PATIENTS = 3

function calcAge(birthDate: string): number {
    return Math.floor(
        (Date.now() - new Date(birthDate).getTime()) /
            (1000 * 60 * 60 * 24 * 365.25)
    )
}

function AvatarCircle({ patient }: { patient: Patient }) {
    const initials = `${patient.name[0]}${patient.lastName[0]}`.toUpperCase()
    const colors = [
        'bg-sky-100 text-sky-700',
        'bg-emerald-100 text-emerald-700',
        'bg-violet-100 text-violet-700',
    ]
    const color =
        colors[
            (patient.name.charCodeAt(0) + patient.lastName.charCodeAt(0)) %
                colors.length
        ]
    return (
        <div
            className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold shrink-0 ${color}`}
        >
            {initials}
        </div>
    )
}

export default function SeleccionarPerfilPage() {
    const router = useRouter()
    const setActivePatient = useAuthStore((s) => s.setActivePatientId)

    // El backend filtra automáticamente por authUserId del token
    const { data, isLoading } = usePatients()
    const patients: Patient[] = data?.pages.flatMap((p) => p.data.data) ?? []

    function handleSelect(patient: Patient) {
        console.log(patient)

        setActivePatient(patient.id)

        document.cookie = `activePatientId=${patient.id}; path=/; SameSite=Strict`

        router.push('/portal')
    }

    function handleNew() {
        router.push('/portal/completar-perfil')
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-1">
                        <Users className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        ¿Quién va hoy?
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Selecciona el perfil para continuar
                    </p>
                </div>

                {/* Lista de perfiles */}
                <div className="flex flex-col gap-3">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : patients.length === 0 ? (
                        // Sin perfil aún — va directo a completar perfil
                        <div className="rounded-xl border border-dashed border-border bg-card p-8 flex flex-col items-center gap-3 text-center">
                            <User className="h-10 w-10 text-muted-foreground opacity-40" />
                            <p className="text-sm text-muted-foreground">
                                Aún no tienes un perfil de paciente
                            </p>
                            <Button onClick={handleNew} className="gap-2 mt-1">
                                <Plus className="h-4 w-4" />
                                Crear mi perfil
                            </Button>
                        </div>
                    ) : (
                        patients.map((patient) => (
                            <button
                                key={patient.id}
                                onClick={() => handleSelect(patient)}
                                className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm text-left transition-all hover:border-primary/40 hover:shadow-md hover:bg-muted/30 active:scale-[0.99]"
                            >
                                <AvatarCircle patient={patient} />

                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-foreground truncate">
                                        {patient.name} {patient.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {calcAge(patient.birthDate)} años ·{' '}
                                        {patient.bloodType}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                        {patient.phone}
                                    </p>
                                </div>

                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                        ))
                    )}
                </div>

                {/* Agregar otro perfil — solo si no llegó al límite */}
                {!isLoading &&
                    patients.length > 0 &&
                    patients.length < MAX_PATIENTS && (
                        <button
                            onClick={handleNew}
                            className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/20 group"
                        >
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 group-hover:border-primary/40 transition-colors">
                                <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">
                                    Agregar perfil
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Puedes tener hasta {MAX_PATIENTS} perfiles
                                    en esta cuenta
                                </p>
                            </div>
                        </button>
                    )}

                {/* Indicador de slots usados */}
                {!isLoading && patients.length > 0 && (
                    <div className="flex justify-center gap-1.5">
                        {Array.from({ length: MAX_PATIENTS }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 w-8 rounded-full transition-colors ${
                                    i < patients.length
                                        ? 'bg-primary'
                                        : 'bg-muted'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

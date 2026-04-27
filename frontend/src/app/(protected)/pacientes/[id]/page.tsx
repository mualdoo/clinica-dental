'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Phone, AlertTriangle, User, Droplets } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { usePatient, useHealthAlerts } from '@/hooks/use-patient'
import { TabResumen } from './tabs/resumen'
import { TabOdontograma } from './tabs/odontograma'
import { TabHistoria } from './tabs/historia'
import { TabArchivos } from './tabs/archivos'
import { TabPresupuestos } from './tabs/presupuestos'

function calcAge(birthDate: string): number {
    return Math.floor(
        (Date.now() - new Date(birthDate).getTime()) /
            (1000 * 60 * 60 * 24 * 365.25)
    )
}

export default function PacientePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()

    const { data: patientRes, isLoading } = usePatient(id)
    const { data: alertsRes } = useHealthAlerts(id)

    const patient = patientRes?.data
    const alerts = alertsRes?.pages.flatMap((p) => p.data.data) ?? []

    if (isLoading) return <PatientSkeleton />
    if (!patient)
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <User className="h-10 w-10 opacity-20" />
                <p className="text-sm">Paciente no encontrado</p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                >
                    Volver
                </Button>
            </div>
        )

    return (
        <div className="flex flex-col gap-0 min-h-screen">
            {/* ── Header fijo ── */}
            <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
                <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col gap-3">
                    {/* Fila 1: volver + nombre */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                                {patient.name[0]}
                                {patient.lastName[0]}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-base font-bold text-foreground truncate leading-tight">
                                    {patient.name} {patient.lastName}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                                    <span>
                                        {calcAge(patient.birthDate)} años
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {patient.phone}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Droplets className="h-3 w-3 text-rose-500" />
                                        {patient.bloodType}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fila 2: alertas de salud */}
                    {alerts.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800 px-3 py-1.5"
                                >
                                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                                    <span className="text-lg font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                                        {alert.type}:
                                    </span>
                                    <span className="text-lg text-rose-700 dark:text-rose-300">
                                        {alert.content}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tabs nav pegada al header */}
                <div className="mx-auto max-w-5xl px-4">
                    <Tabs defaultValue="resumen" className="w-full">
                        <TabsList className="w-full">
                            {[
                                { value: 'resumen', label: 'Resumen' },
                                { value: 'odontograma', label: 'Odontograma' },
                                {
                                    value: 'historia',
                                    label: 'Historia Clínica',
                                },
                                { value: 'archivos', label: 'Archivos' },
                                {
                                    value: 'presupuestos',
                                    label: 'Presupuestos',
                                },
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="relative h-9"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* ── Contenido de tabs ── */}
                        <div className="mx-auto max-w-5xl px-4 py-5">
                            <TabsContent value="resumen">
                                <TabResumen patientId={id} />
                            </TabsContent>
                            <TabsContent value="odontograma">
                                <TabOdontograma patientId={id} />
                            </TabsContent>
                            <TabsContent value="historia">
                                <TabHistoria patientId={id} />
                            </TabsContent>
                            <TabsContent value="archivos">
                                <TabArchivos patientId={id} />
                            </TabsContent>
                            <TabsContent value="presupuestos">
                                <TabPresupuestos patientId={id} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

function PatientSkeleton() {
    return (
        <div className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3">
            <div className="mx-auto max-w-5xl flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse shrink-0" />
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-56 rounded bg-muted animate-pulse" />
                </div>
            </div>
        </div>
    )
}

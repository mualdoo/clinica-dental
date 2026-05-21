'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FileText, Smile, FolderOpen } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'

// Reutiliza directamente los mismos tabs del expediente del dentista
// Solo cambian los permisos (readOnly=true en odontograma, sin botón de agregar en historia)
import { TabOdontograma } from '@/app/(protected)/pacientes/[id]/tabs/odontograma'
import { TabHistoria } from '@/app/(protected)/pacientes/[id]/tabs/historia'
import { TabArchivos } from '@/app/(protected)/pacientes/[id]/tabs/archivos'

export default function ExpedientePortalPage() {
    const activePatientId = useAuthStore((s) => s.activePatientId)

    // Si por alguna razón no hay paciente activo, no renderiza nada
    // El proxy ya debería haber redirigido a /portal/seleccionar-perfil
    if (!activePatientId) return null

    return (
        <div className="mx-auto max-w-3xl flex flex-col gap-5 pb-8">
            {/* Encabezado */}
            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                    Mi Expediente
                </h1>
                <p className="text-sm text-muted-foreground">
                    Tu historial clínico, odontograma y archivos
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="odontograma">
                <TabsList className="w-full sm:w-fit">
                    <TabsTrigger
                        value="odontograma"
                        className="gap-1.5 flex-1 sm:flex-none"
                    >
                        <Smile className="h-3.5 w-3.5" />
                        Odontograma
                    </TabsTrigger>
                    <TabsTrigger
                        value="historia"
                        className="gap-1.5 flex-1 sm:flex-none"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        Historia Clínica
                    </TabsTrigger>
                    <TabsTrigger
                        value="archivos"
                        className="gap-1.5 flex-1 sm:flex-none"
                    >
                        <FolderOpen className="h-3.5 w-3.5" />
                        Archivos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="odontograma" className="mt-5">
                    {/* readOnly=true — el paciente solo puede ver, no editar */}
                    <TabOdontograma patientId={activePatientId} readOnly />
                </TabsContent>

                <TabsContent value="historia" className="mt-5">
                    {/* El hook useAuthStore dentro de TabHistoria ya detecta
              que el rol es "patient" y oculta los botones de edición */}
                    <TabHistoria patientId={activePatientId} />
                </TabsContent>

                <TabsContent value="archivos" className="mt-5">
                    {/* El paciente puede ver y subir sus propios archivos */}
                    <TabArchivos patientId={activePatientId} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

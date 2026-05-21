'use client'

import { useAuthStore } from '@/store/auth-store'
import { Banknote } from 'lucide-react'

// Reutilizamos el componente de presupuestos que ya tienes armado
import { TabPresupuestos } from '@/app/(protected)/pacientes/[id]/tabs/presupuestos'

export default function PresupuestosPortalPage() {
    const activePatientId = useAuthStore((s) => s.activePatientId)

    // Si por alguna razón no hay paciente activo, no renderiza nada
    // El proxy ya debería haber redirigido a /portal/seleccionar-perfil
    if (!activePatientId) return null

    return (
        <div className="mx-auto max-w-3xl flex flex-col gap-5 pb-8">
            {/* Encabezado */}
            <div className="flex flex-col gap-1">
                <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                    Mis Presupuestos
                </h1>
                <p className="text-sm text-muted-foreground">
                    Consulta los planes de tratamiento y presupuestos asignados
                    a tu cuenta
                </p>
            </div>

            {/* Contenedor principal del componente */}
            <div className="mt-2 bg-card rounded-lg border border-border shadow-sm p-4 sm:p-6">
                {/* 
                  Renderizamos tu componente. 
                  Asumiendo que internamente (igual que TabHistoria) verifica 
                  el rol para ocultar botones de creación/edición, o puedes 
                  pasarle la prop "readOnly" si tu componente lo requiere así.
                */}
                <TabPresupuestos patientId={activePatientId} />
            </div>
        </div>
    )
}

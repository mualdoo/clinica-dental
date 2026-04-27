'use client'

import { useTeeth } from '@/hooks/use-patient'
import { Odontograma } from '@/components/odontograma/odontograma'
import { Loader2 } from 'lucide-react'

// Importa tu SVG como string — con Next.js puedes usar el raw loader
// o simplemente copiar el contenido del SVG en una constante aquí
import { DENTAL_SVG } from '@/components/odontograma/dental-svg'

export function TabOdontograma({ patientId }: { patientId: string }) {
    const { data, isLoading } = useTeeth(patientId)
    const teeth = data?.pages.flatMap((p) => p.data.data) ?? []

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Odontograma
            patientId={patientId}
            teeth={teeth}
            svgContent={DENTAL_SVG}
        />
    )
}

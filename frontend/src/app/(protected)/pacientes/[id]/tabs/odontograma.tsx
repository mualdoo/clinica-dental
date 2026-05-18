'use client'

import { useOdontogramaSocket } from '@/hooks/use-odontograma-socket'
import { Odontograma } from '@/components/odontograma/odontograma'
import { DENTAL_SVG } from '@/components/odontograma/dental-svg'

export function TabOdontograma({ patientId }: { patientId: string }) {
    // El socket actualiza el caché de useTeeth automáticamente
    useOdontogramaSocket(patientId)

    // useTeeth ahora vive dentro de Odontograma
    return <Odontograma patientId={patientId} svgContent={DENTAL_SVG} />
}

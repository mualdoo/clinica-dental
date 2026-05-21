'use client'

import { useOdontogramaSocket } from '@/hooks/use-odontograma-socket'
import { Odontograma } from '@/components/odontograma/odontograma'
import {
    DENTAL_SVG,
    DENTAL_SVG_BUENO,
} from '@/components/odontograma/dental-svg'

export function TabOdontograma({
    patientId,
    readOnly = false,
}: {
    patientId: string
    readOnly?: boolean
}) {
    // El socket actualiza el caché de useTeeth automáticamente
    useOdontogramaSocket(patientId)

    // useTeeth ahora vive dentro de Odontograma
    return (
        <Odontograma
            patientId={patientId}
            svgContent={DENTAL_SVG}
            // svgContent={DENTAL_SVG_BUENO}
            readOnly={readOnly}
        />
    )
}

export type ToothCondition =
    | 'sano'
    | 'caries'
    | 'endodoncia'
    | 'corona'
    | 'extraccion'
    | 'implante'

export const CONDITION_COLORS: Record<ToothCondition, string> = {
    sano: 'transparent',
    caries: '#ef4444',
    endodoncia: '#3b82f6',
    corona: '#f59e0b',
    extraccion: '#6b7280',
    implante: '#10b981',
}

export const CONDITION_LABELS: Record<ToothCondition, string> = {
    sano: 'Sano',
    caries: 'Caries',
    endodoncia: 'Endodoncia',
    corona: 'Corona',
    extraccion: 'Extracción', // Aquí sí mantenemos el acento para la UI
    implante: 'Implante',
}

export function conditionFromString(s: string): ToothCondition {
    const map: Record<string, ToothCondition> = {
        sano: 'sano',
        caries: 'caries',
        endodoncia: 'endodoncia',
        corona: 'corona',
        extraccion: 'extraccion',
        extracción: 'extraccion', // Tolerancia para entradas con o sin acento
        implante: 'implante',
    }

    // Convertimos a minúsculas para asegurar que coincida con el mapa
    return map[s.toLowerCase()] ?? 'sano'
}

export function conditionToString(c: ToothCondition): string {
    const map: Record<ToothCondition, string> = {
        sano: 'sano',
        caries: 'caries',
        endodoncia: 'endodoncia',
        corona: 'corona',
        extraccion: 'extracción', // Retorna con acento si lo necesitas para mostrar en texto plano
        implante: 'implante',
    }
    return map[c]
}

/**
 * Dado un array de dientes, devuelve solo el más reciente por número de diente,
 * opcionalmente filtrando hasta una fecha límite (snapshot).
 * Si snapshotDate es null, devuelve el más reciente sin filtro.
 */
export function buildTeethMap(
    teeth: import('@/types/patient').Tooth[],
    snapshotDate: Date | null
): Record<number, import('@/types/patient').Tooth> {
    // Filtra hasta el final del día elegido
    const limit = snapshotDate
        ? new Date(
              snapshotDate.getFullYear(),
              snapshotDate.getMonth(),
              snapshotDate.getDate(),
              23,
              59,
              59,
              999
          )
        : null

    const filtered = limit
        ? teeth.filter((t) => new Date(t.updatedAt) <= limit)
        : teeth

    // Por cada número de diente, queda solo el más reciente
    return filtered.reduce<Record<number, import('@/types/patient').Tooth>>(
        (acc, tooth) => {
            const existing = acc[tooth.number]
            if (
                !existing ||
                new Date(tooth.updatedAt) > new Date(existing.updatedAt)
            ) {
                acc[tooth.number] = tooth
            }
            return acc
        },
        {}
    )
}

export type ToothCondition =
    | 'healthy'
    | 'cavity'
    | 'endodontics'
    | 'crown'
    | 'extraction'
    | 'implant'

export const CONDITION_COLORS: Record<ToothCondition, string> = {
    healthy: 'transparent',
    cavity: '#ef4444',
    endodontics: '#3b82f6',
    crown: '#f59e0b',
    extraction: '#6b7280',
    implant: '#10b981',
}

export const CONDITION_LABELS: Record<ToothCondition, string> = {
    healthy: 'Sano',
    cavity: 'Caries',
    endodontics: 'Endodoncia',
    crown: 'Corona',
    extraction: 'Extracción',
    implant: 'Implante',
}

export function conditionFromString(s: string): ToothCondition {
    const map: Record<string, ToothCondition> = {
        sano: 'healthy',
        caries: 'cavity',
        endodoncia: 'endodontics',
        corona: 'crown',
        extraccion: 'extraction',
        extracción: 'extraction',
        implante: 'implant',
    }
    return map[s.toLowerCase()] ?? 'healthy'
}

export function conditionToString(c: ToothCondition): string {
    const map: Record<ToothCondition, string> = {
        healthy: 'sano',
        cavity: 'caries',
        endodontics: 'endodoncia',
        crown: 'corona',
        extraction: 'extracción',
        implant: 'implante',
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

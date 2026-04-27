export type ToothCondition =
    | 'healthy'
    | 'cavity'
    | 'endodontics'
    | 'crown'
    | 'extraction'
    | 'implant'

export interface ToothState {
    toothNumber: number // número FDI (11–48)
    condition: ToothCondition
    notes?: string
    surface?: string
}

export interface OdontogramaState {
    [toothNumber: number]: ToothState
}

// Color que se aplica al path del SVG según condición
export const CONDITION_COLORS: Record<ToothCondition, string> = {
    healthy: 'transparent',
    cavity: '#ef4444', // rojo
    endodontics: '#3b82f6', // azul
    crown: '#f59e0b', // ámbar
    extraction: '#6b7280', // gris
    implant: '#10b981', // esmeralda
}

export const CONDITION_LABELS: Record<ToothCondition, string> = {
    healthy: 'Sano',
    cavity: 'Caries',
    endodontics: 'Endodoncia',
    crown: 'Corona',
    extraction: 'Extracción',
    implant: 'Implante',
}

// Qué condición del modelo Tooth del backend mapea a ToothCondition
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

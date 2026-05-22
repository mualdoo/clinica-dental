import { apiClient } from './api-client'
import type {
    Patient,
    ClinicalNote,
    HealthAlert,
    PatientFile,
    Tooth,
    PaginationParams,
    CreatePatientDto,
    PatchPatientDto,
    CreateClinicalNoteDto,
    PatchClinicalNoteDto,
    CreateHealthAlertDto,
    PatchHealthAlertDto,
    CreatePatientFileDto,
    PatchPatientFileDto,
    CreateToothDto,
    PatchToothDto,
    PaginatedPatients,
    PaginatedNotes,
    PaginatedAlerts,
    PaginatedFiles,
    PaginatedTeeth,
} from '@/types/patient'

// ─── Helper ───────────────────────────────────────────────────────────────────
function toQueryString(params: Record<string, unknown>): string {
    const query = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(
            ([k, v]) =>
                `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
        )
        .join('&')
    return query ? `?${query}` : ''
}

type SingleResponse<T> = { success: true; data: T }
type DeleteResponse = { success: true; data: null }

// ─── Patient ──────────────────────────────────────────────────────────────────
export const patientService = {
    getAll: (params: PaginationParams = {}) => {
        const qs = toQueryString({ page: 1, limit: 10, ...params })
        return apiClient<PaginatedPatients>(`/patient${qs}`)
    },
    search: (query: string) =>
        apiClient<PaginatedPatients>(
            `/patient/search?key=${encodeURIComponent(query)}`
        ),

    getById: (id: string) =>
        apiClient<SingleResponse<Patient>>(`/patient/${id}`),

    create: (dto: CreatePatientDto) =>
        apiClient<SingleResponse<Patient>>('/patient', {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    patch: (id: string, dto: PatchPatientDto) =>
        apiClient<SingleResponse<Patient>>(`/patient/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    remove: (id: string) =>
        apiClient<DeleteResponse>(`/patient/${id}`, { method: 'DELETE' }),
}

// ─── Clinical Notes ───────────────────────────────────────────────────────────
export const clinicalNoteService = {
    // Para el portal del paciente
    getAllByPatient: (patientId: string, params: PaginationParams = {}) => {
        const qs = toQueryString({ page: 1, limit: 10, ...params })
        return apiClient<PaginatedNotes>(`/patient/${patientId}/note${qs}`)
    },

    getById: (id: string) =>
        apiClient<SingleResponse<ClinicalNote>>(`/note/${id}`),

    create: (patientId: string, dto: CreateClinicalNoteDto) =>
        apiClient<SingleResponse<ClinicalNote>>(`/patient/${patientId}/note`, {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    patch: (id: string, dto: PatchClinicalNoteDto) =>
        apiClient<SingleResponse<ClinicalNote>>(`/note/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    remove: (id: string) =>
        apiClient<DeleteResponse>(`/note/${id}`, { method: 'DELETE' }),
}

// ─── Health Alerts ────────────────────────────────────────────────────────────
export const healthAlertService = {
    getAllByPatient: (patientId: string, params: PaginationParams = {}) => {
        const qs = toQueryString({ page: 1, limit: 10, ...params })
        return apiClient<PaginatedAlerts>(`/patient/${patientId}/alert${qs}`)
    },

    getById: (id: string) =>
        apiClient<SingleResponse<HealthAlert>>(`/alert/${id}`),

    create: (patientId: string, dto: CreateHealthAlertDto) =>
        apiClient<SingleResponse<HealthAlert>>(`/patient/${patientId}/alert`, {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    patch: (id: string, dto: PatchHealthAlertDto) =>
        apiClient<SingleResponse<HealthAlert>>(`/alert/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    remove: (id: string) =>
        apiClient<DeleteResponse>(`/alert/${id}`, { method: 'DELETE' }),
}

// ─── Patient Files ────────────────────────────────────────────────────────────
export const patientFileService = {
    getAllByPatient: (patientId: string, params: PaginationParams = {}) => {
        const qs = toQueryString({ page: 1, limit: 10, ...params })
        return apiClient<PaginatedFiles>(`/patient/${patientId}/file${qs}`)
    },

    getById: (id: string) =>
        apiClient<SingleResponse<PatientFile>>(`/file/${id}`),

    create: (patientId: string, dto: CreatePatientFileDto) =>
        apiClient<SingleResponse<PatientFile>>(`/patient/${patientId}/file`, {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    send: (id: string) =>
        apiClient<SingleResponse<string>>(`/patient/file/${id}/send`, {
            method: 'POST',
        }),

    patch: (id: string, dto: PatchPatientFileDto) =>
        apiClient<SingleResponse<PatientFile>>(`/patient/file/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    remove: (id: string) =>
        apiClient<DeleteResponse>(`/patient/file/${id}`, { method: 'DELETE' }),
}

// ─── Teeth ────────────────────────────────────────────────────────────────────
export const toothService = {
    getAllByPatient: (patientId: string, params: PaginationParams = {}) => {
        const qs = toQueryString({ page: 1, limit: 10, ...params })
        return apiClient<PaginatedTeeth>(`/patient/${patientId}/tooth${qs}`)
    },

    getById: (id: string) => apiClient<SingleResponse<Tooth>>(`/tooth/${id}`),

    create: (patientId: string, dto: CreateToothDto) =>
        apiClient<SingleResponse<Tooth>>(`/patient/${patientId}/tooth`, {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    patch: (id: string, dto: PatchToothDto) =>
        apiClient<SingleResponse<Tooth>>(`/tooth/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    remove: (id: string) =>
        apiClient<DeleteResponse>(`/tooth/${id}`, { method: 'DELETE' }),
}

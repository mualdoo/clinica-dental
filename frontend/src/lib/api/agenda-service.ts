import { apiClient } from './api-client'
import type {
    Appointment,
    AppointmentParams,
    Cubicle,
    CubicleParams,
    CreateAppointmentDto,
    CreateCubicleDto,
    PatchAppointmentDto,
    PatchCubicleDto,
} from '@/types/agenda'
import { PaginatedResponse } from '@/types/backend-response'

// ─── Helper: convierte un objeto de params a query string ─────────────────────
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

export const appointmentService = {
    getAll: (params: AppointmentParams = {}) => {
        const qs = toQueryString({ page: 1, limit: 10, ...params })
        return apiClient<PaginatedResponse<Appointment>>(
            `/agenda/appointment${qs}`
        )
    },

    getById: (id: string) =>
        apiClient<{ success: true; data: Appointment }>(
            `/agenda/appointment/${id}`
        ),

    create: (dto: CreateAppointmentDto) =>
        apiClient<{ success: true; data: Appointment }>('/agenda/appointment', {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    patch: (id: string, dto: PatchAppointmentDto) =>
        apiClient<{ success: true; data: Appointment }>(
            `/agenda/appointment/${id}`,
            {
                method: 'PATCH',
                body: JSON.stringify(dto),
            }
        ),

    remove: (id: string) =>
        apiClient<{ success: true; data: null }>(`/agenda/appointment/${id}`, {
            method: 'DELETE',
        }),
}

export const cubicleService = {
    getAll: (params: CubicleParams = {}) => {
        const qs = toQueryString({ page: 1, limit: 10, ...params })
        return apiClient<PaginatedResponse<Cubicle>>(`/agenda/cubicle${qs}`)
    },

    getById: (id: string) =>
        apiClient<{ success: true; data: Cubicle }>(`/agenda/cubicle/${id}`),

    create: (dto: CreateCubicleDto) =>
        apiClient<{ success: true; data: Cubicle }>('/agenda/cubicle', {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    patch: (id: string, dto: PatchCubicleDto) =>
        apiClient<{ success: true; data: Cubicle }>(`/agenda/cubicle/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    remove: (id: string) =>
        apiClient<{ success: true; data: null }>(`/agenda/cubicle/${id}`, {
            method: 'DELETE',
        }),
}

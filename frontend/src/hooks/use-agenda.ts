'use client'

import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
    useInfiniteQuery,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { appointmentService, cubicleService } from '@/lib/api/agenda-service'
import type {
    AppointmentParams,
    CubicleParams,
    CreateAppointmentDto,
    CreateCubicleDto,
    PatchAppointmentDto,
    PatchCubicleDto,
} from '@/types/agenda'

// ─── Query keys centralizadas ─────────────────────────────────────────────────
export const agendaKeys = {
    appointments: (params?: AppointmentParams) =>
        ['appointments', params] as const,
    appointment: (id: string) => ['appointments', id] as const,
    cubicles: (params?: CubicleParams) => ['cubicles', params] as const,
    cubicle: (id: string) => ['cubicles', id] as const,
}

export function useAppointments(params: AppointmentParams = {}) {
    return useQuery({
        queryKey: agendaKeys.appointments(params),
        queryFn: () => appointmentService.getAll(params),
        placeholderData: keepPreviousData, // evita parpadeo al cambiar página
    })
}

export function useInfiniteAppointments(
    params: Omit<AppointmentParams, 'page'> = {}
) {
    return useInfiniteQuery({
        // Incluimos los params en la key para que si cambia un filtro, la lista se reinicie
        queryKey: [...agendaKeys.appointments(params), 'infinite'],

        queryFn: ({ pageParam = 1 }) => {
            // Combinamos los filtros estáticos con la página dinámica
            return appointmentService.getAll({
                ...params,
                page: pageParam as number,
                limit: params.limit ?? 10,
            })
        },

        initialPageParam: 1,

        // Lógica para determinar si hay más páginas
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage.data
            return page < totalPages ? page + 1 : undefined
        },

        // Mantenemos la opción para evitar parpadeos al cambiar filtros
        placeholderData: keepPreviousData,
        enabled: params.enabled ?? false,
    })
}

export function useAppointment(id: string) {
    return useQuery({
        queryKey: agendaKeys.appointment(id),
        queryFn: () => appointmentService.getById(id),
        enabled: !!id,
    })
}

export function useCreateAppointment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreateAppointmentDto) =>
            appointmentService.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] })
            toast.success('Cita creada correctamente')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function usePatchAppointment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: PatchAppointmentDto }) =>
            appointmentService.patch(id, dto),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] })
            queryClient.invalidateQueries({
                queryKey: agendaKeys.appointment(id),
            })
            toast.success('Cita actualizada')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useDeleteAppointment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => appointmentService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] })
            toast.success('Cita eliminada')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

// ─── Cubicles ─────────────────────────────────────────────────────────────────
export function useCubicles(params: CubicleParams = {}) {
    return useQuery({
        queryKey: agendaKeys.cubicles(params),
        queryFn: () => cubicleService.getAll(params),
        placeholderData: keepPreviousData,
    })
}

export function useCubicle(id: string) {
    return useQuery({
        queryKey: agendaKeys.cubicle(id),
        queryFn: () => cubicleService.getById(id),
        enabled: !!id,
    })
}

export function useCreateCubicle() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreateCubicleDto) => cubicleService.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cubicles'] })
            toast.success('Cubículo creado correctamente')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function usePatchCubicle() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: PatchCubicleDto }) =>
            cubicleService.patch(id, dto),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['cubicles'] })
            queryClient.invalidateQueries({ queryKey: agendaKeys.cubicle(id) })
            toast.success('Cubículo actualizado')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useDeleteCubicle() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => cubicleService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cubicles'] })
            toast.success('Cubículo eliminado')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

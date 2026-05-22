'use client'

import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    patientService,
    clinicalNoteService,
    healthAlertService,
    patientFileService,
    toothService,
} from '@/lib/api/patient-service'
import type {
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
} from '@/types/patient'

// ─── Query keys ───────────────────────────────────────────────────────────────
export const patientKeys = {
    all: (params?: PaginationParams) => ['patients', params] as const,
    one: (id: string) => ['patients', id] as const,
    notes: (patientId: string) => ['patients', patientId, 'notes'] as const,
    alerts: (patientId: string) => ['patients', patientId, 'alerts'] as const,
    files: (patientId: string) => ['patients', patientId, 'files'] as const,
    teeth: (patientId: string) => ['patients', patientId, 'teeth'] as const,
}

// ─── Helper: página siguiente ─────────────────────────────────────────────────
// Devuelve undefined cuando ya no hay más páginas, lo que le dice a
// useInfiniteQuery que no hay nextPage y deshabilita fetchNextPage.
function getNextPage(lastPage: { data: { page: number; totalPages: number } }) {
    const { page, totalPages } = lastPage.data
    return page < totalPages ? page + 1 : undefined
}

const LIMIT = 10

// ─── Patients ─────────────────────────────────────────────────────────────────
export function usePatients(params: Omit<PaginationParams, 'page'> = {}) {
    return useInfiniteQuery({
        queryKey: patientKeys.all(params),
        queryFn: ({ pageParam }) =>
            patientService.getAll({ ...params, page: pageParam, limit: LIMIT }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
    })
}

export function usePatient(id: string) {
    return useQuery({
        queryKey: patientKeys.one(id),
        queryFn: () => patientService.getById(id),
        enabled: !!id,
    })
}

export function useSearchPatients(query: string) {
    return useQuery({
        queryKey: ['patients', 'search', query],
        queryFn: () => patientService.search(query),
        enabled: query.trim().length >= 2, // no busca con menos de 2 caracteres
        staleTime: 10 * 1000, // caché de 10s para no spamear al backend
    })
}

// ─── Clinical Notes ───────────────────────────────────────────────────────────
export function useClinicalNotes(patientId: string) {
    return useInfiniteQuery({
        queryKey: patientKeys.notes(patientId),
        queryFn: ({ pageParam }) =>
            clinicalNoteService.getAllByPatient(patientId, {
                page: pageParam,
                limit: LIMIT,
            }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
        enabled: !!patientId,
    })
}

// ─── Health Alerts ────────────────────────────────────────────────────────────
export function useHealthAlerts(patientId: string) {
    return useInfiniteQuery({
        queryKey: patientKeys.alerts(patientId),
        queryFn: ({ pageParam }) =>
            healthAlertService.getAllByPatient(patientId, {
                page: pageParam,
                limit: LIMIT,
            }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
        enabled: !!patientId,
    })
}

// ─── Patient Files ────────────────────────────────────────────────────────────
export function usePatientFiles(patientId: string) {
    return useInfiniteQuery({
        queryKey: patientKeys.files(patientId),
        queryFn: ({ pageParam }) =>
            patientFileService.getAllByPatient(patientId, {
                page: pageParam,
                limit: LIMIT,
            }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
        enabled: !!patientId,
    })
}

const TOOTH_LIMIT = 100
// ─── Teeth ────────────────────────────────────────────────────────────────────
export function useTeeth(
    patientId: string,
    params: PaginationParams = { limit: TOOTH_LIMIT }
) {
    return useInfiniteQuery({
        queryKey: patientKeys.teeth(patientId),
        queryFn: ({ pageParam }) =>
            toothService.getAllByPatient(patientId, params),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
        enabled: !!patientId,
    })
}

// ─── Mutaciones (sin cambios) ─────────────────────────────────────────────────
export function useCreatePatient() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreatePatientDto) => patientService.create(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['patients'] })
            toast.success('Paciente creado correctamente')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function usePatchPatient() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: PatchPatientDto }) =>
            patientService.patch(id, dto),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['patients'] })
            qc.invalidateQueries({ queryKey: patientKeys.one(id) })
            toast.success('Paciente actualizado')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useDeletePatient() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => patientService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['patients'] })
            toast.success('Paciente eliminado')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useCreateClinicalNote(patientId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreateClinicalNoteDto) =>
            clinicalNoteService.create(patientId, dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.notes(patientId) })
            toast.success('Nota clínica creada')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function usePatchClinicalNote(patientId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: PatchClinicalNoteDto }) =>
            clinicalNoteService.patch(id, dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.notes(patientId) })
            toast.success('Nota clínica actualizada')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useDeleteClinicalNote(patientId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => clinicalNoteService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.notes(patientId) })
            toast.success('Nota clínica eliminada')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useCreateHealthAlert(patientId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreateHealthAlertDto) =>
            healthAlertService.create(patientId, dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.alerts(patientId) })
            toast.success('Alerta creada')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function usePatchHealthAlert(patientId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: PatchHealthAlertDto }) =>
            healthAlertService.patch(id, dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.alerts(patientId) })
            toast.success('Alerta actualizada')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useDeleteHealthAlert(patientId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => healthAlertService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.alerts(patientId) })
            toast.success('Alerta eliminada')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useCreatePatientFile(patientId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreatePatientFileDto) =>
            patientFileService.create(patientId, dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.files(patientId) })
            toast.success('Archivo registrado')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useSendPatientFile() {
    return useMutation({
        mutationFn: (id: string) => patientFileService.send(id),
        onSuccess: () => {
            toast.success('Archivo enviado')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function usePatchPatientFile(patientId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: PatchPatientFileDto }) =>
            patientFileService.patch(id, dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.files(patientId) })
            toast.success('Archivo actualizado')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useDeletePatientFile(patientId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => patientFileService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.files(patientId) })
            toast.success('Archivo eliminado')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useCreateTooth(patientId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreateToothDto) =>
            toothService.create(patientId, dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.teeth(patientId) })
            toast.success('Diente registrado')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function usePatchTooth(patientId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: PatchToothDto }) =>
            toothService.patch(id, dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.teeth(patientId) })
            toast.success('Diente actualizado')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useDeleteTooth(patientId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => toothService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.teeth(patientId) })
            toast.success('Diente eliminado')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

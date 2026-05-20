'use client'

import {
    useInfiniteQuery,
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    treatmentService,
    quoteService,
    quoteItemService,
    paymentService,
} from '@/lib/api/billing-service'
import type {
    TreatmentParams,
    CreateTreatmentDto,
    PatchTreatmentDto,
    QuoteParams,
    CreateQuoteDto,
    PatchQuoteDto,
    CreateQuoteItemDto,
    PatchQuoteItemDto,
    PaymentParams,
    CreatePaymentDto,
} from '@/types/billing'

// ─── Query keys ───────────────────────────────────────────────────────────────
export const billingKeys = {
    treatments: (p?: TreatmentParams) => ['treatments', p] as const,
    treatment: (id: string) => ['treatments', id] as const,
    quotes: (p?: QuoteParams) => ['quotes', p] as const,
    quote: (id: string) => ['quotes', id] as const,
    quotesByPatient: (patientId: string, p?: QuoteParams) =>
        ['quotes', 'patient', patientId, p] as const,
    quoteItems: (quoteId: string) => ['quote-items', quoteId] as const,
    payments: (p?: PaymentParams) => ['payments', p] as const,
    payment: (id: string) => ['payments', id] as const,
    quotePayments: (quoteId: string) => ['payments', 'quote', quoteId] as const,
}

const LIMIT = 10

// ─── Treatments ───────────────────────────────────────────────────────────────
// useQuery en lugar de infinite — los tratamientos se usan en selectores,
// es más útil tener todos disponibles de una vez
export function useTreatments(params: TreatmentParams = {}) {
    return useQuery({
        queryKey: billingKeys.treatments(params),
        queryFn: () => treatmentService.getAll({ ...params, limit: 100 }),
        placeholderData: keepPreviousData,
        staleTime: 10 * 60 * 1000, // los tratamientos cambian poco
    })
}

export function useTreatment(id: string) {
    return useQuery({
        queryKey: billingKeys.treatment(id),
        queryFn: () => treatmentService.getById(id),
        enabled: !!id,
    })
}

export function useCreateTreatment() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreateTreatmentDto) => treatmentService.create(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['treatments'] })
            toast.success('Tratamiento creado')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

export function usePatchTreatment() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: PatchTreatmentDto }) =>
            treatmentService.patch(id, dto),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['treatments'] })
            qc.invalidateQueries({ queryKey: billingKeys.treatment(id) })
            toast.success('Tratamiento actualizado')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

export function useDeleteTreatment() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => treatmentService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['treatments'] })
            toast.success('Tratamiento eliminado')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

// ─── Quotes ───────────────────────────────────────────────────────────────────
export function useQuotes(params: QuoteParams = {}) {
    return useInfiniteQuery({
        queryKey: billingKeys.quotes(params),
        queryFn: ({ pageParam }) =>
            quoteService.getAll({ ...params, page: pageParam, limit: LIMIT }),
        initialPageParam: 1,
        getNextPageParam: (last) => {
            const { page, totalPages } = last.data
            return page < totalPages ? page + 1 : undefined
        },
    })
}

export function useQuote(id: string) {
    return useQuery({
        queryKey: billingKeys.quote(id),
        queryFn: () => quoteService.getById(id),
        enabled: !!id,
    })
}

export function useQuotesByPatient(
    patientId: string,
    params: QuoteParams = {}
) {
    return useInfiniteQuery({
        queryKey: billingKeys.quotesByPatient(patientId, params),
        queryFn: ({ pageParam }) =>
            quoteService.getByPatient(patientId, {
                ...params,
                page: pageParam,
                limit: LIMIT,
            }),
        initialPageParam: 1,
        getNextPageParam: (last) => {
            const { page, totalPages } = last.data
            return page < totalPages ? page + 1 : undefined
        },
        enabled: !!patientId,
    })
}

export function useCreateQuote() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreateQuoteDto) => quoteService.create(dto),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: ['quotes'] })
            toast.success('Presupuesto creado')
            return res
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

export function usePatchQuote() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: PatchQuoteDto }) =>
            quoteService.patch(id, dto),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['quotes'] })
            qc.invalidateQueries({ queryKey: billingKeys.quote(id) })
            toast.success('Presupuesto actualizado')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

export function useDeleteQuote() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => quoteService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['quotes'] })
            toast.success('Presupuesto eliminado')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

export function useGenerateQuotePdf() {
    return useMutation({
        mutationFn: ({
            quoteId,
            createPatientFile,
        }: {
            quoteId: string
            createPatientFile: boolean
        }) => quoteService.generatePdf(quoteId, createPatientFile),
        onSuccess: (res) => {
            // Abre el PDF en una nueva pestaña automáticamente
            window.open(res.data, '_blank', 'noopener,noreferrer')
            toast.success('PDF generado correctamente')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

// ─── Quote Items ──────────────────────────────────────────────────────────────
// Sin paginación — los items de un presupuesto son pocos y se necesitan todos
export function useQuoteItems(quoteId: string) {
    return useQuery({
        queryKey: billingKeys.quoteItems(quoteId),
        queryFn: () => quoteItemService.getAll({ quoteId, limit: 100 }),
        enabled: !!quoteId,
    })
}

export function useCreateQuoteItem(quoteId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreateQuoteItemDto) =>
            quoteItemService.create(quoteId, dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: billingKeys.quoteItems(quoteId) })
            qc.invalidateQueries({ queryKey: billingKeys.quote(quoteId) }) // el total puede cambiar
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

export function usePatchQuoteItem(quoteId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: PatchQuoteItemDto }) =>
            quoteItemService.patch(id, dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: billingKeys.quoteItems(quoteId) })
            qc.invalidateQueries({ queryKey: billingKeys.quote(quoteId) })
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

export function useDeleteQuoteItem(quoteId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => quoteItemService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: billingKeys.quoteItems(quoteId) })
            qc.invalidateQueries({ queryKey: billingKeys.quote(quoteId) })
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export function usePayments(params: PaymentParams = {}) {
    return useInfiniteQuery({
        queryKey: billingKeys.payments(params),
        queryFn: ({ pageParam }) =>
            paymentService.getAll({ ...params, page: pageParam, limit: LIMIT }),
        initialPageParam: 1,
        getNextPageParam: (last) => {
            const { page, totalPages } = last.data
            return page < totalPages ? page + 1 : undefined
        },
    })
}

// Pagos de un presupuesto específico — útil en tab-presupuestos
export function useQuotePayments(quoteId: string) {
    return useInfiniteQuery({
        queryKey: billingKeys.quotePayments(quoteId),
        queryFn: ({ pageParam }) =>
            paymentService.getAll({ quoteId, page: pageParam, limit: LIMIT }),
        initialPageParam: 1,
        getNextPageParam: (last) => {
            const { page, totalPages } = last.data
            return page < totalPages ? page + 1 : undefined
        },
        enabled: !!quoteId,
    })
}

export function usePayment(id: string) {
    return useQuery({
        queryKey: billingKeys.payment(id),
        queryFn: () => paymentService.getById(id),
        enabled: !!id,
    })
}

// Los pagos son inmutables — solo create, sin patch ni delete
export function useCreatePayment(quoteId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreatePaymentDto) =>
            paymentService.create(quoteId, dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['payments'] })
            qc.invalidateQueries({
                queryKey: billingKeys.quotePayments(quoteId),
            })
            qc.invalidateQueries({ queryKey: billingKeys.quote(quoteId) })
            toast.success('Pago registrado')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

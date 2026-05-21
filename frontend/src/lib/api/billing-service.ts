import { apiClient } from './api-client'
import type {
    Treatment,
    TreatmentParams,
    CreateTreatmentDto,
    PatchTreatmentDto,
    Quote,
    PatientQuote,
    QuoteParams,
    CreateQuoteDto,
    PatchQuoteDto,
    QuoteItem,
    CreateQuoteItemDto,
    PatchQuoteItemDto,
    Payment,
    PaymentParams,
    CreatePaymentDto,
} from '@/types/billing'
import type { PaginatedResponse } from '@/types/backend-response'

type Single<T> = { success: true; data: T }
type Deleted = { success: true; data: null }

function toQS(params: Record<string, unknown>): string {
    const q = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(
            ([k, v]) =>
                `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
        )
        .join('&')
    return q ? `?${q}` : ''
}

// ─── Treatment ────────────────────────────────────────────────────────────────
export const treatmentService = {
    getAll: (params: TreatmentParams = {}) =>
        apiClient<PaginatedResponse<Treatment>>(
            `/billing/treatment${toQS({ page: 1, limit: 10, ...params })}`
        ),

    getById: (id: string) =>
        apiClient<Single<Treatment>>(`/billing/treatment/${id}`),

    create: (dto: CreateTreatmentDto) =>
        apiClient<Single<Treatment>>('/billing/treatment', {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    patch: (id: string, dto: PatchTreatmentDto) =>
        apiClient<Single<Treatment>>(`/billing/treatment/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    remove: (id: string) =>
        apiClient<Deleted>(`/billing/treatment/${id}`, { method: 'DELETE' }),
}

// ─── Quote ────────────────────────────────────────────────────────────────────
export const quoteService = {
    getAll: (params: QuoteParams = {}) =>
        apiClient<PaginatedResponse<PatientQuote>>(
            `/billing/quote${toQS({ page: 1, limit: 10, ...params })}`
        ),

    getById: (id: string) =>
        apiClient<Single<PatientQuote>>(`/billing/quote/${id}`),

    getByPatient: (patientId: string, params: QuoteParams = {}) =>
        apiClient<PaginatedResponse<PatientQuote>>(
            `/billing/quote/patient/${patientId}${toQS({ page: 1, limit: 10, ...params })}`
        ),

    create: (dto: CreateQuoteDto) =>
        apiClient<Single<Quote>>('/billing/quote', {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    patch: (id: string, dto: PatchQuoteDto) =>
        apiClient<Single<Quote>>(`/billing/quote/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    remove: (id: string) =>
        apiClient<Deleted>(`/billing/quote/${id}`, { method: 'DELETE' }),
    // Generar pdf
    generatePdf: (quoteId: string, createPatientFile: boolean) =>
        apiClient<{ success: true; data: string }>(
            `/billing/quote/${quoteId}/generate-pdf`,
            {
                method: 'POST',
                body: JSON.stringify({ createPatientFile }),
            }
        ),
}

// ─── QuoteItem ────────────────────────────────────────────────────────────────
export const quoteItemService = {
    getAll: (params: Record<string, unknown> = {}) =>
        apiClient<PaginatedResponse<QuoteItem>>(
            `/billing/quote-item${toQS({ page: 1, limit: 50, ...params })}`
        ),

    getById: (id: string) =>
        apiClient<Single<QuoteItem>>(`/billing/quote-item/${id}`),

    create: (quoteId: string, dto: CreateQuoteItemDto) =>
        apiClient<Single<QuoteItem>>(`/billing/quote/${quoteId}/item`, {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    patch: (id: string, dto: PatchQuoteItemDto) =>
        apiClient<Single<QuoteItem>>(`/billing/quote-item/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    remove: (id: string) =>
        apiClient<Deleted>(`/billing/quote-item/${id}`, { method: 'DELETE' }),
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export const paymentService = {
    getAll: (params: PaymentParams = {}) =>
        apiClient<PaginatedResponse<Payment>>(
            `/billing/payment${toQS({ page: 1, limit: 10, ...params })}`
        ),

    getById: (id: string) =>
        apiClient<Single<Payment>>(`/billing/payment/${id}`),

    // Los pagos son inmutables — solo se crean
    create: (quoteId: string, dto: CreatePaymentDto) =>
        apiClient<Single<Payment>>(`/billing/quote/${quoteId}/payment`, {
            method: 'POST',
            body: JSON.stringify(dto),
        }),
}

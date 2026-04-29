// ─── Enums ────────────────────────────────────────────────────────────────────
export type PaymentMethod =
    | 'cash'
    | 'card_credit'
    | 'card_debit'
    | 'transfer'
    | 'check'

export type PaymentStatus = 'pending' | 'completed' | 'cancelled' | 'refunded'

export type QuoteStatus =
    | 'draft'
    | 'sent'
    | 'accepted'
    | 'rejected'
    | 'expired'
    | 'paid'

// ─── Modelos ──────────────────────────────────────────────────────────────────
export interface Treatment {
    id: string
    name: string
    unitPrice: number
    duration: number
    isActive: boolean
}

export interface Quote {
    id: string
    patientId: string
    notes: string
    total: number
    status: QuoteStatus
    validUntil: string
}

export interface QuoteItem {
    id: string
    treatmentId: string
    quoteId: string
    toothNumber: number
    discount: number
}

export interface Payment {
    id: string
    amount: number
    method: PaymentMethod
    reference: string
    status: PaymentStatus
    quoteId: string
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateTreatmentDto {
    name: string
    unitPrice: number
    duration: number
    isActive?: boolean
}
export interface PatchTreatmentDto extends Partial<CreateTreatmentDto> {}

export interface CreateQuoteDto {
    patientId: string
    notes?: string
    validUntil: string
    status?: QuoteStatus
}
export interface PatchQuoteDto extends Partial<CreateQuoteDto> {}

export interface CreateQuoteItemDto {
    treatmentId: string
    toothNumber: number
    discount?: number
}
export interface PatchQuoteItemDto extends Partial<CreateQuoteItemDto> {}

export interface CreatePaymentDto {
    amount: number
    method: PaymentMethod
    reference?: string
}

// ─── Parámetros ───────────────────────────────────────────────────────────────
export interface TreatmentParams {
    page?: number
    limit?: number
    isActive?: boolean
}

export interface QuoteParams {
    page?: number
    limit?: number
    status?: QuoteStatus
}

export interface PaymentParams {
    page?: number
    limit?: number
    status?: PaymentStatus
    quoteId?: string
}

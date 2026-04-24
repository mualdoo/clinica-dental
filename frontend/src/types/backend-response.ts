// ─── Respuesta paginada genérica ──────────────────────────────────────────────
export interface PaginatedResponse<T> {
    success: true
    data: {
        data: T[]
        total: number
        page: number
        totalPages: number
    }
}

export interface ErrorResponse {
    success: false
    error: string
    details: JSON
}

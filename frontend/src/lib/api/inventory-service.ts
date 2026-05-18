import { apiClient } from './api-client'
import type {
    Supplier,
    SupplierParams,
    CreateSupplierDto,
    PatchSupplierDto,
    Item,
    ItemParams,
    CreateItemDto,
    PatchItemDto,
    StockMovement,
    MovementParams,
    CreateMovementDto,
    PurchaseOrder,
    OrderParams,
    PatchOrderStatusDto,
    CreateOrderDto,
} from '@/types/inventory'
import type { PaginatedResponse } from '@/types/backend-response'

type Single<T> = { success: true; data: T }

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

// ─── Supplier ─────────────────────────────────────────────────────────────────
export const supplierService = {
    getAll: (params: SupplierParams = {}) =>
        apiClient<PaginatedResponse<Supplier>>(
            `/supplier${toQS({ page: 1, limit: 10, ...params })}`
        ),

    getById: (id: string) => apiClient<Single<Supplier>>(`/supplier/${id}`),

    create: (dto: CreateSupplierDto) =>
        apiClient<Single<Supplier>>('/supplier', {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    patch: (id: string, dto: PatchSupplierDto) =>
        apiClient<Single<Supplier>>(`/supplier/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    remove: (id: string) =>
        apiClient<{ success: true; data: null }>(`/supplier/${id}`, {
            method: 'DELETE',
        }),
}

// ─── Item ─────────────────────────────────────────────────────────────────────
export const itemService = {
    getAll: (params: ItemParams = {}) =>
        apiClient<PaginatedResponse<Item>>(
            `/item${toQS({ page: 1, limit: 10, ...params })}`
        ),

    getById: (id: string) => apiClient<Single<Item>>(`/item/${id}`),

    // POST /supplier/:id/item
    create: (supplierId: string, dto: CreateItemDto) =>
        apiClient<Single<Item>>(`/supplier/${supplierId}/item`, {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    patch: (id: string, dto: PatchItemDto) =>
        apiClient<Single<Item>>(`/item/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    remove: (id: string) =>
        apiClient<{ success: true; data: null }>(`/item/${id}`, {
            method: 'DELETE',
        }),
}

// ─── StockMovement ────────────────────────────────────────────────────────────
export const movementService = {
    getAll: (params: MovementParams = {}) =>
        apiClient<PaginatedResponse<StockMovement>>(
            `/movement${toQS({ page: 1, limit: 10, ...params })}`
        ),

    // POST /item/:id/movement
    create: (itemId: string, dto: CreateMovementDto) =>
        apiClient<Single<StockMovement>>(`/item/${itemId}/movement`, {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    // Sin patch ni delete — los movimientos son inmutables
}

// ─── PurchaseOrder ────────────────────────────────────────────────────────────
export const orderService = {
    getAll: (params: OrderParams = {}) =>
        apiClient<PaginatedResponse<PurchaseOrder>>(
            `/order${toQS({ page: 1, limit: 10, ...params })}`
        ),

    getById: (id: string) => apiClient<Single<PurchaseOrder>>(`/order/${id}`),

    // POST /item/:id/order
    create: (itemId: string, dto: CreateOrderDto) =>
        apiClient<Single<PurchaseOrder>>(`/item/${itemId}/order`, {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    // PATCH /order/:id/status — solo cambia el status, nunca desde "received"
    patchStatus: (id: string, dto: PatchOrderStatusDto) =>
        apiClient<Single<PurchaseOrder>>(`/order/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    // Sin delete
}

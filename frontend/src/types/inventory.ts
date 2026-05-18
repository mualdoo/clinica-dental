// ─── Enums ────────────────────────────────────────────────────────────────────
export type ItemUnit = 'caja' | 'pieza' | 'frasco' | 'rollo'

export type MovementType = 'compra' | 'consumo' | 'ajuste'

export type OrderStatus =
    | 'draft'
    | 'sent'
    | 'confirmed'
    | 'received'
    | 'cancelled'

// ─── Modelos ──────────────────────────────────────────────────────────────────
export interface Supplier {
    id: string
    name: string
    email: string
    address: string
    phone?: string
}

export interface Item {
    id: string
    supplierId: string
    name: string
    unit: ItemUnit
    unitCost: number
    stockCurrent: number
    stockMinimum: number
    location: string
    expiryDate?: string
}

export interface StockMovement {
    id: string
    itemId: string
    type: MovementType
    quantity: number
    reason?: string
}

export interface PurchaseOrder {
    id: string
    itemId: string
    quantity: number
    status: OrderStatus
    totalAmount: number
}

// ─── Parámetros ───────────────────────────────────────────────────────────────
export interface PaginationParams {
    page?: number
    limit?: number
}

export interface SupplierParams extends PaginationParams {}

export interface ItemParams extends PaginationParams {
    supplierId?: string
    lowStock?: boolean // filtra items con stockCurrent <= stockMinimum
}

export interface MovementParams extends PaginationParams {
    itemId?: string
    type?: MovementType
}

export interface OrderParams extends PaginationParams {
    itemId?: string
    status?: OrderStatus
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateSupplierDto {
    name: string
    email: string
    address: string
    phone?: string
}
export interface PatchSupplierDto extends Partial<CreateSupplierDto> {}

export interface CreateItemDto {
    name: string
    unit: ItemUnit
    unitCost: number
    stockCurrent: number
    stockMinimum: number
    location: string
    expiryDate?: string
}
export interface PatchItemDto extends Partial<CreateItemDto> {}

export interface CreateMovementDto {
    type: MovementType
    quantity: number
    reason?: string
}

export interface CreateOrderDto {
    quantity: number
}

// Solo se puede cambiar el status y nunca desde "received"
export interface PatchOrderStatusDto {
    status: Exclude<OrderStatus, 'received'>
}

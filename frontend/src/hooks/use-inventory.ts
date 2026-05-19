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
    supplierService,
    itemService,
    movementService,
    orderService,
} from '@/lib/api/inventory-service'
import type {
    SupplierParams,
    CreateSupplierDto,
    PatchSupplierDto,
    ItemParams,
    CreateItemDto,
    PatchItemDto,
    MovementParams,
    CreateMovementDto,
    OrderParams,
    CreateOrderDto,
    PatchOrderStatusDto,
    OrderStatus,
} from '@/types/inventory'

const LIMIT = 10

// ─── Query keys ───────────────────────────────────────────────────────────────
export const inventoryKeys = {
    suppliers: (p?: SupplierParams) => ['suppliers', p] as const,
    supplier: (id: string) => ['suppliers', id] as const,
    items: (p?: ItemParams) => ['items', p] as const,
    item: (id: string) => ['items', id] as const,
    movements: (p?: MovementParams) => ['movements', p] as const,
    orders: (p?: OrderParams) => ['orders', p] as const,
    order: (id: string) => ['orders', id] as const,
}

// ─── Helpers internos ─────────────────────────────────────────────────────────
function getNextPage(last: { data: { page: number; totalPages: number } }) {
    const { page, totalPages } = last.data
    return page < totalPages ? page + 1 : undefined
}

// ─── Suppliers ────────────────────────────────────────────────────────────────
export function useSuppliers(params: SupplierParams = {}) {
    return useInfiniteQuery({
        queryKey: inventoryKeys.suppliers(params),
        queryFn: ({ pageParam }) =>
            supplierService.getAll({
                ...params,
                page: pageParam,
                limit: LIMIT,
            }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
        placeholderData: keepPreviousData,
    })
}

export function useSupplier(id: string) {
    return useQuery({
        queryKey: inventoryKeys.supplier(id),
        queryFn: () => supplierService.getById(id),
        enabled: !!id,
    })
}

export function useCreateSupplier() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreateSupplierDto) => supplierService.create(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['suppliers'] })
            toast.success('Proveedor creado')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

export function usePatchSupplier() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: PatchSupplierDto }) =>
            supplierService.patch(id, dto),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['suppliers'] })
            qc.invalidateQueries({ queryKey: inventoryKeys.supplier(id) })
            toast.success('Proveedor actualizado')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

export function useDeleteSupplier() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => supplierService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['suppliers'] })
            toast.success('Proveedor eliminado')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

// ─── Items ────────────────────────────────────────────────────────────────────
export function useItems(params: ItemParams = {}) {
    return useInfiniteQuery({
        queryKey: inventoryKeys.items(params),
        queryFn: ({ pageParam }) =>
            itemService.getAll({ ...params, page: pageParam, limit: LIMIT }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
        placeholderData: keepPreviousData,
    })
}

export function useItem(id: string) {
    return useQuery({
        queryKey: inventoryKeys.item(id),
        queryFn: () => itemService.getById(id),
        enabled: !!id,
    })
}

export function useCreateItem() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            supplierId,
            dto,
        }: {
            supplierId: string
            dto: CreateItemDto
        }) => itemService.create(supplierId, dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['items'] })
            toast.success('Artículo creado')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

export function usePatchItem() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: PatchItemDto }) =>
            itemService.patch(id, dto),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['items'] })
            qc.invalidateQueries({ queryKey: inventoryKeys.item(id) })
            toast.success('Artículo actualizado')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

export function useDeleteItem() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => itemService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['items'] })
            toast.success('Artículo eliminado')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

// ─── StockMovements ───────────────────────────────────────────────────────────
// useQuery en lugar de infinite — los movimientos se ven como log completo
export function useMovements(params: MovementParams = {}) {
    return useInfiniteQuery({
        queryKey: inventoryKeys.movements(params),
        queryFn: ({ pageParam }) =>
            movementService.getAll({
                ...params,
                page: pageParam,
                limit: LIMIT,
            }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
    })
}

export function useCreateMovement(itemId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreateMovementDto) =>
            movementService.create(itemId, dto),
        onSuccess: () => {
            // Invalida el item para reflejar el nuevo stockCurrent
            qc.invalidateQueries({ queryKey: ['items'] })
            qc.invalidateQueries({ queryKey: inventoryKeys.movements() })
            toast.success('Movimiento registrado')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

// ─── PurchaseOrders ───────────────────────────────────────────────────────────
export function useOrders(params: OrderParams = {}) {
    return useInfiniteQuery({
        queryKey: inventoryKeys.orders(params),
        queryFn: ({ pageParam }) =>
            orderService.getAll({ ...params, page: pageParam, limit: LIMIT }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
        placeholderData: keepPreviousData,
    })
}

export function useOrder(id: string) {
    return useQuery({
        queryKey: inventoryKeys.order(id),
        queryFn: () => orderService.getById(id),
        enabled: !!id,
    })
}

export function useCreateOrder(itemId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreateOrderDto) => orderService.create(itemId, dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['orders'] })
            toast.success('Orden de compra creada')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

export function usePatchOrderStatus() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: PatchOrderStatusDto }) => {
            return orderService.patchStatus(id, dto)
        },
        onSuccess: (res, { id }) => {
            qc.invalidateQueries({ queryKey: ['orders'] })
            qc.invalidateQueries({ queryKey: inventoryKeys.order(id) })

            // Si se recibió la orden, el stock cambió — invalida items también
            if ((res.data as any).status === 'received') {
                qc.invalidateQueries({ queryKey: ['items'] })
                toast.success('Orden recibida — stock actualizado')
            } else {
                toast.success('Estado de orden actualizado')
            }
        },
        onError: (e: Error) => toast.error(e.message),
    })
}

// ─── Helper: transiciones válidas de status ───────────────────────────────────
// Útil para deshabilitar botones en la UI según el estado actual
export function getValidTransitions(current: OrderStatus): OrderStatus[] {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
        draft: ['received', 'sent', 'cancelled'],
        sent: ['received', 'confirmed', 'cancelled'],
        confirmed: ['received', 'cancelled'],
        received: [], // inmutable
        cancelled: [], // inmutable
    }
    return transitions[current] ?? []
}

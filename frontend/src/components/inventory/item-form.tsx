'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useSuppliers } from '@/hooks/use-inventory'
import type { Item, ItemUnit } from '@/types/inventory'

const UNITS: { value: ItemUnit; label: string }[] = [
    { value: 'caja', label: 'Caja' },
    { value: 'pieza', label: 'Pieza' },
    { value: 'frasco', label: 'Frasco' },
    { value: 'rollo', label: 'Rollo' },
]

const schema = z.object({
    supplierId: z.string().min(1, 'Selecciona un proveedor'),
    name: z.string().min(1, 'El nombre es requerido'),
    unit: z.enum(['caja', 'pieza', 'frasco', 'rollo']),
    unitCost: z
        .number('Ingresa un costo válido')
        .min(0, 'No puede ser negativo'),
    stockMinimum: z
        .number('Ingresa un valor válido')
        .min(0, 'No puede ser negativo'),
    location: z.string().min(1, 'La ubicación es requerida'),
    expiryDate: z.string().optional(),
})

export type ItemFormValues = z.infer<typeof schema>

interface ItemFormProps {
    initialData?: Item
    defaultSupplierId?: string
    isLoading: boolean
    onSubmit: (v: ItemFormValues) => void
    onCancel: () => void
}

export function ItemForm({
    initialData,
    defaultSupplierId,
    isLoading,
    onSubmit,
    onCancel,
}: ItemFormProps) {
    const { data: suppliersData } = useSuppliers()
    const suppliers = suppliersData?.pages.flatMap((p) => p.data.data) ?? []

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<ItemFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            supplierId: initialData?.supplierId ?? defaultSupplierId ?? '',
            name: initialData?.name ?? '',
            unit: initialData?.unit ?? 'pieza',
            unitCost: initialData?.unitCost,
            stockMinimum: initialData?.stockMinimum,
            location: initialData?.location ?? '',
            expiryDate: initialData?.expiryDate ?? '',
        },
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Proveedor (Select) */}
            <div className="flex flex-col gap-2">
                <Label
                    htmlFor="supplierId"
                    className={errors.supplierId ? 'text-destructive' : ''}
                >
                    Proveedor
                </Label>
                <Controller
                    control={control}
                    name="supplierId"
                    render={({ field }) => (
                        <Select
                            value={field.value}
                            onValueChange={field.onChange}
                        >
                            <SelectTrigger
                                id="supplierId"
                                className={
                                    errors.supplierId
                                        ? 'border-destructive focus:ring-destructive'
                                        : ''
                                }
                            >
                                <SelectValue placeholder="Seleccionar proveedor…" />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.supplierId && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                        {errors.supplierId.message}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Nombre del artículo */}
                <div className="flex flex-col gap-2 col-span-2">
                    <Label
                        htmlFor="name"
                        className={errors.name ? 'text-destructive' : ''}
                    >
                        Nombre del artículo
                    </Label>
                    <Input
                        id="name"
                        placeholder="Guantes de nitrilo, Jeringas…"
                        {...register('name')}
                        className={
                            errors.name
                                ? 'border-destructive focus-visible:ring-destructive'
                                : ''
                        }
                    />
                    {errors.name && (
                        <p className="text-[0.8rem] font-medium text-destructive">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* Unidad (Select) */}
                <div className="flex flex-col gap-2">
                    <Label
                        htmlFor="unit"
                        className={errors.unit ? 'text-destructive' : ''}
                    >
                        Unidad
                    </Label>
                    <Controller
                        control={control}
                        name="unit"
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger
                                    id="unit"
                                    className={
                                        errors.unit
                                            ? 'border-destructive focus:ring-destructive'
                                            : ''
                                    }
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {UNITS.map((u) => (
                                        <SelectItem
                                            key={u.value}
                                            value={u.value}
                                        >
                                            {u.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.unit && (
                        <p className="text-[0.8rem] font-medium text-destructive">
                            {errors.unit.message}
                        </p>
                    )}
                </div>

                {/* Costo Unitario */}
                <div className="flex flex-col gap-2">
                    <Label
                        htmlFor="unitCost"
                        className={errors.unitCost ? 'text-destructive' : ''}
                    >
                        Costo unitario
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            $
                        </span>
                        <Input
                            id="unitCost"
                            type="number"
                            min={0}
                            step={0.01}
                            className={`pl-6 ${errors.unitCost ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            {...register('unitCost', { valueAsNumber: true })}
                        />
                    </div>
                    {errors.unitCost && (
                        <p className="text-[0.8rem] font-medium text-destructive">
                            {errors.unitCost.message}
                        </p>
                    )}
                </div>

                {/* Stock Mínimo */}
                <div className="flex flex-col gap-2">
                    <Label
                        htmlFor="stockMinimum"
                        className={
                            errors.stockMinimum ? 'text-destructive' : ''
                        }
                    >
                        Stock mínimo
                    </Label>
                    <Input
                        id="stockMinimum"
                        type="number"
                        min={0}
                        className={
                            errors.stockMinimum
                                ? 'border-destructive focus-visible:ring-destructive'
                                : ''
                        }
                        {...register('stockMinimum', { valueAsNumber: true })}
                    />
                    <p className="text-[11px] text-muted-foreground">
                        Alerta de stock bajo
                    </p>
                    {errors.stockMinimum && (
                        <p className="text-[0.8rem] font-medium text-destructive">
                            {errors.stockMinimum.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Ubicación */}
            <div className="flex flex-col gap-2">
                <Label
                    htmlFor="location"
                    className={errors.location ? 'text-destructive' : ''}
                >
                    Ubicación
                </Label>
                <Input
                    id="location"
                    placeholder="Estante A, Cajón 3…"
                    {...register('location')}
                    className={
                        errors.location
                            ? 'border-destructive focus-visible:ring-destructive'
                            : ''
                    }
                />
                {errors.location && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                        {errors.location.message}
                    </p>
                )}
            </div>

            {/* Fecha de caducidad */}
            <div className="flex flex-col gap-2">
                <Label
                    htmlFor="expiryDate"
                    className={errors.expiryDate ? 'text-destructive' : ''}
                >
                    Fecha de caducidad{' '}
                    <span className="text-muted-foreground text-xs">
                        (opcional)
                    </span>
                </Label>
                <Input
                    id="expiryDate"
                    type="date"
                    {...register('expiryDate')}
                    className={
                        errors.expiryDate
                            ? 'border-destructive focus-visible:ring-destructive'
                            : ''
                    }
                />
                {errors.expiryDate && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                        {errors.expiryDate.message}
                    </p>
                )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-1">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onCancel}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 gap-2"
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {initialData ? 'Guardar cambios' : 'Crear artículo'}
                </Button>
            </div>
        </form>
    )
}

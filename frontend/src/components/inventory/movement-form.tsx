'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { MovementType } from '@/types/inventory'

const TYPES: { value: MovementType; label: string; description: string }[] = [
    {
        value: 'compra',
        label: 'Compra',
        description: 'Entrada de stock por compra',
    },
    {
        value: 'consumo',
        label: 'Consumo',
        description: 'Salida por uso en clínica',
    },
    {
        value: 'ajuste',
        label: 'Ajuste',
        description: 'Corrección manual de inventario',
    },
]

const schema = z.object({
    type: z.enum(['compra', 'consumo', 'ajuste']),
    quantity: z
        .number('Ingresa una cantidad válida')
        .min(1, 'La cantidad debe ser al menos 1'),
    reason: z.string().optional(),
})

export type MovementFormValues = z.infer<typeof schema>

interface MovementFormProps {
    itemName: string
    isLoading: boolean
    onSubmit: (v: MovementFormValues) => void
    onCancel: () => void
}

export function MovementForm({
    itemName,
    isLoading,
    onSubmit,
    onCancel,
}: MovementFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<MovementFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { type: 'consumo', quantity: 1, reason: '' },
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Información del artículo */}
            <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Artículo</p>
                <p className="text-sm font-semibold text-foreground">
                    {itemName}
                </p>
            </div>

            {/* Tipo de movimiento (Select) */}
            <div className="flex flex-col gap-2">
                <Label
                    htmlFor="type"
                    className={errors.type ? 'text-destructive' : ''}
                >
                    Tipo de movimiento
                </Label>
                <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                        <Select
                            value={field.value}
                            onValueChange={field.onChange}
                        >
                            <SelectTrigger
                                id="type"
                                className={
                                    errors.type
                                        ? 'border-destructive focus:ring-destructive'
                                        : ''
                                }
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        <div className="flex flex-col">
                                            <span>{t.label}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {t.description}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.type && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                        {errors.type.message}
                    </p>
                )}
            </div>

            {/* Cantidad */}
            <div className="flex flex-col gap-2">
                <Label
                    htmlFor="quantity"
                    className={errors.quantity ? 'text-destructive' : ''}
                >
                    Cantidad
                </Label>
                <Input
                    id="quantity"
                    type="number"
                    min={1}
                    {...register('quantity', { valueAsNumber: true })}
                    className={
                        errors.quantity
                            ? 'border-destructive focus-visible:ring-destructive'
                            : ''
                    }
                />
                {errors.quantity && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                        {errors.quantity.message}
                    </p>
                )}
            </div>

            {/* Motivo */}
            <div className="flex flex-col gap-2">
                <Label
                    htmlFor="reason"
                    className={errors.reason ? 'text-destructive' : ''}
                >
                    Motivo{' '}
                    <span className="text-muted-foreground text-xs">
                        (opcional)
                    </span>
                </Label>
                <Textarea
                    id="reason"
                    placeholder="Descripción del movimiento…"
                    rows={2}
                    {...register('reason')}
                    className={`resize-none ${errors.reason ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.reason && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                        {errors.reason.message}
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
                    Registrar movimiento
                </Button>
            </div>
        </form>
    )
}

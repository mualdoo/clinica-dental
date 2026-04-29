'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import type { Treatment } from '@/types/billing'

// ─── Schema ───────────────────────────────────────────────────────────────────
const treatmentSchema = z.object({
    name: z
        .string()
        .min(1, 'El nombre es requerido')
        .max(100, 'Máximo 100 caracteres'),
    unitPrice: z
        .number('El precio unitario es requerido')
        .min(0, 'El precio no puede ser negativo'),
    duration: z
        .number('La duración es requerida')
        .min(1, 'La duración mínima es 1 minuto'),
    isActive: z.boolean(),
})

export type TreatmentFormValues = z.infer<typeof treatmentSchema>

interface TreatmentFormProps {
    initialData?: Treatment
    isLoading: boolean
    onSubmit: (values: TreatmentFormValues) => void
    onCancel: () => void
}

export function TreatmentForm({
    initialData,
    isLoading,
    onSubmit,
    onCancel,
}: TreatmentFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<TreatmentFormValues>({
        resolver: zodResolver(treatmentSchema),
        defaultValues: {
            name: initialData?.name ?? '',
            // Dejamos unitPrice como undefined si no hay initialData para que el input muestre el placeholder vacío
            unitPrice: initialData?.unitPrice,
            // Dejamos 30 por defecto como valor inicial sugerido para la duración
            duration: initialData?.duration ?? 30,
            isActive: initialData?.isActive ?? true,
        },
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Campo: Nombre */}
            <div className="flex flex-col gap-2">
                <Label
                    htmlFor="name"
                    className={errors.name ? 'text-destructive' : ''}
                >
                    Nombre del tratamiento
                </Label>
                <Input
                    id="name"
                    placeholder="Ej. Limpieza dental, Endodoncia…"
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

            <div className="grid grid-cols-2 gap-4">
                {/* Campo: Precio unitario */}
                <div className="flex flex-col gap-2">
                    <Label
                        htmlFor="unitPrice"
                        className={errors.unitPrice ? 'text-destructive' : ''}
                    >
                        Precio unitario (MXN)
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            $
                        </span>
                        <Input
                            id="unitPrice"
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            {...register('unitPrice', { valueAsNumber: true })}
                            className={`pl-6 ${errors.unitPrice ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                    </div>
                    {errors.unitPrice && (
                        <p className="text-[0.8rem] font-medium text-destructive">
                            {errors.unitPrice.message}
                        </p>
                    )}
                </div>

                {/* Campo: Duración */}
                <div className="flex flex-col gap-2">
                    <Label
                        htmlFor="duration"
                        className={errors.duration ? 'text-destructive' : ''}
                    >
                        Duración (min)
                    </Label>
                    <div className="relative">
                        <Input
                            id="duration"
                            type="number"
                            min={1}
                            placeholder="30"
                            {...register('duration', { valueAsNumber: true })}
                            className={`pr-10 ${errors.duration ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            min
                        </span>
                    </div>
                    {errors.duration && (
                        <p className="text-[0.8rem] font-medium text-destructive">
                            {errors.duration.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Campo: Activo (Switch) */}
            <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                            <Label
                                htmlFor="isActive-switch"
                                className="text-sm font-medium cursor-pointer"
                            >
                                Tratamiento activo
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Los tratamientos inactivos no aparecen al
                                generar presupuestos
                            </p>
                        </div>
                        <Switch
                            id="isActive-switch"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </div>
                )}
            />

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
                    {initialData ? 'Guardar cambios' : 'Crear tratamiento'}
                </Button>
            </div>
        </form>
    )
}

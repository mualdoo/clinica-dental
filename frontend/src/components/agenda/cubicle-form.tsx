'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import type { Cubicle } from '@/types/agenda'

// ─── Schema ───────────────────────────────────────────────────────────────────
const cubicleSchema = z.object({
    number: z
        .number('El número de cubículo es requerido')
        .positive('Debe ser mayor a 0')
        .int('Debe ser un número entero'),
    name: z
        .string()
        .min(1, 'El nombre es requerido')
        .max(50, 'Máximo 50 caracteres'),
    isActive: z.boolean(),
})

export type CubicleFormValues = z.infer<typeof cubicleSchema>

interface CubicleFormProps {
    // Si se pasa initialData es modo edición
    initialData?: Cubicle
    isLoading: boolean
    onSubmit: (values: CubicleFormValues) => void
    onCancel: () => void
}

export function CubicleForm({
    initialData,
    isLoading,
    onSubmit,
    onCancel,
}: CubicleFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CubicleFormValues>({
        resolver: zodResolver(cubicleSchema),
        defaultValues: {
            number: initialData?.number,
            name: initialData?.name ?? '',
            isActive: initialData?.isActive ?? true,
        },
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Campo: Número */}
            <div className="flex flex-col gap-2">
                <Label
                    htmlFor="number"
                    className={errors.number ? 'text-destructive' : ''}
                >
                    Número de cubículo
                </Label>
                <Input
                    min={1}
                    id="number"
                    type="number"
                    placeholder="Ej. 1"
                    {...register('number', { valueAsNumber: true })}
                    className={
                        errors.number
                            ? 'border-destructive focus-visible:ring-destructive'
                            : ''
                    }
                />
                {errors.number && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                        {errors.number.message}
                    </p>
                )}
            </div>

            {/* Campo: Nombre */}
            <div className="flex flex-col gap-2">
                <Label
                    htmlFor="name"
                    className={errors.name ? 'text-destructive' : ''}
                >
                    Nombre del cubículo
                </Label>
                <Input
                    id="name"
                    placeholder="Ej. Cubículo principal…"
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
                                Cubículo activo
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Los cubículos inactivos no aparecen al agendar
                                citas
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
                    {initialData ? 'Guardar cambios' : 'Crear cubículo'}
                </Button>
            </div>
        </form>
    )
}

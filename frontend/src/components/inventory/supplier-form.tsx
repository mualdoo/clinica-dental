'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Supplier } from '@/types/inventory'

const schema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Correo inválido'),
    address: z.string().min(1, 'La dirección es requerida'),
    phone: z.string().optional(),
})

export type SupplierFormValues = z.infer<typeof schema>

interface SupplierFormProps {
    initialData?: Supplier
    isLoading: boolean
    onSubmit: (v: SupplierFormValues) => void
    onCancel: () => void
}

export function SupplierForm({
    initialData,
    isLoading,
    onSubmit,
    onCancel,
}: SupplierFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SupplierFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: initialData?.name ?? '',
            email: initialData?.email ?? '',
            address: initialData?.address ?? '',
            phone: initialData?.phone ?? '',
        },
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Campo: Nombre */}
                <div className="flex flex-col gap-2">
                    <Label
                        htmlFor="name"
                        className={errors.name ? 'text-destructive' : ''}
                    >
                        Nombre
                    </Label>
                    <Input
                        id="name"
                        placeholder="Proveedor ABC"
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

                {/* Campo: Correo */}
                <div className="flex flex-col gap-2">
                    <Label
                        htmlFor="email"
                        className={errors.email ? 'text-destructive' : ''}
                    >
                        Correo
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="contacto@proveedor.com"
                        {...register('email')}
                        className={
                            errors.email
                                ? 'border-destructive focus-visible:ring-destructive'
                                : ''
                        }
                    />
                    {errors.email && (
                        <p className="text-[0.8rem] font-medium text-destructive">
                            {errors.email.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Campo: Dirección */}
            <div className="flex flex-col gap-2">
                <Label
                    htmlFor="address"
                    className={errors.address ? 'text-destructive' : ''}
                >
                    Dirección
                </Label>
                <Input
                    id="address"
                    placeholder="Calle, número, ciudad"
                    {...register('address')}
                    className={
                        errors.address
                            ? 'border-destructive focus-visible:ring-destructive'
                            : ''
                    }
                />
                {errors.address && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                        {errors.address.message}
                    </p>
                )}
            </div>

            {/* Campo: Teléfono */}
            <div className="flex flex-col gap-2">
                <Label
                    htmlFor="phone"
                    className={errors.phone ? 'text-destructive' : ''}
                >
                    Teléfono{' '}
                    <span className="text-muted-foreground text-xs">
                        (opcional)
                    </span>
                </Label>
                <Input
                    id="phone"
                    placeholder="555 000 0000"
                    {...register('phone')}
                    className={
                        errors.phone
                            ? 'border-destructive focus-visible:ring-destructive'
                            : ''
                    }
                />
                {errors.phone && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                        {errors.phone.message}
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
                    {initialData ? 'Guardar cambios' : 'Crear proveedor'}
                </Button>
            </div>
        </form>
    )
}

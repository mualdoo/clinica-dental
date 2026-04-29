'use client'

import * as React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useCubicles } from '@/hooks/use-agenda'
import { Loader2, DoorOpen } from 'lucide-react'

interface CubicleSelectorProps {
    value?: string
    onValueChange: (value: string) => void
    defaultValue?: string
}

export function CubicleSelector({
    value,
    onValueChange,
    defaultValue,
}: CubicleSelectorProps) {
    const { data: response, isLoading, isError } = useCubicles()

    // Accedemos a la data siguiendo tu estructura: response.data.data
    const cubicles = response?.data?.data || []

    return (
        <Select
            value={value}
            onValueChange={onValueChange}
            defaultValue={defaultValue}
            disabled={isLoading}
        >
            <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <DoorOpen className="h-4 w-4 text-muted-foreground" />
                    )}
                    <SelectValue
                        placeholder={
                            isLoading
                                ? 'Cargando salas...'
                                : 'Seleccionar cubículo'
                        }
                    />
                </div>
            </SelectTrigger>

            <SelectContent>
                {isError && (
                    <div className="p-2 text-xs text-destructive text-center">
                        Error al cargar cubículos
                    </div>
                )}

                {cubicles.length === 0 && !isLoading && (
                    <div className="p-2 text-xs text-muted-foreground text-center">
                        No hay cubículos registrados
                    </div>
                )}

                {cubicles.map((cubicle: any) => (
                    <SelectItem key={cubicle.id} value={cubicle.id}>
                        {cubicle.name}{' '}
                        {cubicle.description ? `(${cubicle.description})` : ''}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

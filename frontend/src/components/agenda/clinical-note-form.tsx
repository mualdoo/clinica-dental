'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { ClinicalNote } from '@/types/patient'

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
    subjective: z.string().min(1, 'Campo requerido'),
    objective: z.string().min(1, 'Campo requerido'),
    assessment: z.string().min(1, 'Campo requerido'),
    plan: z.string().min(1, 'Campo requerido'),
})

export type ClinicalNoteFormValues = z.infer<typeof schema>

const FIELDS: {
    name: keyof ClinicalNoteFormValues
    label: string
    description: string
    placeholder: string
}[] = [
    {
        name: 'subjective',
        label: 'Subjetivo',
        description:
            'Lo que el paciente reporta: síntomas, molestias, historial.',
        placeholder: 'El paciente refiere dolor en…',
    },
    {
        name: 'objective',
        label: 'Objetivo',
        description: 'Hallazgos clínicos observables y medibles.',
        placeholder: 'A la exploración se observa…',
    },
    {
        name: 'assessment',
        label: 'Evaluación',
        description: 'Diagnóstico o interpretación clínica.',
        placeholder: 'Se diagnostica…',
    },
    {
        name: 'plan',
        label: 'Plan',
        description: 'Tratamiento, indicaciones y seguimiento.',
        placeholder: 'Se indica…',
    },
]

interface ClinicalNoteFormProps {
    initialData?: ClinicalNote
    isLoading: boolean
    onSubmit: (values: ClinicalNoteFormValues) => void
    onCancel: () => void
}

export function ClinicalNoteForm({
    initialData,
    isLoading,
    onSubmit,
    onCancel,
}: ClinicalNoteFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ClinicalNoteFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            subjective: initialData?.subjective ?? '',
            objective: initialData?.objective ?? '',
            assessment: initialData?.assessment ?? '',
            plan: initialData?.plan ?? '',
        },
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {FIELDS.map(({ name, label, description, placeholder }) => (
                <div key={name} className="flex flex-col gap-2">
                    <div className="flex flex-col gap-0.5 mb-1">
                        <Label
                            htmlFor={name}
                            className={`text-sm font-semibold ${errors[name] ? 'text-destructive' : ''}`}
                        >
                            {label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    <Textarea
                        id={name}
                        placeholder={placeholder}
                        rows={3}
                        className={`resize-none ${errors[name] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        {...register(name)}
                    />

                    {errors[name] && (
                        <p className="text-[0.8rem] font-medium text-destructive">
                            {errors[name]?.message as string}
                        </p>
                    )}
                </div>
            ))}

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
                    {initialData ? 'Guardar cambios' : 'Registrar nota'}
                </Button>
            </div>
        </form>
    )
}

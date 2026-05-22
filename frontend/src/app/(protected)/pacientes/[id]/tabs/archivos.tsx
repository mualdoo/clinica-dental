'use client'

import { useRef, useEffect, useState } from 'react'
import {
    Upload,
    FileText,
    Image as ImageIcon,
    File,
    Loader2,
    FolderOpen,
    Camera, // <-- Nuevo icono importado
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    usePatientFiles,
    useCreatePatientFile,
    usePatient,
} from '@/hooks/use-patient'
import type { PatientFile, PatientFileType } from '@/types/patient'
import { storageService } from '@/lib/api/storage-service'
import { useAuthStore } from '@/store/auth-store'

const FILE_ICONS: Record<PatientFileType, React.ReactNode> = {
    'x-ray': <ImageIcon className="h-6 w-6 text-sky-500" />,
    before_photo: <ImageIcon className="h-6 w-6 text-amber-500" />,
    after_photo: <ImageIcon className="h-6 w-6 text-emerald-500" />,
    document: <FileText className="h-6 w-6 text-violet-500" />,
    other: <File className="h-6 w-6 text-muted-foreground" />,
}

const FILE_LABELS: Record<PatientFileType, string> = {
    'x-ray': 'Radiografía',
    before_photo: 'Foto inicial',
    after_photo: 'Foto final',
    document: 'Documento',
    other: 'Otro',
}

function FileCard({ file }: { file: PatientFile }) {
    const sizeKb = (file.sizeBytes / 1024).toFixed(0)
    // Determinamos si es una imagen basándonos en el mimeType
    const isImage = file.mimeType?.startsWith('image/')

    return (
        <a
            href={file.storageKey}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-3 shadow-sm hover:border-primary/30 transition-all cursor-pointer hover:shadow-md"
        >
            <div className="relative flex h-24 items-center justify-center rounded-lg bg-muted/50 overflow-hidden">
                {isImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={file.storageKey}
                        alt={file.filename}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    FILE_ICONS[file.type] || FILE_ICONS['other']
                )}
            </div>
            <div className="flex flex-col gap-0.5 mt-1">
                <p
                    className="text-xs font-semibold text-foreground truncate"
                    title={file.filename}
                >
                    {file.filename}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                        {FILE_LABELS[file.type] || 'Archivo'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {sizeKb} KB
                    </span>
                </div>
            </div>
        </a>
    )
}

export function TabArchivos({ patientId }: { patientId: string }) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null) // <-- Ref para la cámara
    const loaderRef = useRef<HTMLDivElement>(null)

    const user = useAuthStore((s) => s.user)
    const canEdit = user?.role === 'dentist' || user?.role === 'admin'

    // Estado adicional para bloquear el botón mientras se sube a Supabase
    const [isUploadingToCloud, setIsUploadingToCloud] = useState(false)

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        usePatientFiles(patientId)

    const { mutate: createFile, isPending } = useCreatePatientFile(patientId)
    const { data: patient } = usePatient(patientId)

    useEffect(() => {
        const el = loaderRef.current
        if (!el) return
        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) fetchNextPage()
            },
            { threshold: 0.5 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [hasNextPage, fetchNextPage])

    const files = data?.pages.flatMap((p) => p.data.data) ?? []

    // Evaluamos si alguna de las dos cargas está activa
    const isBusy = isPending || isUploadingToCloud

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setIsUploadingToCloud(true)

            // 1. Subir el archivo físico al microservicio de almacenamiento
            let publicUrl =
                'https://jqikfytejgwtjobdudrt.supabase.co/storage/v1/object/public/archivos-clinica/uploads/1779134653814_images.jpeg'
            if (!patient?.data.email.includes('@falso.com')) {
                const uploadResponse = await storageService.upload(file)
                publicUrl = uploadResponse.url
            }

            // 2. Determinar el tipo lógico para la clínica
            const type: PatientFileType = file.type.startsWith('image/')
                ? 'before_photo'
                : 'document'

            // 3. Guardar los metadatos en el paciente-service con la URL real
            createFile({
                type,
                filename: file.name,
                storageKey: publicUrl, // Aquí inyectamos el enlace de Supabase
                mimeType: file.type,
                sizeBytes: file.size,
            })
        } catch (error) {
            console.error('Error procesando el archivo:', error)
            // Aquí sería ideal lanzar un toast de error de Shadcn UI
        } finally {
            setIsUploadingToCloud(false)
            // Limpiamos AMBOS inputs para permitir subir el mismo archivo o foto si hubo error
            if (fileInputRef.current) fileInputRef.current.value = ''
            if (cameraInputRef.current) cameraInputRef.current.value = ''
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {files.length} archivo{files.length !== 1 ? 's' : ''}
                </p>

                {canEdit && (
                    <div className="flex items-center gap-2">
                        {/* Botón para tomar foto */}
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            disabled={isBusy}
                            onClick={() => cameraInputRef.current?.click()}
                        >
                            {isBusy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Camera className="h-3.5 w-3.5" />
                            )}
                            Tomar foto
                        </Button>

                        {/* Botón para subir archivo/galería */}
                        <Button
                            size="sm"
                            className="gap-1.5"
                            disabled={isBusy}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {isBusy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Upload className="h-3.5 w-3.5" />
                            )}
                            Subir archivo
                        </Button>
                    </div>
                )}

                {/* Input estándar para archivos (PDF, Galería) */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* Input forzado a cámara (en dispositivos móviles) */}
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-36 rounded-xl bg-muted animate-pulse"
                        />
                    ))}
                </div>
            ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2 border border-dashed rounded-xl border-border/50">
                    <FolderOpen className="h-10 w-10 opacity-20" />
                    <p className="text-sm">Sin archivos registrados</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {files.map((f) => (
                        <FileCard key={f.id} file={f} />
                    ))}
                </div>
            )}

            <div ref={loaderRef} className="flex justify-center py-2 min-h-8">
                {isFetchingNextPage && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
            </div>
        </div>
    )
}

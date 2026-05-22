'use client'

import { useRef, useEffect, useState } from 'react'
import {
    Upload,
    FileText,
    Image as ImageIcon,
    File,
    Loader2,
    FolderOpen,
    Camera,
    MoreVertical,
    Send,
    Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    usePatientFiles,
    useCreatePatientFile,
    usePatient,
    useSendPatientFile,
    useDeletePatientFile,
} from '@/hooks/use-patient'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

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

function FileCard({
    file,
    onSend,
    onDelete,
    canEdit,
}: {
    file: PatientFile
    onSend: (id: string) => void
    onDelete: (id: string) => void
    canEdit: boolean
}) {
    const sizeKb = (file.sizeBytes / 1024).toFixed(0)
    const isImage = file.mimeType?.startsWith('image/')

    return (
        <div className="relative group flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-3 shadow-sm hover:border-primary/30 transition-all hover:shadow-md">
            {/* Menú de opciones */}
            {canEdit && (
                <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onSend(file.id)}>
                                <Send className="mr-2 h-4 w-4" />
                                Enviar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(file.id)}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* Enlace al archivo */}
            <a
                href={file.storageKey}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-2 cursor-pointer outline-none"
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
                        className="text-xs font-semibold text-foreground truncate pr-6"
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
        </div>
    )
}

export function TabArchivos({ patientId }: { patientId: string }) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const loaderRef = useRef<HTMLDivElement>(null)

    const user = useAuthStore((s) => s.user)
    const canEdit = user?.role === 'dentist' || user?.role === 'admin'

    const [isUploadingToCloud, setIsUploadingToCloud] = useState(false)

    // Estados para el Dialog
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedType, setSelectedType] =
        useState<PatientFileType>('document')

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        usePatientFiles(patientId)

    const { mutate: createFile, isPending } = useCreatePatientFile(patientId)
    const { mutate: sendPatientFile } = useSendPatientFile()
    const { mutate: deletePatientFile } = useDeletePatientFile(patientId)

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
    const isBusy = isPending || isUploadingToCloud

    function handleFileSelection(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setSelectedFile(file)
        setSelectedType(
            file.type.startsWith('image/') ? 'before_photo' : 'document'
        )

        // Limpiamos inputs
        if (fileInputRef.current) fileInputRef.current.value = ''
        if (cameraInputRef.current) cameraInputRef.current.value = ''
    }

    async function handleUpload() {
        if (!selectedFile) return

        try {
            setIsUploadingToCloud(true)

            let publicUrl =
                'https://jqikfytejgwtjobdudrt.supabase.co/storage/v1/object/public/archivos-clinica/uploads/1779134653814_images.jpeg'
            if (!patient?.data.email.includes('@falso.com')) {
                const uploadResponse = await storageService.upload(selectedFile)
                publicUrl = uploadResponse.url
            }

            createFile({
                type: selectedType,
                filename: selectedFile.name,
                storageKey: publicUrl,
                mimeType: selectedFile.type,
                sizeBytes: selectedFile.size,
            })

            // Cerramos dialog y reseteamos el estado local
            setIsUploadDialogOpen(false)
            setSelectedFile(null)
        } catch (error) {
            console.error('Error procesando el archivo:', error)
        } finally {
            setIsUploadingToCloud(false)
        }
    }

    // Al cerrar el dialog sin subir, limpiamos el archivo
    function onOpenChange(open: boolean) {
        setIsUploadDialogOpen(open)
        if (!open) setSelectedFile(null)
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {files.length} archivo{files.length !== 1 ? 's' : ''}
                </p>

                {canEdit && (
                    <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setIsUploadDialogOpen(true)}
                    >
                        <Upload className="h-3.5 w-3.5" />
                        Subir archivo
                    </Button>
                )}

                {/* Inputs ocultos de carga */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileSelection}
                />
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileSelection}
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
                        <FileCard
                            key={f.id}
                            file={f}
                            onSend={(id) => sendPatientFile(id)}
                            onDelete={(id) => deletePatientFile(id)}
                            canEdit={canEdit}
                        />
                    ))}
                </div>
            )}

            <div ref={loaderRef} className="flex justify-center py-2 min-h-8">
                {isFetchingNextPage && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
            </div>

            {/* Dialog de subida */}
            <Dialog open={isUploadDialogOpen} onOpenChange={onOpenChange}>
                <DialogContent className="w-[90vw] max-w-md rounded-xl sm:w-full">
                    <DialogHeader>
                        <DialogTitle>Subir nuevo archivo</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-5 py-2">
                        {/* Botones para seleccionar origen */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => cameraInputRef.current?.click()}
                                className="h-auto py-3 flex flex-col gap-2"
                            >
                                <Camera className="h-5 w-5 text-muted-foreground" />
                                <span className="text-xs sm:text-sm font-medium">
                                    Usar Cámara
                                </span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-auto py-3 flex flex-col gap-2"
                            >
                                <Upload className="h-5 w-5 text-muted-foreground" />
                                <span className="text-xs sm:text-sm font-medium">
                                    Galería / Docs
                                </span>
                            </Button>
                        </div>

                        {/* Formulario de datos (solo visible si hay archivo) */}
                        {selectedFile && (
                            <div className="flex flex-col gap-4 mt-2 animate-in fade-in slide-in-from-bottom-2">
                                <div className="space-y-1 p-3 bg-muted/50 rounded-lg border border-border/50">
                                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                        Archivo seleccionado
                                    </Label>
                                    <p
                                        className="text-sm font-medium truncate"
                                        title={selectedFile.name}
                                    >
                                        {selectedFile.name}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tipo de archivo</Label>
                                    <Select
                                        value={selectedType}
                                        onValueChange={(val) =>
                                            setSelectedType(
                                                val as PatientFileType
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(FILE_LABELS).map(
                                                ([key, label]) => (
                                                    <SelectItem
                                                        key={key}
                                                        value={key}
                                                    >
                                                        {label}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-2 sm:mt-0">
                        <Button
                            disabled={!selectedFile || isBusy}
                            onClick={handleUpload}
                            className="w-full sm:w-auto"
                        >
                            {isBusy ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 h-4 w-4" />
                            )}
                            Guardar archivo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

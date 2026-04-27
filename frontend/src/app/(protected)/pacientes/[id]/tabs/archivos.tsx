'use client'

import { useRef, useEffect } from 'react'
import {
    Upload,
    FileText,
    Image,
    File,
    Loader2,
    FolderOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePatientFiles, useCreatePatientFile } from '@/hooks/use-patient'
import type { PatientFile, PatientFileType } from '@/types/patient'

const FILE_ICONS: Record<PatientFileType, React.ReactNode> = {
    'x-ray': <Image className="h-6 w-6 text-sky-500" />,
    before_photo: <Image className="h-6 w-6 text-amber-500" />,
    after_photo: <Image className="h-6 w-6 text-emerald-500" />,
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
    return (
        <div className="group flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-3 shadow-sm hover:border-primary/30 transition-colors">
            <div className="flex h-20 items-center justify-center rounded-lg bg-muted/50">
                {FILE_ICONS[file.type]}
            </div>
            <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold text-foreground truncate">
                    {file.filename}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                        {FILE_LABELS[file.type]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {sizeKb} KB
                    </span>
                </div>
            </div>
        </div>
    )
}

export function TabArchivos({ patientId }: { patientId: string }) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const loaderRef = useRef<HTMLDivElement>(null)

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        usePatientFiles(patientId)

    const { mutate: createFile, isPending } = useCreatePatientFile(patientId)

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

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        // Determina el tipo según mimeType
        const type: PatientFileType = file.type.startsWith('image/')
            ? 'before_photo'
            : 'document'
        createFile({
            type,
            filename: file.name,
            storageKey: `pending/${file.name}`, // el storageKey real lo asigna el backend
            mimeType: file.type,
            sizeBytes: file.size,
        })
        e.target.value = ''
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {files.length} archivo{files.length !== 1 ? 's' : ''}
                </p>
                <Button
                    size="sm"
                    className="gap-1.5"
                    disabled={isPending}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Upload className="h-3.5 w-3.5" />
                    )}
                    Subir archivo
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-36 rounded-xl bg-muted animate-pulse"
                        />
                    ))}
                </div>
            ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                    <FolderOpen className="h-10 w-10 opacity-20" />
                    <p className="text-sm">Sin archivos registrados</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {files.map((f) => (
                        <FileCard key={f.id} file={f} />
                    ))}
                </div>
            )}

            <div ref={loaderRef} className="flex justify-center py-2">
                {isFetchingNextPage && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
            </div>
        </div>
    )
}

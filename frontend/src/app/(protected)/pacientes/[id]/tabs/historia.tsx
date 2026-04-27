'use client'

import { useState, useRef, useEffect } from 'react'
import { FileText, Loader2, User } from 'lucide-react'
import { useClinicalNotes } from '@/hooks/use-patient'
import type { ClinicalNote } from '@/types/patient'

function formatDateLong(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

function NoteCard({ note }: { note: ClinicalNote }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="relative pl-6 pb-6 last:pb-0">
            {/* Línea de timeline */}
            <div className="absolute left-2 top-0 bottom-0 w-px bg-border last:bg-transparent" />
            {/* Punto */}
            <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background" />

            <div
                className="rounded-xl border border-border/60 bg-card p-4 shadow-sm cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => setOpen((o) => !o)}
            >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex flex-col gap-0.5">
                        <p className="text-xs text-muted-foreground capitalize">
                            {formatDateLong(note.id)}{' '}
                            {/* placeholder — usa createdAt cuando lo tengas */}
                        </p>
                        <p className="text-sm font-semibold text-foreground line-clamp-1">
                            {note.subjective}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        Dr. #{note.createdBy.slice(-4)}
                    </div>
                </div>

                {open && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border/40 pt-3">
                        {[
                            { label: 'Subjetivo', value: note.subjective },
                            { label: 'Objetivo', value: note.objective },
                            { label: 'Evaluación', value: note.assessment },
                            { label: 'Plan', value: note.plan },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {label}
                                </span>
                                <p className="text-xs text-foreground">
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export function TabHistoria({ patientId }: { patientId: string }) {
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useClinicalNotes(patientId)

    const loaderRef = useRef<HTMLDivElement>(null)
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

    const notes = (data?.pages.flatMap((p) => p.data.data) ?? []).sort((a, b) =>
        b.id.localeCompare(a.id)
    ) // más reciente primero

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 pl-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-20 rounded-xl bg-muted animate-pulse"
                    />
                ))}
            </div>
        )
    }

    if (notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                <FileText className="h-10 w-10 opacity-20" />
                <p className="text-sm">Sin notas clínicas registradas</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
            ))}
            <div ref={loaderRef} className="py-2 flex justify-center">
                {isFetchingNextPage && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
            </div>
        </div>
    )
}

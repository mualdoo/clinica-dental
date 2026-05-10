'use client'

import { useState } from 'react'
import {
    UserPlus,
    Search,
    X,
    Stethoscope,
    Mail,
    ShieldCheck,
    Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { RegisterUserForm } from '@/components/user/register-user-form'
import { useUsers, useRegisterUser } from '@/hooks/use-user'
import type { RegisterPayload, User } from '@/types/auth'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ name, lastName }: { name?: string; lastName?: string }) {
    const n = name?.[0] ?? '?'
    const l = lastName?.[0] ?? ''
    const colors = [
        'bg-sky-100 text-sky-700',
        'bg-emerald-100 text-emerald-700',
        'bg-violet-100 text-violet-700',
        'bg-amber-100 text-amber-700',
    ]
    const color =
        colors[
            ((name?.charCodeAt(0) ?? 0) + (lastName?.charCodeAt(0) ?? 0)) %
                colors.length
        ]
    return (
        <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${color}`}
        >
            {n}
            {l}
        </div>
    )
}

// ─── Modal de registro (shadcn Dialog) ────────────────────────────────────────
function AddDentistDialog({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { mutate: register, isPending } = useRegisterUser()

    function handleSubmit(data: RegisterPayload) {
        register(data, { onSuccess: () => onOpenChange(false) })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Dentista</DialogTitle>
                    <DialogDescription>
                        Se creará una cuenta con rol de dentista
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <RegisterUserForm
                        fixedRole="dentist"
                        isLoading={isPending}
                        onSubmit={handleSubmit}
                        onCancel={() => onOpenChange(false)}
                        submitLabel="Registrar Dentista"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Tarjeta de dentista ──────────────────────────────────────────────────────
function DentistCard({ user }: { user: User }) {
    return (
        <div className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
            <Avatar name={user.name} lastName={user.lastName} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                    {user.name} {user.lastName}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{user.email}</span>
                </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 dark:bg-sky-900/30 dark:border-sky-800 px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 shrink-0">
                <ShieldCheck className="h-3 w-3" />
                {user.role}
            </div>
        </div>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DentistSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="h-18 rounded-xl bg-muted animate-pulse"
                />
            ))}
        </div>
    )
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function DentistasPage() {
    const [showModal, setShowModal] = useState(false)
    const [search, setSearch] = useState('')

    const { data, isLoading } = useUsers('dentist')
    const dentists: User[] = data?.data.data ?? []

    const filtered = dentists.filter((d) =>
        d.email.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-5">
            {/* ── Encabezado ── */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Dentistas
                </h1>
                <p className="text-sm text-muted-foreground">
                    Gestión del equipo de dentistas
                </p>
            </div>

            {/* ── Buscador + Botón ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por correo…"
                        className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-8 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="gap-2 shrink-0"
                >
                    <UserPlus className="h-4 w-4" />
                    Agregar Dentista
                </Button>
            </div>

            {/* ── Stats rápidos ── */}
            {!isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                        {filtered.length} dentista
                        {filtered.length !== 1 ? 's' : ''}
                        {search &&
                            ` · resultado${filtered.length !== 1 ? 's' : ''} para "${search}"`}
                    </span>
                </div>
            )}

            {/* ── Lista ── */}
            {isLoading ? (
                <DentistSkeleton />
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                    <Stethoscope className="h-10 w-10 opacity-20" />
                    <p className="text-sm">
                        {search
                            ? `Sin resultados para "${search}"`
                            : 'No hay dentistas registrados'}
                    </p>
                    {!search && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 gap-1.5"
                            onClick={() => setShowModal(true)}
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            Agregar el primero
                        </Button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map((d) => (
                        <DentistCard key={d.id} user={d} />
                    ))}
                </div>
            )}

            {/* ── Modal ── */}
            <AddDentistDialog open={showModal} onOpenChange={setShowModal} />
        </div>
    )
}

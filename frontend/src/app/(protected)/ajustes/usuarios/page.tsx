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
    MoreVertical,
    KeyRound,
    Filter,
    Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import { RegisterUserForm } from '@/components/user/register-user-form'
import { useUsers, useRegisterUser, useInfiniteUsers } from '@/hooks/use-user'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import type { RegisterPayload, User } from '@/types/auth'
import { useSendVerificationEmail } from '@/hooks/use-auth'

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
function AddUserDialog({
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
                    <DialogTitle>Registrar Usuario</DialogTitle>
                    <DialogDescription>
                        Se enviará un correo para agregar la contraseña
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <RegisterUserForm
                        isLoading={isPending}
                        onSubmit={handleSubmit}
                        onCancel={() => onOpenChange(false)}
                        submitLabel="Registrar Usuario"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Tarjeta de Usuario ──────────────────────────────────────────────────────
function UserCard({ user }: { user: User }) {
    const { mutate: sendEmail } = useSendVerificationEmail()
    const roleColors: Record<string, string> = {
        admin: 'border-red-200 bg-red-50 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300',
        dentist:
            'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300',
        receptionist:
            'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300',
        patient:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300',
    }

    const currentRoleColor =
        roleColors[user.role.toLowerCase()] ||
        'border-gray-200 bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:border-gray-800 dark:text-gray-300'

    const handleRecoverPassword = () => {
        sendEmail(user.id)
    }

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

            <div
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold shrink-0 capitalize ${currentRoleColor}`}
            >
                <ShieldCheck className="h-3 w-3" />
                {user.role}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        onClick={handleRecoverPassword}
                        className="cursor-pointer"
                    >
                        <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Recuperar contraseña</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function UserSkeleton() {
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
export default function UsuariosPage() {
    const [showModal, setShowModal] = useState(false)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')

    // Extraemos las propiedades de paginación de React Query
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteUsers()

    // Inicializamos el ref usando tu hook de infinite scroll
    const scrollRef = useInfiniteScroll(hasNextPage, fetchNextPage)

    // Nota: Si useUsers usa `useInfiniteQuery` de React Query, la data suele venir dividida en "pages".
    // Dependiendo de cómo lo tengas configurado, la extracción de usuarios cambia:
    // Si usas useQuery normal (paginación manual): const users = data?.data.data ?? []
    // Si usas useInfiniteQuery:
    // const users: User[] = data?.pages?.flatMap((page: any) => page.data.data) ?? data?.data?.data ?? []
    const users: User[] =
        data?.pages?.flatMap((page: any) => page.data.data) ?? []

    const filtered = users.filter((d) => {
        const matchesSearch = d.email
            .toLowerCase()
            .includes(search.toLowerCase())
        const matchesRole = roleFilter === 'all' || d.role === roleFilter
        return matchesSearch && matchesRole
    })

    return (
        <div className="flex flex-col gap-5 pb-10">
            {/* ── Encabezado ── */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Usuarios
                </h1>
                <p className="text-sm text-muted-foreground">
                    Gestión de usuarios
                </p>
            </div>

            {/* ── Buscador + Filtros + Botón ── */}
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

                <div className="flex gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-35 h-9">
                            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="dentist">Dentista</SelectItem>
                            <SelectItem value="receptionist">
                                Recepcionista
                            </SelectItem>
                            <SelectItem value="patient">Paciente</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={() => setShowModal(true)}
                        className="gap-2 shrink-0 h-9"
                    >
                        <UserPlus className="h-4 w-4" />
                        Agregar Usuario
                    </Button>
                </div>
            </div>

            {/* ── Stats rápidos ── */}
            {!isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                        {filtered.length} usuario
                        {filtered.length !== 1 ? 's' : ''}
                        {search &&
                            ` · resultado${filtered.length !== 1 ? 's' : ''} para "${search}"`}
                    </span>
                </div>
            )}

            {/* ── Lista ── */}
            {isLoading ? (
                <UserSkeleton />
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                    <Stethoscope className="h-10 w-10 opacity-20" />
                    <p className="text-sm">
                        {search || roleFilter !== 'all'
                            ? 'No hay usuarios que coincidan con la búsqueda'
                            : 'No hay usuarios registrados'}
                    </p>
                    {!search && roleFilter === 'all' && (
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
                        <UserCard key={d.id} user={d} />
                    ))}

                    {/* ── Elemento Observador de Infinite Scroll ── */}
                    <div
                        ref={scrollRef}
                        className="flex w-full items-center justify-center h-10 mt-4"
                    >
                        {isFetchingNextPage && (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        )}
                    </div>
                </div>
            )}

            {/* ── Modal ── */}
            <AddUserDialog open={showModal} onOpenChange={setShowModal} />
        </div>
    )
}

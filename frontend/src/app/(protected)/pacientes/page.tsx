'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search,
    UserPlus,
    FolderOpen,
    Loader2,
    Users,
    Phone,
    Mail,
    ChevronUp,
    ChevronDown,
    X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearchPatients, usePatients } from '@/hooks/use-patient'
import type { Patient } from '@/types/patient'

// ─── Hook de debounce ─────────────────────────────────────────────────────────
function useDebounce(value: string, delay = 350) {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return debounced
}

// ─── Badge de género ──────────────────────────────────────────────────────────
function GenderBadge({ gender }: { gender: 'M' | 'F' | 'O' }) {
    const map = {
        M: {
            label: 'Masc.',
            className: 'bg-sky-100 text-sky-700 border-sky-200',
        },
        F: {
            label: 'Fem.',
            className: 'bg-rose-100 text-rose-700 border-rose-200',
        },
        O: {
            label: 'Otro',
            className: 'bg-violet-100 text-violet-700 border-violet-200',
        },
    }

    const { label, className } = map[gender]
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${className}`}
        >
            {label}
        </span>
    )
}

// ─── Avatar initials ──────────────────────────────────────────────────────────
function Avatar({ name, lastName }: { name: string; lastName: string }) {
    const initials = `${name[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
    const colors = [
        'bg-sky-100 text-sky-700',
        'bg-emerald-100 text-emerald-700',
        'bg-amber-100 text-amber-700',
        'bg-rose-100 text-rose-700',
        'bg-violet-100 text-violet-700',
    ]
    const color =
        colors[(name.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length]
    return (
        <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${color}`}
        >
            {initials}
        </div>
    )
}

// ─── Fila de tabla ────────────────────────────────────────────────────────────
function PatientRow({ patient }: { patient: Patient }) {
    const router = useRouter()
    const age = patient.birthDate
        ? Math.floor(
              (Date.now() - new Date(patient.birthDate).getTime()) /
                  (1000 * 60 * 60 * 24 * 365.25)
          )
        : null

    return (
        <tr className="group border-b border-border/50 transition-colors hover:bg-muted/40">
            {/* Nombre */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <Avatar name={patient.name} lastName={patient.lastName} />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                            {patient.name} {patient.lastName}
                        </p>
                        {age !== null && (
                            <p className="text-[11px] text-muted-foreground">
                                {age} años
                            </p>
                        )}
                    </div>
                </div>
            </td>

            {/* Contacto — oculto en xs */}
            <td className="hidden sm:table-cell px-4 py-3">
                <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-45">
                            {patient.email}
                        </span>
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" />
                        {patient.phone}
                    </span>
                </div>
            </td>

            {/* Género — solo md+ */}
            <td className="hidden md:table-cell px-4 py-3">
                <GenderBadge gender={patient.gender} />
            </td>

            {/* Tipo de sangre — solo lg+ */}
            <td className="hidden lg:table-cell px-4 py-3">
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono font-semibold text-foreground">
                    {patient.bloodType}
                </span>
            </td>

            {/* Acción */}
            <td className="px-4 py-3 text-right">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => router.push(`/pacientes/${patient.id}`)}
                >
                    <FolderOpen className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-xs">
                        Ver Expediente
                    </span>
                </Button>
            </td>
        </tr>
    )
}

// ─── Skeleton de fila ─────────────────────────────────────────────────────────
function RowSkeleton() {
    return (
        <tr className="border-b border-border/50">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                    <div className="space-y-1.5">
                        <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
                        <div className="h-2.5 w-16 rounded bg-muted animate-pulse" />
                    </div>
                </div>
            </td>
            <td className="hidden sm:table-cell px-4 py-3">
                <div className="space-y-1.5">
                    <div className="h-3 w-40 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                </div>
            </td>
            <td className="hidden md:table-cell px-4 py-3">
                <div className="h-5 w-12 rounded-full bg-muted animate-pulse" />
            </td>
            <td className="hidden lg:table-cell px-4 py-3">
                <div className="h-5 w-10 rounded bg-muted animate-pulse" />
            </td>
            <td className="px-4 py-3" />
        </tr>
    )
}

// ─── Estado vacío ─────────────────────────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
    return (
        <tr>
            <td colSpan={5} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Users className="h-10 w-10 opacity-20" />
                    <p className="text-sm font-medium">
                        {query
                            ? `Sin resultados para "${query}"`
                            : 'No hay pacientes registrados'}
                    </p>
                    {query && (
                        <p className="text-xs opacity-70">
                            Intenta con otro nombre, correo o teléfono
                        </p>
                    )}
                </div>
            </td>
        </tr>
    )
}

// ─── Tipos de ordenamiento ────────────────────────────────────────────────────
type SortField = 'name' | 'lastName'
type SortDir = 'asc' | 'desc'

function sortPatients(patients: Patient[], field: SortField, dir: SortDir) {
    return [...patients].sort((a, b) => {
        const va = a[field].toLowerCase()
        const vb = b[field].toLowerCase()
        return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })
}

// ─── Header de columna ordenable ──────────────────────────────────────────────
function SortHeader({
    field,
    label,
    current,
    dir,
    onSort,
}: {
    field: SortField
    label: string
    current: SortField
    dir: SortDir
    onSort: (f: SortField) => void
}) {
    const active = current === field
    return (
        <button
            onClick={() => onSort(field)}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
            {label}
            <span className="flex flex-col">
                <ChevronUp
                    className={`h-2.5 w-2.5 -mb-0.5 ${active && dir === 'asc' ? 'text-primary' : 'opacity-30'}`}
                />
                <ChevronDown
                    className={`h-2.5 w-2.5 ${active && dir === 'desc' ? 'text-primary' : 'opacity-30'}`}
                />
            </span>
        </button>
    )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function PacientesPage() {
    const router = useRouter()

    const [input, setInput] = useState('')
    const [sortField, setSortField] = useState<SortField>('lastName')
    const [sortDir, setSortDir] = useState<SortDir>('asc')
    const inputRef = useRef<HTMLInputElement>(null)

    const query = useDebounce(input)
    const isSearching = query.trim().length >= 2

    // Búsqueda puntual
    const { data: searchData, isLoading: searchLoading } =
        useSearchPatients(query)

    // Lista general con scroll infinito
    const {
        data: listData,
        isLoading: listLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = usePatients()

    const loaderRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isSearching) return
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
    }, [isSearching, hasNextPage, fetchNextPage])

    // Pacientes a mostrar
    const rawPatients: Patient[] = isSearching
        ? (searchData?.data?.data ?? [])
        : (listData?.pages.flatMap((p) => p.data.data) ?? [])

    const patients = sortPatients(rawPatients, sortField, sortDir)
    const isLoading = isSearching ? searchLoading : listLoading

    const handleSort = (field: SortField) => {
        if (sortField === field)
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        else {
            setSortField(field)
            setSortDir('asc')
        }
    }

    return (
        <div className="flex flex-col gap-5">
            {/* ── Encabezado ── */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Pacientes
                </h1>
                <p className="text-sm text-muted-foreground">
                    Busca y gestiona el registro de pacientes
                </p>
            </div>

            {/* ── Buscador + Botón ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Buscador */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Buscar por nombre, apellido, correo o teléfono…"
                        className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-8 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-shadow"
                    />
                    {input && (
                        <button
                            onClick={() => {
                                setInput('')
                                inputRef.current?.focus()
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Limpiar búsqueda"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Botón registrar */}
                <Button
                    onClick={() => router.push('/pacientes/nuevo')}
                    className="gap-2 shrink-0"
                >
                    <UserPlus className="h-4 w-4" />
                    Registrar Nuevo Paciente
                </Button>
            </div>

            {/* ── Tabla ── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border/60 bg-muted/40">
                                <th className="px-4 py-3 text-left">
                                    <div className="flex items-center gap-3">
                                        <SortHeader
                                            field="name"
                                            label="Nombre"
                                            current={sortField}
                                            dir={sortDir}
                                            onSort={handleSort}
                                        />
                                        <span className="text-muted-foreground opacity-30">
                                            /
                                        </span>
                                        <SortHeader
                                            field="lastName"
                                            label="Apellido"
                                            current={sortField}
                                            dir={sortDir}
                                            onSort={handleSort}
                                        />
                                    </div>
                                </th>
                                <th className="hidden sm:table-cell px-4 py-3 text-left">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Contacto
                                    </span>
                                </th>
                                <th className="hidden md:table-cell px-4 py-3 text-left">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Género
                                    </span>
                                </th>
                                <th className="hidden lg:table-cell px-4 py-3 text-left">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Sangre
                                    </span>
                                </th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <RowSkeleton key={i} />
                                ))
                            ) : patients.length === 0 ? (
                                <EmptyState query={query} />
                            ) : (
                                patients.map((p) => (
                                    <PatientRow key={p.id} patient={p} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer con contador y loader de scroll infinito */}
                <div className="border-t border-border/40 bg-muted/20 px-4 py-2 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                        {isLoading
                            ? 'Cargando…'
                            : `${patients.length} paciente${patients.length !== 1 ? 's' : ''}`}
                        {isSearching && !isLoading && (
                            <span className="ml-1 text-primary font-medium">
                                — resultado{patients.length !== 1 ? 's' : ''}{' '}
                                para "{query}"
                            </span>
                        )}
                    </p>
                    {isFetchingNextPage && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Cargando más…
                        </div>
                    )}
                </div>
            </div>

            {/* Trigger de scroll infinito (solo en modo lista) */}
            {!isSearching && <div ref={loaderRef} className="h-1" />}
        </div>
    )
}

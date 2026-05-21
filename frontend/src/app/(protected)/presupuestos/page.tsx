'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Search,
    X,
    Loader2,
    ReceiptText,
    Plus,
    ChevronDown,
    ChevronUp,
    FileDown,
    CheckCircle2,
    XCircle,
    Trash2,
    BadgeDollarSign,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    useQuotes,
    useQuotesByPatient,
    useCreateQuote,
    usePatchQuote,
    useDeleteQuote,
    useCreateQuoteItem,
    useDeleteQuoteItem,
    useCreatePayment,
    useQuotePayments,
    useGenerateQuotePdf,
} from '@/hooks/use-billing'
import { useTreatments } from '@/hooks/use-billing'
import { useSearchPatients } from '@/hooks/use-patient'
import type {
    PatientQuote,
    QuoteStatus,
    PaymentMethod,
    CreatePaymentDto,
    CreateQuoteItemDto,
} from '@/types/billing'
import type { Patient } from '@/types/patient'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function useDebounce(value: string, delay = 350) {
    const [d, setD] = useState(value)
    useEffect(() => {
        const t = setTimeout(() => setD(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return d
}

function useInfiniteScroll(
    hasNextPage: boolean | undefined,
    fetchNextPage: () => void
) {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const obs = new IntersectionObserver(
            (e) => {
                if (e[0].isIntersecting && hasNextPage) fetchNextPage()
            },
            { threshold: 0.5 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [hasNextPage, fetchNextPage])
    return ref
}

function formatMoney(n: number) {
    return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

// ─── Configs ──────────────────────────────────────────────────────────────────
const QUOTE_STATUS_CFG: Record<
    QuoteStatus,
    { label: string; className: string }
> = {
    draft: {
        label: 'Borrador',
        className: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    sent: {
        label: 'Enviado',
        className: 'bg-sky-100 text-sky-700 border-sky-200',
    },
    accepted: {
        label: 'Aceptado',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    rejected: {
        label: 'Rechazado',
        className: 'bg-rose-100 text-rose-700 border-rose-200',
    },
    expired: {
        label: 'Expirado',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    paid: {
        label: 'Pagado',
        className:
            'bg-indigo-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
    },
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    cash: 'Efectivo',
    card_credit: 'T. Crédito',
    card_debit: 'T. Débito',
    transfer: 'Transferencia',
    check: 'Cheque',
}

const STATUS_ORDER: QuoteStatus[] = [
    'draft',
    'sent',
    'accepted',
    'rejected',
    'expired',
]

// ─── Buscador de pacientes ────────────────────────────────────────────────────
function PatientSearchFilter({
    selected,
    onSelect,
    onClear,
}: {
    selected: Patient | null
    onSelect: (p: Patient) => void
    onClear: () => void
}) {
    const [input, setInput] = useState(selected?.name ?? '')
    const [focused, setFocused] = useState(false)
    const query = useDebounce(input)
    const { data, isLoading } = useSearchPatients(query)
    const patients = data?.data.data ?? []
    const showDropdown = focused && query.length >= 2
    const containerRef = useRef<HTMLDivElement>(null)

    // Cierra al click fuera
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (!containerRef.current?.contains(e.target as Node))
                setFocused(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    function handleSelect(p: Patient) {
        setInput(`${p.name} ${p.lastName}`)
        setFocused(false)
        onSelect(p)
    }

    function handleClear() {
        setInput('')
        onClear()
    }

    return (
        <div ref={containerRef} className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
                value={input}
                onChange={(e) => {
                    setInput(e.target.value)
                    if (!e.target.value) onClear()
                }}
                onFocus={() => setFocused(true)}
                placeholder="Buscar paciente…"
                className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-8 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {input && (
                <button
                    onClick={handleClear}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Buscando…
                        </div>
                    ) : patients.length === 0 ? (
                        <p className="px-3 py-2.5 text-xs text-muted-foreground">
                            Sin resultados
                        </p>
                    ) : (
                        patients.map((p) => (
                            <button
                                key={p.id}
                                onMouseDown={() => handleSelect(p)}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                    {p.name[0]}
                                    {p.lastName[0]}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {p.name} {p.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {p.email}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Modal nuevo presupuesto ──────────────────────────────────────────────────
function NewQuoteModal({
    defaultPatientId,
    onClose,
}: {
    defaultPatientId?: string
    onClose: () => void
}) {
    const [notes, setNotes] = useState('')
    const [validUntil, setValidUntil] = useState('')
    const [patientId, setPatientId] = useState(defaultPatientId ?? '')
    const { mutate: create, isPending } = useCreateQuote()

    return (
        <Dialog
            open
            onOpenChange={(v) => {
                if (!v) onClose()
            }}
        >
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Nuevo Presupuesto</DialogTitle>
                    <DialogDescription>
                        Completa los datos para crear un presupuesto.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                    {!defaultPatientId && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                ID del Paciente{' '}
                                <span className="text-destructive">*</span>
                            </label>
                            <input
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                                placeholder="ID del paciente…"
                                className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Válido hasta{' '}
                            <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="date"
                            value={validUntil}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setValidUntil(e.target.value)}
                            className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Notas
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Observaciones del presupuesto…"
                            className="rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="flex-1 gap-2"
                        disabled={isPending || !validUntil || !patientId}
                        onClick={() =>
                            create(
                                {
                                    patientId,
                                    notes,
                                    validUntil,
                                    status: 'draft',
                                },
                                { onSuccess: onClose }
                            )
                        }
                    >
                        {isPending && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Crear
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Modal: Registrar Pago ────────────────────────────────────────────────────
function NewPaymentModal({
    quoteId,
    remaining,
    onClose,
}: {
    quoteId: string
    remaining: number
    onClose: () => void
}) {
    const [form, setForm] = useState<CreatePaymentDto>({
        amount: remaining > 0 ? remaining : 0,
        method: 'cash',
        reference: '',
    })
    const { mutate: create, isPending } = useCreatePayment(quoteId)
    const set =
        (k: keyof CreatePaymentDto) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setForm((f) => ({
                ...f,
                [k]: k === 'amount' ? Number(e.target.value) : e.target.value,
            }))

    return (
        <Dialog
            open
            onOpenChange={(v) => {
                if (!v) onClose()
            }}
        >
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Registrar Pago</DialogTitle>
                    <DialogDescription>
                        Saldo pendiente: {formatMoney(remaining)}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Monto
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={form.amount}
                            onChange={set('amount')}
                            className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Método
                        </label>
                        <select
                            value={form.method}
                            onChange={set('method')}
                            className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            {(
                                Object.keys(
                                    PAYMENT_METHOD_LABELS
                                ) as PaymentMethod[]
                            ).map((m) => (
                                <option key={m} value={m}>
                                    {PAYMENT_METHOD_LABELS[m]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Referencia (opcional)
                        </label>
                        <input
                            type="text"
                            value={form.reference}
                            onChange={set('reference')}
                            placeholder="Folio, transferencia…"
                            className="h-9 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="flex-1 gap-2"
                        disabled={isPending || form.amount <= 0}
                        onClick={() => create(form, { onSuccess: onClose })}
                    >
                        {isPending && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Registrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Tarjeta de presupuesto ───────────────────────────────────────────────────
function QuoteCard({ quote }: { quote: PatientQuote }) {
    const [expanded, setExpanded] = useState(false)
    const [activeTab, setActiveTab] = useState<'items' | 'payments'>('items')
    const [payModal, setPayModal] = useState(false)

    const { mutate: patchQuote } = usePatchQuote()
    const { mutate: deleteQuote } = useDeleteQuote()
    const { mutate: addItem, isPending: adding } = useCreateQuoteItem(quote.id)
    const { mutate: removeItem, isPending: removing } = useDeleteQuoteItem(
        quote.id
    )
    const { mutate: generatePdf, isPending: generatingPdf } =
        useGenerateQuotePdf()

    const { data: treatmentsData } = useTreatments({ isActive: true })
    const treatments = treatmentsData?.data.data ?? []
    const treatmentMap = Object.fromEntries(treatments.map((t) => [t.id, t]))

    // Usa los items y payments que vienen en PatientQuote directamente
    const items = quote.items ?? []
    const payments = quote.Payments ?? []

    const [selectedTreatment, setSelectedTreatment] = useState('')
    const [toothNumber, setToothNumber] = useState('')
    const [discount, setDiscount] = useState('0')

    const totalPaid = payments
        .filter((p) => p.status === 'completed')
        .reduce((a, p) => a + (Number(p.amount) || 0), 0)
    const remaining = Math.max(0, quote.total - totalPaid)
    const isDraft = quote.status === 'draft'
    const canPay = quote.status === 'accepted' && remaining > 0
    const cfg = QUOTE_STATUS_CFG[quote.status]

    const progressPct =
        quote.total > 0 ? Math.min(100, (totalPaid / quote.total) * 100) : 0

    function handleAddItem() {
        if (!selectedTreatment) return
        const dto: CreateQuoteItemDto = {
            treatmentId: selectedTreatment,
            toothNumber: toothNumber ? parseInt(toothNumber) : 0,
            discount: parseFloat(discount) || 0,
        }
        addItem(dto, {
            onSuccess: () => {
                setSelectedTreatment('')
                setToothNumber('')
                setDiscount('0')
            },
        })
    }

    return (
        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
            {/* ── Header ── */}
            <div
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded((e) => !e)}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <ReceiptText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">
                                #{quote.id.slice(-6).toUpperCase()}
                            </span>
                            <Badge
                                variant="outline"
                                className={`text-[10px] px-2 py-0 font-semibold ${cfg.className}`}
                            >
                                {cfg.label}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Válido hasta {formatDate(quote.validUntil)}
                            {' · '}Total: {formatMoney(quote.total)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {/* Botón PDF */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                onClick={(e) => e.stopPropagation()}
                                disabled={generatingPdf}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                            >
                                {generatingPdf ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <FileDown className="h-3.5 w-3.5" />
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem
                                className="gap-2 cursor-pointer text-xs"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    generatePdf({
                                        quoteId: quote.id,
                                        createPatientFile: false,
                                    })
                                }}
                            >
                                <FileDown className="h-3.5 w-3.5" />
                                Solo descargar PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="gap-2 cursor-pointer text-xs"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    generatePdf({
                                        quoteId: quote.id,
                                        createPatientFile: true,
                                    })
                                }}
                            >
                                <FileDown className="h-3.5 w-3.5" />
                                Descargar y guardar en expediente
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Marcar enviado */}
                    {isDraft && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                patchQuote({
                                    id: quote.id,
                                    dto: { status: 'sent' },
                                })
                            }}
                            className="hidden sm:flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            Marcar enviado
                        </button>
                    )}

                    {/* Eliminar — solo borrador */}
                    {isDraft && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('¿Eliminar presupuesto?'))
                                    deleteQuote(quote.id)
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}

                    {expanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground ml-1" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
                    )}
                </div>
            </div>

            {/* ── Contenido expandible ── */}
            {expanded && (
                <div className="border-t border-border/40 px-4 pb-4 pt-3 flex flex-col gap-4">
                    {quote.notes && (
                        <p className="text-xs text-muted-foreground italic">
                            "{quote.notes}"
                        </p>
                    )}

                    {/* Mini tabs */}
                    <div className="flex gap-0 rounded-lg border border-border/50 bg-muted/30 p-0.5 w-fit">
                        {(['items', 'payments'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setActiveTab(t)}
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors
                  ${activeTab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {t === 'items' ? 'Tratamientos' : 'Pagos'}
                            </button>
                        ))}
                    </div>

                    {/* ── Tab Items ── */}
                    {activeTab === 'items' && (
                        <div className="flex flex-col gap-3">
                            {isDraft && (
                                <div className="flex flex-wrap gap-2">
                                    <select
                                        value={selectedTreatment}
                                        onChange={(e) =>
                                            setSelectedTreatment(e.target.value)
                                        }
                                        className="flex-1 min-w-45 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="">
                                            Seleccionar tratamiento…
                                        </option>
                                        {treatments.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} —{' '}
                                                {formatMoney(t.unitPrice)}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="Diente"
                                        value={toothNumber}
                                        onChange={(e) =>
                                            setToothNumber(e.target.value)
                                        }
                                        className="w-24 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        placeholder="Desc. %"
                                        value={discount}
                                        onChange={(e) =>
                                            setDiscount(e.target.value)
                                        }
                                        className="w-20 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleAddItem}
                                        disabled={adding || !selectedTreatment}
                                        className="gap-1.5 shrink-0"
                                    >
                                        {adding ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Plus className="h-3.5 w-3.5" />
                                        )}
                                        Agregar
                                    </Button>
                                </div>
                            )}

                            {items.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-3">
                                    Sin tratamientos
                                </p>
                            ) : (
                                <div className="rounded-lg border border-border/50 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/50 bg-muted/40">
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                                    Tratamiento
                                                </th>
                                                <th className="hidden sm:table-cell px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                                                    Diente
                                                </th>
                                                <th className="hidden sm:table-cell px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                                                    Desc.
                                                </th>
                                                <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                                                    Subtotal
                                                </th>
                                                {isDraft && (
                                                    <th className="w-8" />
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item) => {
                                                const t =
                                                    treatmentMap[
                                                        item.treatmentId
                                                    ]
                                                const subtotal = t
                                                    ? t.unitPrice *
                                                      (1 - item.discount)
                                                    : 0
                                                return (
                                                    <tr
                                                        key={item.id}
                                                        className="border-b border-border/30 last:border-0"
                                                    >
                                                        <td className="px-3 py-2 text-xs text-foreground">
                                                            {t?.name ?? '—'}
                                                        </td>
                                                        <td className="hidden sm:table-cell px-3 py-2 text-center text-xs text-muted-foreground">
                                                            {item.toothNumber ||
                                                                '—'}
                                                        </td>
                                                        <td className="hidden sm:table-cell px-3 py-2 text-center text-xs text-muted-foreground">
                                                            {item.discount > 0
                                                                ? `${Math.round(item.discount * 100)}%`
                                                                : '—'}
                                                        </td>
                                                        <td className="px-3 py-2 text-right text-xs font-semibold">
                                                            {formatMoney(
                                                                subtotal
                                                            )}
                                                        </td>
                                                        {isDraft && (
                                                            <td className="px-2 py-2">
                                                                <button
                                                                    onClick={() =>
                                                                        removeItem(
                                                                            item.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        removing
                                                                    }
                                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t border-border/50 bg-muted/20">
                                                <td
                                                    colSpan={isDraft ? 3 : 2}
                                                    className="px-3 py-2 text-xs font-bold text-foreground"
                                                >
                                                    Total
                                                </td>
                                                <td className="px-3 py-2 text-right text-sm font-bold text-foreground">
                                                    {formatMoney(quote.total)}
                                                </td>
                                                {isDraft && <td />}
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Tab Pagos ── */}
                    {activeTab === 'payments' && (
                        <div className="flex flex-col gap-3">
                            {/* Resumen saldo */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    {
                                        label: 'Total',
                                        value: formatMoney(quote.total),
                                        cls: 'text-foreground',
                                    },
                                    {
                                        label: 'Pagado',
                                        value: formatMoney(totalPaid),
                                        cls: 'text-emerald-600',
                                    },
                                    {
                                        label: 'Pendiente',
                                        value: formatMoney(remaining),
                                        cls:
                                            remaining > 0
                                                ? 'text-rose-600'
                                                : 'text-emerald-600',
                                    },
                                ].map(({ label, value, cls }) => (
                                    <div
                                        key={label}
                                        className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
                                    >
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                            {label}
                                        </span>
                                        <p
                                            className={`text-xs font-bold mt-0.5 ${cls}`}
                                        >
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Barra de progreso */}
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>

                            {canPay && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 w-fit"
                                    onClick={() => setPayModal(true)}
                                >
                                    <BadgeDollarSign className="h-3.5 w-3.5" />
                                    Registrar pago
                                </Button>
                            )}

                            {payments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-2">
                                    Sin pagos registrados
                                </p>
                            ) : (
                                <div className="rounded-lg border border-border/50 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/50 bg-muted/40">
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                                    Método
                                                </th>
                                                <th className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                                    Referencia
                                                </th>
                                                <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                                                    Monto
                                                </th>
                                                <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                                                    Estado
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map((p) => (
                                                <tr
                                                    key={p.id}
                                                    className="border-b border-border/30 last:border-0"
                                                >
                                                    <td className="px-3 py-2 text-xs text-foreground">
                                                        {
                                                            PAYMENT_METHOD_LABELS[
                                                                p.method
                                                            ]
                                                        }
                                                    </td>
                                                    <td className="hidden sm:table-cell px-3 py-2 text-xs text-muted-foreground">
                                                        {p.reference || '—'}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-xs font-semibold">
                                                        {formatMoney(p.amount)}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px]"
                                                        >
                                                            {p.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botones de estado */}
                    {quote.status === 'sent' && (
                        <div className="flex gap-2 pt-1 border-t border-border/40">
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                onClick={() =>
                                    patchQuote({
                                        id: quote.id,
                                        dto: { status: 'accepted' },
                                    })
                                }
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Aceptar
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50"
                                onClick={() =>
                                    patchQuote({
                                        id: quote.id,
                                        dto: { status: 'rejected' },
                                    })
                                }
                            >
                                <XCircle className="h-3.5 w-3.5" />
                                Rechazar
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {payModal && (
                <NewPaymentModal
                    quoteId={quote.id}
                    remaining={remaining}
                    onClose={() => setPayModal(false)}
                />
            )}
        </div>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function QuotesSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="h-16 rounded-xl bg-muted animate-pulse"
                />
            ))}
        </div>
    )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function PresupuestosPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Lee patientId de la URL si viene del recepcionista
    const urlPatientId = searchParams.get('patientId') ?? ''

    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
    const [showNewModal, setShowNewModal] = useState(false)

    // Si viene patientId por URL, lo usamos directamente
    const effectivePatientId = selectedPatient?.id ?? urlPatientId

    // Elige el hook según si hay paciente seleccionado
    const byPatient = useQuotesByPatient(
        effectivePatientId,
        statusFilter !== 'all' ? { status: statusFilter } : {}
    )
    const allQuotes = useQuotes(
        statusFilter !== 'all' ? { status: statusFilter } : {}
    )

    const active = effectivePatientId ? byPatient : allQuotes
    const loaderRef = useInfiniteScroll(
        active.hasNextPage,
        active.fetchNextPage
    )

    const quotes: PatientQuote[] = useMemo(
        () => active.data?.pages.flatMap((p) => p.data.data) ?? [],
        [active.data]
    )

    return (
        <div className="flex flex-col gap-5">
            {/* Encabezado */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Presupuestos
                </h1>
                <p className="text-sm text-muted-foreground">
                    Gestión de presupuestos y pagos de pacientes
                </p>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end flex-wrap">
                {/* Buscador paciente */}
                <PatientSearchFilter
                    selected={selectedPatient}
                    onSelect={(p) => {
                        setSelectedPatient(p)
                        // Actualiza la URL sin navegar
                        router.replace(`/presupuestos?patientId=${p.id}`, {
                            scroll: false,
                        })
                    }}
                    onClear={() => {
                        setSelectedPatient(null)
                        router.replace('/presupuestos', { scroll: false })
                    }}
                />

                {/* Filtro por status */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors
              ${
                  statusFilter === 'all'
                      ? 'border-primary/40 bg-primary/5 text-primary'
                      : 'border-border/60 bg-card text-muted-foreground hover:text-foreground'
              }`}
                    >
                        Todos
                    </button>
                    {STATUS_ORDER.map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors
                ${
                    statusFilter === s
                        ? 'border-primary/40 bg-primary/5 text-primary'
                        : 'border-border/60 bg-card text-muted-foreground hover:text-foreground'
                }`}
                        >
                            {QUOTE_STATUS_CFG[s].label}
                        </button>
                    ))}
                </div>

                {/* Botón nuevo */}
                <Button
                    size="sm"
                    className="gap-1.5 shrink-0 sm:ml-auto"
                    onClick={() => setShowNewModal(true)}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Nuevo Presupuesto
                </Button>
            </div>

            {/* Badge paciente activo */}
            {effectivePatientId && selectedPatient && (
                <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 w-fit">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {selectedPatient.name[0]}
                        {selectedPatient.lastName[0]}
                    </div>
                    <p className="text-sm font-medium text-foreground">
                        {selectedPatient.name} {selectedPatient.lastName}
                    </p>
                    <button
                        onClick={() => {
                            setSelectedPatient(null)
                            router.replace('/presupuestos', { scroll: false })
                        }}
                        className="text-muted-foreground hover:text-foreground ml-1"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* Lista */}
            {active.isLoading ? (
                <QuotesSkeleton />
            ) : quotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                    <ReceiptText className="h-10 w-10 opacity-20" />
                    <p className="text-sm">
                        {effectivePatientId
                            ? 'Este paciente no tiene presupuestos'
                            : 'Sin presupuestos registrados'}
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setShowNewModal(true)}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Crear el primero
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {quotes.map((q) => (
                        <QuoteCard key={q.id} quote={q} />
                    ))}
                </div>
            )}

            {/* Scroll infinito */}
            <div ref={loaderRef} className="flex justify-center py-2">
                {active.isFetchingNextPage && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
            </div>

            {/* Modal nuevo presupuesto */}
            {showNewModal && (
                <NewQuoteModal
                    defaultPatientId={effectivePatientId || undefined}
                    onClose={() => setShowNewModal(false)}
                />
            )}
        </div>
    )
}

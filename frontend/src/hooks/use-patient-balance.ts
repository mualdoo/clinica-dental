import { useMemo } from 'react'
import { useQuotesByPatient } from '@/hooks/use-billing'

// ─── Hook compuesto: saldo real por presupuesto ───────────────────────────────
// Carga los pagos completados de todos los presupuestos aceptados
// y calcula el saldo pendiente real por cada uno
export function usePatientBalance(patientId: string) {
    const { data: quotesData, isLoading: quotesLoading } =
        useQuotesByPatient(patientId)

    // Todos los pagos filtrados por patientId — el backend devuelve
    // solo los del paciente activo gracias a x-active-patient-id
    // const { data: paymentsData, isLoading: paymentsLoading } = usePayments({
    //     status: 'completed',
    // })

    const quotes = quotesData?.pages.flatMap((p) => p.data.data) ?? []
    const payments = quotes.flatMap((p) => p.Payments) ?? []

    const acceptedQuotes = quotes.filter((q) => q.status === 'accepted')

    // Suma pagos completados por quoteId
    const paidByQuote = useMemo(() => {
        return payments.reduce<Record<string, number>>((acc, payment) => {
            acc[payment.quoteId] = (acc[payment.quoteId] ?? 0) + payment.amount
            return acc
        }, {})
    }, [payments])

    // Saldo pendiente por presupuesto
    const quoteBalances = useMemo(() => {
        return acceptedQuotes.map((q) => ({
            quote: q,
            paid: paidByQuote[q.id] ?? 0,
            pending: Math.max(0, q.total - (paidByQuote[q.id] ?? 0)),
        }))
    }, [acceptedQuotes, paidByQuote])

    const totalPending = quoteBalances.reduce((acc, b) => acc + b.pending, 0)

    const totalAmount = acceptedQuotes.reduce((acc, q) => acc + q.total, 0)
    const totalPaid = totalAmount - totalPending
    const progressPct =
        totalAmount > 0 ? Math.min(100, (totalPaid / totalAmount) * 100) : 0

    return {
        quoteBalances,
        totalAmount,
        acceptedQuotes,
        totalPaid,
        totalPending,
        progressPct,
        isLoading: quotesLoading,
    }
}

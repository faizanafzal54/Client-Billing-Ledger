"use client"

import { useState, useTransition } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { recordPayment, updatePayment } from "@/app/actions/payments"
import { Spinner } from "@/components/ui"
import { notifyDataChanged } from "@/lib/client-data"
import { formatPKR } from "@/lib/money"
import { formatDate, todayISO } from "@/lib/utils"

export type PaymentValues = {
  id: string
  amount: number
  date: string
  method: string
  reference: string
  notes: string
  invoiceId: string
  kind: "credit" | "debit"
}

export function PaymentForm({
  clientId,
  invoiceId,
  payment,
  onDone,
}: {
  clientId: string
  invoiceId?: string
  remaining?: number
  payment?: PaymentValues
  onDone?: () => void
}) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [pending, startTransition] = useTransition()
  const editing = Boolean(payment)
  const [kind, setKind] = useState<"credit" | "debit">(payment?.kind === "debit" ? "debit" : "credit")

  function submit(formData: FormData) {
    setError("")
    setMessage("")
    startTransition(async () => {
      const result = editing ? await updatePayment(formData) : await recordPayment(formData)
      if (!result.ok) {
        setError(result.error || (editing ? "Could not update payment." : "Could not record payment."))
        return
      }
      setMessage(editing ? "Entry updated." : kind === "debit" ? "Previous pending added." : "Payment recorded.")
      router.refresh()
      notifyDataChanged()
      onDone?.()
    })
  }

  return (
    <form action={submit} className="space-y-3">
      <input type="hidden" name="clientId" value={clientId} />
      {payment ? <input type="hidden" name="id" value={payment.id} /> : null}
      {kind === "credit" && invoiceId ? <input type="hidden" name="invoiceId" value={invoiceId} /> : null}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="payment-amount">
            Amount
          </label>
          <input
            id="payment-amount"
            className="field"
            type="number"
            name="amount"
            min="0"
            step="0.01"
            required
            defaultValue={payment?.amount ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="payment-kind">
            Type
          </label>
          <select
            id="payment-kind"
            className="field"
            name="kind"
            value={kind}
            onChange={(event) => setKind(event.target.value === "debit" ? "debit" : "credit")}
          >
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="payment-date">
            Date
          </label>
          <input
            id="payment-date"
            className="field"
            type="date"
            name="date"
            required
            defaultValue={payment?.date.slice(0, 10) || todayISO()}
          />
        </div>
        <div>
          <label className="label" htmlFor="payment-method">
            Method
          </label>
          <select
            id="payment-method"
            className="field"
            name="method"
            defaultValue={payment?.method || "bank"}
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="label" htmlFor="payment-reference">
            Reference
          </label>
          <input
            id="payment-reference"
            className="field"
            name="reference"
            placeholder={kind === "debit" ? "Previous pending" : "Cheque / TRN no."}
            defaultValue={payment?.reference || ""}
          />
        </div>
        <div className="col-span-2">
          <label className="label" htmlFor="payment-notes">
            Notes
          </label>
          <input
            id="payment-notes"
            className="field"
            name="notes"
            defaultValue={payment?.notes || ""}
          />
        </div>
      </div>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      {message ? <p className="text-sm text-good">{message}</p> : null}
      <button className="btn-primary" disabled={pending} type="submit" aria-busy={pending}>
        {pending ? <Spinner /> : null}
        {pending ? "Saving…" : editing ? "Save" : kind === "debit" ? "Add debit" : "Record payment"}
      </button>
    </form>
  )
}

export function EditPaymentDialog({
  clientId,
  payment,
  invoiceId,
  onClose,
}: {
  clientId: string
  payment: PaymentValues
  invoiceId?: string
  onClose: () => void
}) {
  if (typeof document === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-paper p-5 sm:max-w-lg sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-2xl">Edit payment</h3>
          <button className="btn-ghost px-2" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <PaymentForm
          key={payment.id}
          clientId={clientId}
          invoiceId={invoiceId}
          payment={payment}
          onDone={onClose}
        />
      </div>
    </div>,
    document.body,
  )
}

export function InvoicePaymentList({
  clientId,
  invoiceId,
  payments,
}: {
  clientId: string
  invoiceId: string
  payments: PaymentValues[]
}) {
  const [editing, setEditing] = useState<PaymentValues | null>(null)

  if (payments.length === 0) {
    return <p className="mt-4 text-sm text-muted">No payments recorded yet.</p>
  }

  return (
    <>
      <ul className="mt-4 space-y-3">
        {payments.map((payment) => (
          <li key={payment.id} className="flex items-center justify-between gap-3 border-b border-line pb-3 text-sm">
            <div>
              <p className="capitalize">{payment.method}</p>
              <p className="text-xs text-muted">{formatDate(payment.date)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span>{formatPKR(payment.amount)}</span>
              <button className="btn-ghost px-2 py-1 text-xs" type="button" onClick={() => setEditing(payment)}>
                Edit
              </button>
            </div>
          </li>
        ))}
      </ul>
      {editing ? (
        <EditPaymentDialog
          clientId={clientId}
          invoiceId={invoiceId}
          payment={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </>
  )
}

"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { recordPayment } from "@/app/actions/payments"
import { todayISO } from "@/lib/utils"

export function PaymentForm({
  clientId,
  invoiceId,
  remaining,
}: {
  clientId: string
  invoiceId?: string
  remaining?: number
}) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [pending, startTransition] = useTransition()

  function submit(formData: FormData) {
    setError("")
    setMessage("")
    startTransition(async () => {
      const result = await recordPayment(formData)
      if (!result.ok) setError(result.error || "Could not record payment.")
      else {
        setMessage("Payment recorded.")
        router.refresh()
      }
    })
  }

  return (
    <form action={submit} className="space-y-3">
      <input type="hidden" name="clientId" value={clientId} />
      {invoiceId ? <input type="hidden" name="invoiceId" value={invoiceId} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Amount</label>
          <input
            className="field"
            type="number"
            name="amount"
            min="0"
            step="0.01"
            required
            defaultValue={remaining && remaining > 0 ? remaining : ""}
          />
        </div>
        <div>
          <label className="label">Date</label>
          <input className="field" type="date" name="date" defaultValue={todayISO()} required />
        </div>
        <div>
          <label className="label">Method</label>
          <select className="field" name="method" defaultValue="bank">
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>
        <div>
          <label className="label">Reference</label>
          <input className="field" name="reference" placeholder="Cheque / TRN no." />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Notes</label>
          <input className="field" name="notes" />
        </div>
      </div>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      {message ? <p className="text-sm text-good">{message}</p> : null}
      <button className="btn-primary" disabled={pending} type="submit">
        {pending ? "Saving…" : "Record payment"}
      </button>
    </form>
  )
}

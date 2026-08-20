"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { DeleteInvoiceButton } from "@/components/delete-invoice-button"
import { InvoiceDocument } from "@/components/invoice-document"
import { InvoicePreview } from "@/components/invoice-preview"
import { InvoicePaymentList, PaymentForm } from "@/components/payment-form"
import { InvoiceSheetSkeleton, LoadError, PageHeaderSkeleton } from "@/components/skeletons"
import { useApi } from "@/lib/client-data"
import { formatPKR } from "@/lib/money"
import { displayInvoiceNo, fileSlug } from "@/lib/utils"

type InvoiceDetailPayload = {
  invoice: {
    id: string
    globalNumber: string
    clientNumber: string
    clientId: string
    date: string
    dueDate: string | null
    poNumber: string
    vehicleNo: string
    notes: string
    taxPercent: number
    discount: number
    subtotal: number
    taxAmount: number
    total: number
    client: {
      name: string
      address: string
      city: string
      phone: string
      ntn: string
    }
    items: Array<{
      description: string
      quantity: number
      unit: string
      rate: number
      amount: number
    }>
    payments: Array<{
      id: string
      amount: number
      date: string
      method: string
      reference: string
      notes: string
      invoiceId: string | null
    }>
  }
  company: {
    name: string
    tagline: string
    address: string
    city: string
    phone: string
    email: string
    ntn: string
    strn: string
    bankName: string
    bankAccount: string
    bankIban: string
    invoiceNotes: string
  }
  paid: number
  remaining: number
}

export function InvoiceDetailView() {
  const { id } = useParams<{ id: string }>()
  const { data, error, loading } = useApi<InvoiceDetailPayload>(id ? `/api/invoices/${id}` : null)

  if (loading && !data) {
    return (
      <div>
        <PageHeaderSkeleton withAction />
        <InvoiceSheetSkeleton />
      </div>
    )
  }
  if (error === "not-found" || !data) return <LoadError message={error === "not-found" ? "Invoice not found." : "Could not load this page."} />

  const { invoice, company, paid, remaining } = data

  return (
    <div>
      <div className="no-print mb-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/clients/${invoice.clientId}`}
            className="font-display text-2xl text-ink hover:underline sm:text-3xl"
          >
            {invoice.client.name}
          </Link>
          <p className="mt-1 text-lg text-muted sm:text-xl">
            {displayInvoiceNo(invoice.globalNumber)} · {invoice.clientNumber}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <Link href={`/invoices/${invoice.id}/edit`} className="btn-ghost">
            Edit
          </Link>
          <DeleteInvoiceButton id={invoice.id} />
        </div>
      </div>

      <div className="mb-6">
        <InvoicePreview filename={fileSlug(`${displayInvoiceNo(invoice.globalNumber)}-${invoice.clientNumber}`)}>
          <InvoiceDocument invoice={invoice} company={company} paid={paid} />
        </InvoicePreview>
      </div>

      {/* <section className="no-print grid gap-4 lg:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <h2 className="font-display text-xl">Record payment</h2>
          <p className="mb-4 text-sm text-muted">
            Paid {formatPKR(paid)} · remaining {formatPKR(remaining)}
          </p>
          <PaymentForm clientId={invoice.clientId} invoiceId={invoice.id} remaining={remaining} />
        </div>
        <div className="card p-4 sm:p-5">
          <h2 className="font-display text-xl">Payments on this invoice</h2>
          <InvoicePaymentList
            clientId={invoice.clientId}
            invoiceId={invoice.id}
            payments={invoice.payments.map((payment) => ({
              id: payment.id,
              amount: payment.amount,
              date: payment.date,
              method: payment.method,
              reference: payment.reference,
              notes: payment.notes,
              invoiceId: payment.invoiceId || invoice.id,
            }))}
          />
        </div>
      </section> */}
    </div>
  )
}

"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ClientForm, DeleteClientButton } from "@/components/client-form"
import { ClientLedger } from "@/components/client-ledger"
import { PaymentForm } from "@/components/payment-form"
import { PageHeader, StatCard, StatusBadge } from "@/components/ui"
import { CardListSkeleton, LoadError, PageHeaderSkeleton, StatRowSkeleton, TableSkeleton } from "@/components/skeletons"
import { useApi } from "@/lib/client-data"
import { formatNumber, formatPKR } from "@/lib/money"
import { displayInvoiceNo, formatDate } from "@/lib/utils"

type ClientDetailPayload = {
  billed: number
  paid: number
  outstanding: number
  products: Array<{ name: string; qty: number; amount: number; unit: string }>
  company: { name: string; city: string; address: string; phone: string }
  client: {
    id: string
    name: string
    prefix: string
    address: string
    city: string
    phone: string
    email: string
    ntn: string
    notes: string
  }
  invoices: Array<{
    id: string
    globalNumber: string
    clientNumber: string
    date: string
    total: number
    status: string
  }>
  ledger: Array<{
    id: string
    date: string
    type: "invoice" | "payment"
    reference: string
    debit: number
    credit: number
    balance: number
    method?: string
    notes?: string
    invoiceId?: string
    paymentReference?: string
  }>
  invoiceOptions: Array<{ id: string; label: string }>
}

export function ClientDetailView() {
  const { id } = useParams<{ id: string }>()
  const { data, error, loading } = useApi<ClientDetailPayload>(id ? `/api/clients/${id}` : null)

  if (loading && !data) {
    return (
      <div>
        <PageHeaderSkeleton withAction />
        <StatRowSkeleton count={3} />
        <div className="mt-6">
          <TableSkeleton />
        </div>
        <div className="mt-6">
          <CardListSkeleton />
        </div>
      </div>
    )
  }
  if (error === "not-found" || !data) {
    return <LoadError message={error === "not-found" ? "Client not found." : "Could not load this page."} />
  }

  const { client, billed, paid, outstanding, ledger, products, company, invoices, invoiceOptions } = data

  return (
    <div>
      <PageHeader
        title={client.name}
        description={``}
        actions={
          <>
            <DeleteClientButton id={client.id} />
          </>
        }
      />

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard label="Billed" value={formatPKR(billed)} />
        <StatCard label="Received" value={formatPKR(paid)} tone="good" />
        <StatCard label="Outstanding" value={formatPKR(outstanding)} tone={outstanding > 0 ? "warn" : "good"} />
      </div>

      <div className="mt-6 grid min-w-0 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <ClientLedger
          clientId={client.id}
          clientName={client.name}
          company={company}
          invoices={invoiceOptions}
          ledger={ledger}
        />

        <div className="min-w-0 space-y-4">
          <section className="card p-4 sm:p-5">
            <h2 className="font-display text-xl">Receive payment</h2>
            <p className="mb-4 text-sm text-muted">
              Applies to this client ledger. Leave invoice blank for a general receipt.
            </p>
            <PaymentForm clientId={client.id} remaining={outstanding} invoices={invoiceOptions} />
          </section>
          <section className="card p-4 sm:p-5">
            <h2 className="font-display text-xl">Product mix</h2>
            <div className="mt-3 space-y-3">
              {products.length === 0 ? (
                <p className="text-sm text-muted">No product sales yet.</p>
              ) : (
                products.map((product) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between gap-3 border-b border-line pb-3 text-sm last:border-0"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted">
                        {formatNumber(product.qty)} {product.unit}
                      </p>
                    </div>
                    <p>{formatPKR(product.amount)}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-display text-xl">Invoices</h2>
        </div>
        <ul>
          {invoices.map((invoice) => (
            <li key={invoice.id} className="border-b border-line last:border-0">
              <Link href={`/invoices/${invoice.id}`} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium">
                    {displayInvoiceNo(invoice.globalNumber)} · {invoice.clientNumber}
                  </p>
                  <p className="text-xs text-muted">{formatDate(invoice.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatPKR(invoice.total)}</p>
                  <StatusBadge status={invoice.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="card mt-6 p-4 sm:p-5">
        <h2 className="font-display mb-4 text-xl">Edit client</h2>
        <ClientForm client={client} />
      </section>
    </div>
  )
}

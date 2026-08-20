"use client"

import Link from "next/link"
import { PageHeader, StatCard, EmptyState } from "@/components/ui"
import { DashboardSkeleton, LoadError } from "@/components/skeletons"
import { useApi } from "@/lib/client-data"
import { formatPKR } from "@/lib/money"
import { displayInvoiceNo, formatDate } from "@/lib/utils"

type DashboardPayload = {
  monthSales: number
  yearSales: number
  outstanding: number
  invoiceCount: number
  clientCount: number
  monthlySales: Array<{ key: string; label: string; total: number }>
  byClient: Array<{ id: string; name: string; billed: number; outstanding: number; invoices: number }>
  recent: Array<{
    id: string
    globalNumber: string
    clientNumber: string
    date: string
    total: number
    clientName: string
  }>
  topProducts: Array<{ name: string; qty: number; amount: number }>
}

export function DashboardView() {
  const { data, error, loading } = useApi<DashboardPayload>("/api/dashboard")

  if (loading && !data) return <DashboardSkeleton />
  if (error || !data) return <LoadError />

  return (
    <div>
      <PageHeader
        title="Sales dashboard"
        description="Live totals for Asghar Ali Chemicals"
        actions={
          <></>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="This month" value={formatPKR(data.monthSales)} hint="Invoiced this calendar month" />
        <StatCard label="Year to date" value={formatPKR(data.yearSales)} />
        <StatCard
          label="Outstanding"
          value={formatPKR(data.outstanding)}
          tone={data.outstanding > 0 ? "warn" : "good"}
          hint="Billed minus payments received"
        />
        <StatCard label="Invoices" value={String(data.invoiceCount)} hint={`${data.clientCount} clients`} />
      </div>

      <div className="mt-6">
        <section className="card p-4 sm:p-5">
          <h2 className="font-display text-xl">Client balances</h2>
          <div className="mt-4 space-y-3">
            {data.byClient.length === 0 ? (
              <p className="text-sm text-muted">No clients yet.</p>
            ) : (
              data.byClient.slice(0, 6).map((client) => (
                <Link key={client.id} href={`/clients/${client.id}`} className="block border-b border-line pb-3 last:border-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-xs text-muted">{client.invoices} invoices</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{formatPKR(client.billed)}</p>
                      <p className="text-xs text-warn">{formatPKR(client.outstanding)} due</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="font-display text-xl">Recent invoices</h2>
            <Link href="/invoices" className="text-sm text-brass-dark">
              View all
            </Link>
          </div>
          {data.recent.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No invoices yet"
                description="Create your first invoice for TurkPlast, DuraFlow, or any other client."
                action={
                  <Link href="/invoices/new" className="btn-primary">
                    New invoice
                  </Link>
                }
              />
            </div>
          ) : (
            <ul>
              {data.recent.map((invoice) => (
                <li key={invoice.id} className="border-b border-line last:border-0">
                  <Link href={`/invoices/${invoice.id}`} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="font-medium">
                        {invoice.clientName}
                      </p>
                      <p className="text-xs text-muted">
                        {displayInvoiceNo(invoice.globalNumber)} · {invoice.clientNumber} · {formatDate(invoice.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{formatPKR(invoice.total)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-4 sm:p-5">
          <h2 className="font-display text-xl">Top products</h2>
          <div className="mt-4 space-y-3">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-muted">Product sales will appear after you create invoices.</p>
            ) : (
              data.topProducts.map((product) => (
                <div key={product.name} className="flex items-center justify-between gap-3 border-b border-line pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted">Qty {product.qty}</p>
                  </div>
                  <p className="text-sm">{formatPKR(product.amount)}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

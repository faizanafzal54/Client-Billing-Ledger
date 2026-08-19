"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"
import { EmptyState, StatusBadge } from "@/components/ui"
import type { InvoiceListFilters } from "@/lib/invoice-list"
import { invoiceListHref } from "@/lib/invoice-list"
import { formatPKR } from "@/lib/money"
import { displayInvoiceNo, formatDate, cn } from "@/lib/utils"

export type InvoiceRow = {
  id: string
  globalNumber: string
  clientNumber: string
  clientId: string
  clientName: string
  date: string
  total: number
  status: string
}

export function InvoiceList({
  invoices,
  clients,
  filters,
  total,
  pageSize,
  totalPages,
}: {
  invoices: InvoiceRow[]
  clients: Array<{ id: string; name: string }>
  filters: InvoiceListFilters
  total: number
  pageSize: number
  totalPages: number
}) {
  const router = useRouter()
  const [query, setQuery] = useState(filters.query)
  const [more, setMore] = useState(false)

  useEffect(() => {
    setQuery(filters.query)
  }, [filters.query])

  useEffect(() => {
    if (query === filters.query) return
    const timer = window.setTimeout(() => {
      router.replace(
        invoiceListHref({
          query,
          clientId: filters.clientId,
          status: filters.status,
          from: filters.from,
          to: filters.to,
          page: 1,
        }),
      )
    }, 350)
    return () => window.clearTimeout(timer)
  }, [filters.clientId, filters.from, filters.query, filters.status, filters.to, query, router])

  const active = Boolean(filters.query || filters.clientId || filters.status || filters.from || filters.to)
  const extraActive = Boolean(filters.clientId || filters.from || filters.to)
  const fromItem = total === 0 ? 0 : (filters.page - 1) * pageSize + 1
  const toItem = Math.min(filters.page * pageSize, total)

  function setFilter(patch: Partial<InvoiceListFilters>) {
    router.replace(invoiceListHref({ ...filters, query, ...patch, page: 1 }))
  }

  return (
    <div>
      <div className="card mb-4 pt-2 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-1">
            <div className="min-w-0 flex-1">
              <label className="label" htmlFor="invoice-search">
                Search
              </label>
              <input
                id="invoice-search"
                className="field"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="INV00001, Turk1, DuraFlow"
              />
            </div>
            <div className="md:hidden">
              <button
                className="btn-ghost mb-px shrink-0"
                type="button"
                onClick={() => setMore((value) => !value)}
              >
                {more ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {more ? "Less" : extraActive ? "Filters (on)" : "More filters"}
              </button>
            </div>
          </div>
          <div className={more ? "contents" : "hidden md:contents"}>
            <div>
              <label className="label" htmlFor="invoice-client">
                Client
              </label>
              <select
                id="invoice-client"
                className="field"
                value={filters.clientId}
                onChange={(event) => setFilter({ clientId: event.target.value })}
              >
                <option value="">All clients</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="invoice-from">
                From
              </label>
              <input
                id="invoice-from"
                className="field"
                type="date"
                value={filters.from}
                onChange={(event) => setFilter({ from: event.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="invoice-to">
                To
              </label>
              <input
                id="invoice-to"
                className="field"
                type="date"
                value={filters.to}
                onChange={(event) => setFilter({ to: event.target.value })}
              />
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className={cn("btn-ghost py-1.5", !filters.status && "border-ink bg-cream")}
            type="button"
            onClick={() => setFilter({ status: "" })}
          >
            All
          </button>
          <button
            className={cn("btn-ghost py-1.5", filters.status === "unpaid" && "border-ink bg-cream")}
            type="button"
            onClick={() => setFilter({ status: filters.status === "unpaid" ? "" : "unpaid" })}
          >
            Unpaid
          </button>
          <button
            className={cn("btn-ghost py-1.5", filters.status === "paid" && "border-ink bg-cream")}
            type="button"
            onClick={() => setFilter({ status: filters.status === "paid" ? "" : "paid" })}
          >
            Paid
          </button>
        </div>
        {active ? (
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted">
              {total} matching {total === 1 ? "invoice" : "invoices"}
            </p>
            <button
              className="btn-ghost"
              type="button"
              onClick={() => {
                setQuery("")
                router.replace("/invoices")
              }}
            >
              Clear
            </button>
          </div>
        ) : null}
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          title={active ? "No matching invoices" : "No invoices yet"}
          description={
            active
              ? "Try a different search, client, status, or date range."
              : "Create an invoice and add products or clients on the fly if they are not already in the ledger."
          }
          action={
            active ? undefined : (
              <Link href="/invoices/new" className="btn-primary">
                Create invoice
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="hidden grid-cols-[1.2fr_1.1fr_0.8fr_0.7fr_0.6fr] gap-3 border-b border-line bg-cream px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted md:grid">
              <span>Client</span>
              <span>Numbers</span>
              <span>Date</span>
              <span>Total</span>
              <span>Status</span>
            </div>
            <ul>
              {invoices.map((invoice) => (
                <li key={invoice.id} className="border-b border-line last:border-0">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 md:grid md:grid-cols-[1.2fr_1.1fr_0.8fr_0.7fr_0.6fr] md:items-center"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-brass-dark">{invoice.clientName}</p>
                      <p className="text-xs text-muted md:hidden">
                        {displayInvoiceNo(invoice.globalNumber)} · {invoice.clientNumber} · {formatDate(invoice.date)}
                      </p>
                    </div>
                    <p className="hidden md:block">
                      {displayInvoiceNo(invoice.globalNumber)} · {invoice.clientNumber}
                    </p>
                    <p className="hidden text-sm text-muted md:block">{formatDate(invoice.date)}</p>
                    <div className="shrink-0 text-right md:contents">
                      <p className="text-sm md:text-left">{formatPKR(invoice.total)}</p>
                      <div className="mt-1 flex justify-end md:mt-0 md:block">
                        <StatusBadge status={invoice.status} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">
              Showing {fromItem}–{toItem} of {total}
            </p>
            {totalPages > 1 ? (
              <div className="flex items-center gap-2">
                {filters.page > 1 ? (
                  <Link href={invoiceListHref(filters, filters.page - 1)} className="btn-ghost px-3">
                    <ChevronLeft size={16} />
                    Previous
                  </Link>
                ) : (
                  <span className="btn-ghost pointer-events-none px-3 opacity-40">
                    <ChevronLeft size={16} />
                    Previous
                  </span>
                )}
                <p className="min-w-[7rem] text-center text-sm">
                  Page {filters.page} of {totalPages}
                </p>
                {filters.page < totalPages ? (
                  <Link href={invoiceListHref(filters, filters.page + 1)} className="btn-ghost px-3">
                    Next
                    <ChevronRight size={16} />
                  </Link>
                ) : (
                  <span className="btn-ghost pointer-events-none px-3 opacity-40">
                    Next
                    <ChevronRight size={16} />
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}

"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { InvoiceList } from "@/components/invoice-list"
import { PageHeader } from "@/components/ui"
import { LoadError, PageHeaderSkeleton, TableSkeleton } from "@/components/skeletons"
import { useApi } from "@/lib/client-data"
import { invoiceListHref, type InvoiceListFilters } from "@/lib/invoice-list"
import type { InvoiceRow } from "@/components/invoice-list"

type InvoicesPayload = {
  invoices: InvoiceRow[]
  clients: Array<{ id: string; name: string }>
  filters: InvoiceListFilters
  total: number
  pageSize: number
  totalPages: number
}

export function InvoicesView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const qs = searchParams.toString()
  const { data, error, loading } = useApi<InvoicesPayload>(`/api/invoices${qs ? `?${qs}` : ""}`)

  useEffect(() => {
    if (!data || data.total === 0) return
    if (data.filters.page > data.totalPages) {
      router.replace(invoiceListHref(data.filters, data.totalPages))
    }
  }, [data, router])

  if (loading && !data) {
    return (
      <div>
        <PageHeaderSkeleton withAction />
        <TableSkeleton />
      </div>
    )
  }
  if (error || !data) return <LoadError />

  return (
    <div>
      <PageHeader
        title="Invoices"
        description=""
        actions={
          <></>
          // <Link href="/invoices/new" className="btn-primary">
          //   New invoice
          // </Link>
        }
      />
      <InvoiceList
        invoices={data.invoices}
        clients={data.clients}
        filters={data.filters}
        total={data.total}
        pageSize={data.pageSize}
        totalPages={data.totalPages}
      />
    </div>
  )
}

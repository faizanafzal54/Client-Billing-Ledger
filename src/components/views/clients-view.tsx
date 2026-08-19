"use client"

import { ClientsManager } from "@/components/clients-manager"
import { PageHeader } from "@/components/ui"
import { LoadError, PageHeaderSkeleton, TableSkeleton } from "@/components/skeletons"
import { useApi } from "@/lib/client-data"

type ClientRow = {
  id: string
  name: string
  prefix: string
  city: string
  phone: string
  billed: number
  outstanding: number
  invoices: number
}

export function ClientsView() {
  const { data, error, loading } = useApi<ClientRow[]>("/api/clients")

  if (loading && !data) {
    return (
      <div>
        <PageHeaderSkeleton />
        <TableSkeleton />
      </div>
    )
  }
  if (error || !data) return <LoadError />

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Each client has its own ledger and invoice series, e.g. Turk1, Dura1."
      />
      <ClientsManager clients={data} />
    </div>
  )
}

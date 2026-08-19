"use client"

import { useParams } from "next/navigation"
import { InvoiceForm } from "@/components/invoice-form"
import { PageHeader } from "@/components/ui"
import { FormSkeleton, LoadError, PageHeaderSkeleton } from "@/components/skeletons"
import { useApi } from "@/lib/client-data"

type FormOptions = {
  clients: Array<{ id: string; name: string; prefix: string }>
  products: Array<{ id: string; name: string; unit: string; defaultRate: number }>
  defaultTax: number
}

type InvoicePayload = {
  invoice: {
    id: string
    clientId: string
    date: string
    dueDate: string | null
    poNumber: string
    vehicleNo: string
    notes: string
    taxPercent: number
    discount: number
    globalNumber: string
    clientNumber: string
    items: Array<{
      productId: string | null
      description: string
      unit: string
      quantity: number
      rate: number
    }>
  }
}

export function InvoiceEditorView({ mode }: { mode: "new" | "edit" }) {
  const params = useParams<{ id: string }>()
  const id = mode === "edit" ? params.id : null
  const form = useApi<FormOptions>("/api/invoice-form")
  const invoice = useApi<InvoicePayload>(id ? `/api/invoices/${id}` : null)
  const loading = (form.loading && !form.data) || (mode === "edit" && invoice.loading && !invoice.data)

  if (loading) {
    return (
      <div>
        <PageHeaderSkeleton />
        <FormSkeleton />
      </div>
    )
  }
  if (form.error || !form.data) return <LoadError />
  if (mode === "edit" && invoice.error === "not-found") {
    return <LoadError message="Invoice not found." />
  }
  if (mode === "edit" && (invoice.error || !invoice.data)) return <LoadError />

  const record = invoice.data?.invoice

  return (
    <div>
      <PageHeader
        title={mode === "new" ? "Create invoice" : `Edit ${record?.globalNumber}`}
        description={
          mode === "new"
            ? ""
            : `Client number ${record?.clientNumber} stays the same.`
        }
      />
      <InvoiceForm
        clients={form.data.clients}
        products={form.data.products}
        defaultTax={form.data.defaultTax}
        invoice={
          record
            ? {
                id: record.id,
                clientId: record.clientId,
                date: record.date.slice(0, 10),
                dueDate: record.dueDate ? record.dueDate.slice(0, 10) : "",
                poNumber: record.poNumber,
                vehicleNo: record.vehicleNo,
                notes: record.notes,
                taxPercent: record.taxPercent,
                discount: record.discount,
                lines: record.items.map((item) => ({
                  productId: item.productId ?? undefined,
                  name: item.description,
                  unit: item.unit,
                  quantity: item.quantity,
                  rate: item.rate,
                })),
              }
            : undefined
        }
      />
    </div>
  )
}

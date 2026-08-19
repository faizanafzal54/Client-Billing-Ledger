"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { InvoiceDocument } from "@/components/invoice-document"
import { PrintButton } from "@/components/print-button"
import { InvoiceSheetSkeleton, LoadError } from "@/components/skeletons"
import { useApi } from "@/lib/client-data"

type PrintPayload = {
  invoice: {
    globalNumber: string
    clientNumber: string
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
}

export function InvoicePrintView() {
  const { id } = useParams<{ id: string }>()
  const { data, error, loading } = useApi<PrintPayload>(id ? `/api/invoices/${id}` : null)

  if (loading && !data) return <InvoiceSheetSkeleton />
  if (error === "not-found" || !data) {
    return <LoadError message={error === "not-found" ? "Invoice not found." : "Could not load this page."} />
  }

  return (
    <div className="space-y-4">
      <div className="no-print flex items-center justify-between">
        <Link href={`/invoices/${id}`} className="btn-ghost">
          Back
        </Link>
        <PrintButton />
      </div>
      <div className="overflow-x-auto overscroll-x-contain print:overflow-visible">
        <InvoiceDocument invoice={data.invoice} company={data.company} paid={data.paid} />
      </div>
    </div>
  )
}

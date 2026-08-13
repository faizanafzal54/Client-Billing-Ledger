import Link from "next/link"
import { redirect } from "next/navigation"
import { InvoiceList } from "@/components/invoice-list"
import { PageHeader } from "@/components/ui"
import {
  INVOICE_PAGE_SIZE,
  invoiceListHref,
  invoiceListWhere,
  parseInvoiceListParams,
} from "@/lib/invoice-list"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const filters = parseInvoiceListParams(await searchParams)
  const where = invoiceListWhere(filters)

  const [invoices, total, clients] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { client: true },
      orderBy: { date: "desc" },
      skip: (filters.page - 1) * INVOICE_PAGE_SIZE,
      take: INVOICE_PAGE_SIZE,
    }),
    prisma.invoice.count({ where }),
    prisma.client.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / INVOICE_PAGE_SIZE))
  if (total > 0 && filters.page > totalPages) {
    redirect(invoiceListHref(filters, totalPages))
  }

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Each bill has a company number (INV00009) and a client number (Turk1)."
        actions={
          <Link href="/invoices/new" className="btn-primary">
            New invoice
          </Link>
        }
      />
      <InvoiceList
        invoices={invoices.map((invoice) => ({
          id: invoice.id,
          globalNumber: invoice.globalNumber,
          clientNumber: invoice.clientNumber,
          clientId: invoice.clientId,
          clientName: invoice.client.name,
          date: invoice.date.toISOString(),
          total: invoice.total,
          status: invoice.status,
        }))}
        clients={clients}
        filters={filters}
        total={total}
        pageSize={INVOICE_PAGE_SIZE}
        totalPages={totalPages}
      />
    </div>
  )
}

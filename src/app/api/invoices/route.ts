import { requireApiUser, json } from "@/lib/api-auth"
import {
  INVOICE_PAGE_SIZE,
  invoiceListWhere,
  parseInvoiceListParams,
} from "@/lib/invoice-list"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { error } = await requireApiUser()
  if (error) return error

  const url = new URL(request.url)
  const filters = parseInvoiceListParams(Object.fromEntries(url.searchParams.entries()))
  const where = invoiceListWhere(filters)

  const [invoices, total, clients] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { client: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
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

  return json({
    invoices: invoices.map((invoice) => ({
      id: invoice.id,
      globalNumber: invoice.globalNumber,
      clientNumber: invoice.clientNumber,
      clientId: invoice.clientId,
      clientName: invoice.client.name,
      date: invoice.date.toISOString(),
      total: invoice.total,
    })),
    clients,
    filters,
    total,
    pageSize: INVOICE_PAGE_SIZE,
    totalPages,
  })
}

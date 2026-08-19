import type { Prisma } from "@prisma/client"

export const INVOICE_PAGE_SIZE = 20

export type InvoiceListFilters = {
  query: string
  clientId: string
  status: string
  from: string
  to: string
  page: number
}

function param(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const value = searchParams[key]
  const raw = Array.isArray(value) ? value[0] : value
  return raw?.trim() ?? ""
}

export function parseInvoiceListParams(
  searchParams: Record<string, string | string[] | undefined>,
): InvoiceListFilters {
  const status = param(searchParams, "status")
  const clientId = param(searchParams, "client")
  return {
    query: param(searchParams, "q"),
    clientId: /^[a-f\d]{24}$/i.test(clientId) ? clientId : "",
    status: status === "unpaid" || status === "partial" || status === "paid" ? status : "",
    from: param(searchParams, "from"),
    to: param(searchParams, "to"),
    page: Math.max(1, Number.parseInt(param(searchParams, "page"), 10) || 1),
  }
}

export function invoiceListWhere(filters: InvoiceListFilters): Prisma.InvoiceWhereInput {
  const where: Prisma.InvoiceWhereInput = {}
  if (filters.clientId) where.clientId = filters.clientId
  if (filters.status === "paid") where.status = "paid"
  if (filters.status === "unpaid") where.status = { in: ["unpaid", "partial"] }
  if (filters.status === "partial") where.status = "partial"
  if (filters.from || filters.to) {
    where.date = {}
    if (filters.from) where.date.gte = new Date(`${filters.from}T00:00:00.000`)
    if (filters.to) where.date.lte = new Date(`${filters.to}T23:59:59.999`)
  }

  const needle = filters.query.trim()
  if (needle) {
    const upper = needle.toUpperCase()
    const digits = needle.replace(/\D/g, "")
    const or: Prisma.InvoiceWhereInput[] = [
      { globalNumber: { contains: needle } },
      { globalNumber: { contains: upper } },
      { clientNumber: { contains: needle } },
      { clientNumber: { contains: upper } },
      { client: { name: { contains: needle } } },
    ]
    if (digits) {
      or.push({ globalNumber: { contains: `INV${digits.padStart(5, "0")}` } })
    }
    where.OR = or
  }

  return where
}

export function invoiceListHref(filters: InvoiceListFilters, page = filters.page) {
  const params = new URLSearchParams()
  if (filters.query) params.set("q", filters.query)
  if (filters.clientId) params.set("client", filters.clientId)
  if (filters.status) params.set("status", filters.status)
  if (filters.from) params.set("from", filters.from)
  if (filters.to) params.set("to", filters.to)
  if (page > 1) params.set("page", String(page))
  const query = params.toString()
  return query ? `/invoices?${query}` : "/invoices"
}

import { requireApiUser, json } from "@/lib/api-auth"
import { displayInvoiceNo } from "@/lib/utils"
import { getClientReport, getCompany } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiUser()
  if (error) return error
  const { id } = await params
  const [report, company] = await Promise.all([getClientReport(id), getCompany()])
  if (!report) return json({ error: "Not found" }, 404)

  const { client, billed, paid, outstanding, ledger, products } = report

  return json({
    billed,
    paid,
    outstanding,
    products,
    company: {
      name: company.name,
      city: company.city,
      address: company.address,
      phone: company.phone,
    },
    client: {
      id: client.id,
      name: client.name,
      prefix: client.prefix,
      address: client.address,
      city: client.city,
      phone: client.phone,
      email: client.email,
      ntn: client.ntn,
      notes: client.notes,
    },
    invoices: client.invoices.map((invoice) => ({
      id: invoice.id,
      globalNumber: invoice.globalNumber,
      clientNumber: invoice.clientNumber,
      date: invoice.date.toISOString(),
      total: invoice.total,
      status: invoice.status,
    })),
    ledger: ledger.map((row) => ({
      ...row,
      date: row.date.toISOString(),
    })),
    invoiceOptions: client.invoices.map((invoice) => ({
      id: invoice.id,
      label: `${displayInvoiceNo(invoice.globalNumber)} · ${invoice.clientNumber}`,
    })),
  })
}

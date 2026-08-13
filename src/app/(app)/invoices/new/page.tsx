import { InvoiceForm } from "@/components/invoice-form"
import { PageHeader } from "@/components/ui"
import { prisma } from "@/lib/prisma"
import { getCompany } from "@/lib/queries"

export const dynamic = "force-dynamic"

export default async function NewInvoicePage() {
  const [clients, products, company] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    getCompany(),
  ])

  return (
    <div>
      <PageHeader
        title="New invoice"
        description="Create a client or product here if it is not already in the list. Numbers are assigned as INV00001 and Turk1 automatically."
      />
      <InvoiceForm
        clients={clients.map((client) => ({ id: client.id, name: client.name, prefix: client.prefix }))}
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          unit: product.unit,
          defaultRate: product.defaultRate,
        }))}
        defaultTax={company.taxPercent}
      />
    </div>
  )
}

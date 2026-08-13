import { notFound } from "next/navigation"
import { InvoiceForm } from "@/components/invoice-form"
import { PageHeader } from "@/components/ui"
import { prisma } from "@/lib/prisma"
import { getCompany } from "@/lib/queries"

export const dynamic = "force-dynamic"

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [invoice, clients, products, company] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    getCompany(),
  ])
  if (!invoice) notFound()

  return (
    <div>
      <PageHeader
        title={`Edit ${invoice.globalNumber}`}
        description={`Client number ${invoice.clientNumber} stays the same.`}
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
        invoice={{
          id: invoice.id,
          clientId: invoice.clientId,
          date: invoice.date.toISOString().slice(0, 10),
          dueDate: invoice.dueDate ? invoice.dueDate.toISOString().slice(0, 10) : "",
          poNumber: invoice.poNumber,
          vehicleNo: invoice.vehicleNo,
          notes: invoice.notes,
          taxPercent: invoice.taxPercent,
          discount: invoice.discount,
          lines: invoice.items.map((item) => ({
            productId: item.productId ?? undefined,
            name: item.description,
            unit: item.unit,
            quantity: item.quantity,
            rate: item.rate,
          })),
        }}
      />
    </div>
  )
}

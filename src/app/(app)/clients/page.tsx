import { ClientsManager } from "@/components/clients-manager"
import { PageHeader } from "@/components/ui"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: { invoices: true, payments: true },
    orderBy: { name: "asc" },
  })

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Each client has its own ledger and invoice series, e.g. Turk1, Dura1."
      />
      <ClientsManager
        clients={clients.map((client) => {
          const billed = client.invoices.reduce((sum, invoice) => sum + invoice.total, 0)
          const paid = client.payments.reduce((sum, payment) => sum + payment.amount, 0)
          return {
            id: client.id,
            name: client.name,
            prefix: client.prefix,
            city: client.city,
            phone: client.phone,
            billed,
            outstanding: billed - paid,
            invoices: client.invoices.length,
          }
        })}
      />
    </div>
  )
}

import { requireApiUser, json } from "@/lib/api-auth"
import { paymentSides } from "@/lib/queries"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await requireApiUser()
  if (error) return error

  const clients = await prisma.client.findMany({
    include: { invoices: true, payments: true },
    orderBy: { name: "asc" },
  })

  return json(
    clients.map((client) => {
      const billed = client.invoices.reduce((sum, invoice) => sum + invoice.total, 0)
      const { credit: paid, debit } = paymentSides(client.payments)
      return {
        id: client.id,
        name: client.name,
        prefix: client.prefix,
        city: client.city,
        phone: client.phone,
        billed,
        outstanding: billed + debit - paid,
        invoices: client.invoices.length,
      }
    }),
  )
}

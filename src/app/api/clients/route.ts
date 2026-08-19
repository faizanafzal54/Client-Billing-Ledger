import { requireApiUser, json } from "@/lib/api-auth"
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
    }),
  )
}

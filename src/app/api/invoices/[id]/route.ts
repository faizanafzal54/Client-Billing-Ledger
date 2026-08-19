import { requireApiUser, json } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { getCompany } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiUser()
  if (error) return error
  const { id } = await params

  const [invoice, company] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        items: { orderBy: { sortOrder: "asc" } },
        payments: true,
      },
    }),
    getCompany(),
  ])
  if (!invoice) return json({ error: "Not found" }, 404)

  const paid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)

  return json({
    invoice: {
      ...invoice,
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
      items: invoice.items,
      payments: invoice.payments.map((payment) => ({
        ...payment,
        date: payment.date.toISOString(),
      })),
    },
    company,
    paid,
    remaining: Math.max(0, invoice.total - paid),
  })
}

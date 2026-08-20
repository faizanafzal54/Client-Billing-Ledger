import { requireApiUser, json } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { getCompany } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await requireApiUser()
  if (error) return error

  const [clients, products, company] = await Promise.all([
    prisma.client.findMany({
      select: { id: true, name: true, prefix: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      select: { id: true, name: true, unit: true, defaultRate: true, description: true },
      orderBy: { name: "asc" },
    }),
    getCompany(),
  ])

  return json({
    clients,
    products,
    defaultTax: company.taxPercent,
  })
}

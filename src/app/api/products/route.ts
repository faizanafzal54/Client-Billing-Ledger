import { requireApiUser, json } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await requireApiUser()
  if (error) return error
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } })
  return json(products)
}

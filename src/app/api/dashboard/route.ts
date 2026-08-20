import { requireApiUser, json } from "@/lib/api-auth"
import { getDashboardData } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await requireApiUser()
  if (error) return error
  const data = await getDashboardData()
  return json({
    ...data,
    recent: data.recent.map((invoice) => ({
      id: invoice.id,
      globalNumber: invoice.globalNumber,
      clientNumber: invoice.clientNumber,
      date: invoice.date.toISOString(),
      total: invoice.total,
      clientName: invoice.client.name,
    })),
  })
}

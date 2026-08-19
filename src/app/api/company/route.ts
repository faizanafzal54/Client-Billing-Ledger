import { requireApiUser, json } from "@/lib/api-auth"
import { getCompany } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await requireApiUser()
  if (error) return error
  return json(await getCompany())
}

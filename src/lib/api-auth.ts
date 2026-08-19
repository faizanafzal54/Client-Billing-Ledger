import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export async function requireApiUser() {
  const session = await getSession()
  if (!session?.userId) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  return { user: session, error: null }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(JSON.parse(JSON.stringify(data)), { status })
}

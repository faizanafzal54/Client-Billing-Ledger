"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugPrefix } from "@/lib/utils"
import type { ActionResult } from "@/lib/definitions"

function readClient(formData: FormData) {
  const name = String(formData.get("name") || "").trim()
  return {
    name,
    address: String(formData.get("address") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    ntn: String(formData.get("ntn") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
  }
}

async function uniqueClientPrefix(name: string) {
  const base = slugPrefix(name)
  const existing = await prisma.client.findMany({ select: { prefix: true } })
  const taken = new Set(existing.map((client) => client.prefix.toLowerCase()))
  if (!taken.has(base.toLowerCase())) return base
  let n = 2
  while (taken.has(`${base}${n}`.toLowerCase())) n += 1
  return `${base}${n}`
}

export async function createClient(formData: FormData): Promise<ActionResult> {
  await requireUser()
  const data = readClient(formData)
  if (!data.name) return { ok: false, error: "Client name is required." }

  const prefix = await uniqueClientPrefix(data.name)
  const client = await prisma.client.create({ data: { ...data, prefix } })
  revalidatePath("/clients")
  revalidatePath("/invoices")
  revalidatePath("/dashboard")
  return { ok: true, id: client.id, prefix: client.prefix }
}

export async function updateClient(formData: FormData): Promise<ActionResult> {
  await requireUser()
  const id = String(formData.get("id") || "")
  const data = readClient(formData)
  if (!id) return { ok: false, error: "Missing client." }
  if (!data.name) return { ok: false, error: "Client name is required." }

  const existing = await prisma.client.findUnique({ where: { id } })
  if (!existing) return { ok: false, error: "Client not found." }

  await prisma.client.update({
    where: { id },
    data: { ...data, prefix: existing.prefix },
  })
  revalidatePath("/clients")
  revalidatePath(`/clients/${id}`)
  revalidatePath("/invoices")
  return { ok: true, id }
}

export async function deleteClient(formData: FormData): Promise<ActionResult> {
  await requireUser()
  const id = String(formData.get("id") || "")
  const invoices = await prisma.invoice.count({ where: { clientId: id } })
  if (invoices > 0) {
    return { ok: false, error: "Cannot delete a client that has invoices. Archive by leaving them listed." }
  }
  await prisma.payment.deleteMany({ where: { clientId: id } })
  await prisma.client.delete({ where: { id } })
  revalidatePath("/clients")
  revalidatePath("/dashboard")
  return { ok: true }
}

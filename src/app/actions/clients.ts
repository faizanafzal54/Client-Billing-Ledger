"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugPrefix } from "@/lib/utils"
import type { ActionResult } from "@/lib/definitions"

function readClient(formData: FormData) {
  const name = String(formData.get("name") || "").trim()
  const prefix = String(formData.get("prefix") || slugPrefix(name)).trim()
  return {
    name,
    prefix,
    address: String(formData.get("address") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    ntn: String(formData.get("ntn") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
  }
}

export async function createClient(formData: FormData): Promise<ActionResult> {
  await requireUser()
  const data = readClient(formData)
  if (!data.name) return { ok: false, error: "Client name is required." }
  if (!data.prefix) return { ok: false, error: "Invoice prefix is required (e.g. Turk)." }

  const client = await prisma.client.create({ data })
  revalidatePath("/clients")
  revalidatePath("/invoices")
  revalidatePath("/dashboard")
  return { ok: true, id: client.id }
}

export async function updateClient(formData: FormData): Promise<ActionResult> {
  await requireUser()
  const id = String(formData.get("id") || "")
  const data = readClient(formData)
  if (!id) return { ok: false, error: "Missing client." }
  if (!data.name) return { ok: false, error: "Client name is required." }

  await prisma.client.update({ where: { id }, data })
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

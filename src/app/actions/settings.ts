"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/lib/definitions"

export async function updateCompany(formData: FormData): Promise<ActionResult> {
  await requireUser()
  await prisma.company.upsert({
    where: { key: "company" },
    create: {
      key: "company",
      name: String(formData.get("name") || "Asghar Ali Chemicals").trim(),
      tagline: String(formData.get("tagline") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      ntn: String(formData.get("ntn") || "").trim(),
      strn: String(formData.get("strn") || "").trim(),
      bankName: String(formData.get("bankName") || "").trim(),
      bankAccount: String(formData.get("bankAccount") || "").trim(),
      bankIban: String(formData.get("bankIban") || "").trim(),
      taxPercent: Number(formData.get("taxPercent") || 0),
      invoiceNotes: String(formData.get("invoiceNotes") || "").trim(),
    },
    update: {
      name: String(formData.get("name") || "Asghar Ali Chemicals").trim(),
      tagline: String(formData.get("tagline") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      ntn: String(formData.get("ntn") || "").trim(),
      strn: String(formData.get("strn") || "").trim(),
      bankName: String(formData.get("bankName") || "").trim(),
      bankAccount: String(formData.get("bankAccount") || "").trim(),
      bankIban: String(formData.get("bankIban") || "").trim(),
      taxPercent: Number(formData.get("taxPercent") || 0),
      invoiceNotes: String(formData.get("invoiceNotes") || "").trim(),
    },
  })
  revalidatePath("/settings")
  revalidatePath("/invoices")
  return { ok: true }
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const user = await requireUser()
  const current = String(formData.get("currentPassword") || "")
  const next = String(formData.get("newPassword") || "")
  if (next.length < 8) return { ok: false, error: "New password must be at least 8 characters." }

  const record = await prisma.user.findUnique({ where: { id: user.userId } })
  if (!record) return { ok: false, error: "User not found." }
  const valid = await bcrypt.compare(current, record.password)
  if (!valid) return { ok: false, error: "Current password is incorrect." }

  await prisma.user.update({
    where: { id: user.userId },
    data: { password: await bcrypt.hash(next, 10) },
  })
  return { ok: true }
}

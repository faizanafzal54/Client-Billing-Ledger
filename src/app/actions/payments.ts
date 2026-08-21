"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/lib/definitions"
import { dateAtTime, todayISO } from "@/lib/utils"

export async function recordPayment(formData: FormData): Promise<ActionResult> {
  await requireUser()
  const clientId = String(formData.get("clientId") || "")
  const amount = Number(formData.get("amount") || 0)
  const kind = String(formData.get("kind") || "credit") === "debit" ? "debit" : "credit"
  if (!clientId) return { ok: false, error: "Client is required." }
  if (!(amount > 0)) return { ok: false, error: "Enter an amount." }

  const invoiceId = kind === "debit" ? null : String(formData.get("invoiceId") || "") || null
  try {
    const payment = await prisma.payment.create({
      data: {
        clientId,
        amount,
        kind,
        date: dateAtTime(String(formData.get("date") || todayISO())),
        method: String(formData.get("method") || "cash"),
        reference: String(formData.get("reference") || "").trim(),
        notes: String(formData.get("notes") || "").trim(),
        ...(invoiceId ? { invoiceId } : {}),
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/invoices")
    revalidatePath(`/clients/${clientId}`)
    revalidatePath("/reports")
    if (invoiceId) revalidatePath(`/invoices/${invoiceId}`)
    return { ok: true, id: payment.id }
  } catch (error) {
    console.error(error)
    return { ok: false, error: "Could not record this entry." }
  }
}

export async function updatePayment(formData: FormData): Promise<ActionResult> {
  await requireUser()
  const id = String(formData.get("id") || "")
  const amount = Number(formData.get("amount") || 0)
  if (!id) return { ok: false, error: "Missing payment." }
  if (!(amount > 0)) return { ok: false, error: "Enter an amount." }

  const existing = await prisma.payment.findUnique({ where: { id } })
  if (!existing) return { ok: false, error: "Payment not found." }

  const kind = String(formData.get("kind") || existing.kind || "credit") === "debit" ? "debit" : "credit"
  const invoiceId =
    kind === "debit" ? null : String(formData.get("invoiceId") || existing.invoiceId || "") || null
  try {
    await prisma.payment.update({
      where: { id },
      data: {
        amount,
        kind,
        date: dateAtTime(String(formData.get("date") || existing.date.toISOString()), existing.date),
        method: String(formData.get("method") || existing.method),
        reference: String(formData.get("reference") || "").trim(),
        notes: String(formData.get("notes") || "").trim(),
        invoiceId,
      },
    })
  } catch (error) {
    console.error(error)
    return { ok: false, error: "Could not update this entry." }
  }

  revalidatePath("/dashboard")
  revalidatePath("/invoices")
  revalidatePath(`/clients/${existing.clientId}`)
  revalidatePath("/reports")
  if (existing.invoiceId) revalidatePath(`/invoices/${existing.invoiceId}`)
  if (invoiceId && invoiceId !== existing.invoiceId) revalidatePath(`/invoices/${invoiceId}`)
  return { ok: true, id }
}

export async function deletePayment(formData: FormData): Promise<ActionResult> {
  await requireUser()
  const id = String(formData.get("id") || "")
  const payment = await prisma.payment.findUnique({ where: { id } })
  if (!payment) return { ok: false, error: "Payment not found." }
  await prisma.payment.delete({ where: { id } })
  revalidatePath("/dashboard")
  revalidatePath(`/clients/${payment.clientId}`)
  revalidatePath("/reports")
  if (payment.invoiceId) revalidatePath(`/invoices/${payment.invoiceId}`)
  return { ok: true }
}

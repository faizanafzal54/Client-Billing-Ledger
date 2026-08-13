"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import { invoiceStatus } from "@/lib/invoices"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/lib/definitions"

async function refreshInvoiceStatus(invoiceId: string | null) {
  if (!invoiceId) return
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  })
  if (!invoice) return
  const paid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: invoiceStatus(invoice.total, paid) },
  })
}

export async function recordPayment(formData: FormData): Promise<ActionResult> {
  await requireUser()
  const clientId = String(formData.get("clientId") || "")
  const amount = Number(formData.get("amount") || 0)
  if (!clientId) return { ok: false, error: "Client is required." }
  if (!(amount > 0)) return { ok: false, error: "Enter a payment amount." }

  const invoiceId = String(formData.get("invoiceId") || "") || null
  const payment = await prisma.payment.create({
    data: {
      clientId,
      invoiceId,
      amount,
      date: new Date(String(formData.get("date") || new Date().toISOString())),
      method: String(formData.get("method") || "cash"),
      reference: String(formData.get("reference") || "").trim(),
      notes: String(formData.get("notes") || "").trim(),
    },
  })

  await refreshInvoiceStatus(invoiceId)
  revalidatePath("/dashboard")
  revalidatePath("/invoices")
  revalidatePath(`/clients/${clientId}`)
  revalidatePath("/reports")
  if (invoiceId) revalidatePath(`/invoices/${invoiceId}`)
  return { ok: true, id: payment.id }
}

export async function deletePayment(formData: FormData): Promise<ActionResult> {
  await requireUser()
  const id = String(formData.get("id") || "")
  const payment = await prisma.payment.findUnique({ where: { id } })
  if (!payment) return { ok: false, error: "Payment not found." }
  await prisma.payment.delete({ where: { id } })
  await refreshInvoiceStatus(payment.invoiceId)
  revalidatePath("/dashboard")
  revalidatePath(`/clients/${payment.clientId}`)
  revalidatePath("/reports")
  if (payment.invoiceId) revalidatePath(`/invoices/${payment.invoiceId}`)
  return { ok: true }
}

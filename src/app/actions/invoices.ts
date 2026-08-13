"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { invoiceStatus, nextInvoiceNumbers } from "@/lib/invoices"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/lib/definitions"

type LineInput = {
  productId?: string
  name: string
  unit: string
  quantity: number
  rate: number
}

function parseLines(formData: FormData): LineInput[] {
  const raw = String(formData.get("lines") || "[]")
  try {
    const parsed = JSON.parse(raw) as LineInput[]
    return parsed.filter((line) => line.name && line.quantity > 0)
  } catch {
    return []
  }
}

function totals(lines: LineInput[], taxPercent: number, discount: number) {
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.rate, 0)
  const afterDiscount = Math.max(0, subtotal - discount)
  const taxAmount = afterDiscount * (taxPercent / 100)
  return {
    subtotal,
    taxAmount,
    total: afterDiscount + taxAmount,
  }
}

async function resolveProductId(line: LineInput) {
  if (line.productId) return line.productId
  const existing = await prisma.product.findFirst({
    where: { name: line.name },
  })
  if (existing) return existing.id
  const created = await prisma.product.create({
    data: {
      name: line.name,
      unit: line.unit || "KG",
      defaultRate: line.rate,
    },
  })
  return created.id
}

export async function createInvoice(formData: FormData): Promise<ActionResult> {
  const user = await requireUser()
  const clientId = String(formData.get("clientId") || "")
  const lines = parseLines(formData)
  if (!clientId) return { ok: false, error: "Select or create a client." }
  if (!lines.length) return { ok: false, error: "Add at least one product line." }

  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client) return { ok: false, error: "Client not found." }

  const taxPercent = Number(formData.get("taxPercent") || 0)
  const discount = Number(formData.get("discount") || 0)
  const date = new Date(String(formData.get("date") || new Date().toISOString()))
  const dueRaw = String(formData.get("dueDate") || "")
  const amounts = totals(lines, taxPercent, discount)
  const numbers = await nextInvoiceNumbers(client.id, client.prefix)

  const items = []
  for (const [index, line] of lines.entries()) {
    const productId = await resolveProductId(line)
    items.push({
      productId,
      description: line.name,
      quantity: line.quantity,
      unit: line.unit || "KG",
      rate: line.rate,
      amount: line.quantity * line.rate,
      sortOrder: index,
    })
  }

  const invoice = await prisma.invoice.create({
    data: {
      globalNumber: numbers.globalNumber,
      clientNumber: numbers.clientNumber,
      date,
      dueDate: dueRaw ? new Date(dueRaw) : null,
      poNumber: String(formData.get("poNumber") || "").trim(),
      vehicleNo: String(formData.get("vehicleNo") || "").trim(),
      clientId: client.id,
      notes: String(formData.get("notes") || "").trim(),
      taxPercent,
      discount,
      subtotal: amounts.subtotal,
      taxAmount: amounts.taxAmount,
      total: amounts.total,
      status: "unpaid",
      createdBy: user.email,
      items: { create: items },
    },
  })

  revalidatePath("/invoices")
  revalidatePath("/dashboard")
  revalidatePath("/clients")
  revalidatePath(`/clients/${client.id}`)
  revalidatePath("/reports")
  redirect(`/invoices/${invoice.id}`)
}

export async function updateInvoice(formData: FormData): Promise<ActionResult> {
  await requireUser()
  const id = String(formData.get("id") || "")
  const clientId = String(formData.get("clientId") || "")
  const lines = parseLines(formData)
  if (!id) return { ok: false, error: "Missing invoice." }
  if (!clientId) return { ok: false, error: "Select a client." }
  if (!lines.length) return { ok: false, error: "Add at least one product line." }

  const existing = await prisma.invoice.findUnique({
    where: { id },
    include: { payments: true },
  })
  if (!existing) return { ok: false, error: "Invoice not found." }

  const taxPercent = Number(formData.get("taxPercent") || 0)
  const discount = Number(formData.get("discount") || 0)
  const date = new Date(String(formData.get("date") || existing.date.toISOString()))
  const dueRaw = String(formData.get("dueDate") || "")
  const amounts = totals(lines, taxPercent, discount)
  const paid = existing.payments.reduce((sum, payment) => sum + payment.amount, 0)

  const items = []
  for (const [index, line] of lines.entries()) {
    const productId = await resolveProductId(line)
    items.push({
      productId,
      description: line.name,
      quantity: line.quantity,
      unit: line.unit || "KG",
      rate: line.rate,
      amount: line.quantity * line.rate,
      sortOrder: index,
    })
  }

  await prisma.$transaction([
    prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
    prisma.invoice.update({
      where: { id },
      data: {
        date,
        dueDate: dueRaw ? new Date(dueRaw) : null,
        poNumber: String(formData.get("poNumber") || "").trim(),
        vehicleNo: String(formData.get("vehicleNo") || "").trim(),
        notes: String(formData.get("notes") || "").trim(),
        taxPercent,
        discount,
        subtotal: amounts.subtotal,
        taxAmount: amounts.taxAmount,
        total: amounts.total,
        status: invoiceStatus(amounts.total, paid),
        items: { create: items },
      },
    }),
  ])

  revalidatePath("/invoices")
  revalidatePath(`/invoices/${id}`)
  revalidatePath("/dashboard")
  revalidatePath(`/clients/${existing.clientId}`)
  revalidatePath("/reports")
  return { ok: true, id }
}

export async function deleteInvoice(formData: FormData): Promise<ActionResult> {
  await requireUser()
  const id = String(formData.get("id") || "")
  const invoice = await prisma.invoice.findUnique({ where: { id } })
  if (!invoice) return { ok: false, error: "Invoice not found." }
  await prisma.invoice.delete({ where: { id } })
  revalidatePath("/invoices")
  revalidatePath("/dashboard")
  revalidatePath(`/clients/${invoice.clientId}`)
  revalidatePath("/reports")
  redirect("/invoices")
}

"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/lib/definitions"

function readProduct(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    unit: String(formData.get("unit") || "KG").trim() || "KG",
    defaultRate: Number(formData.get("defaultRate") || 0),
    description: String(formData.get("description") || "").trim(),
  }
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  await requireUser()
  const data = readProduct(formData)
  if (!data.name) return { ok: false, error: "Product name is required." }

  const product = await prisma.product.create({ data })
  revalidatePath("/products")
  revalidatePath("/invoices")
  return { ok: true, id: product.id }
}

export async function updateProduct(formData: FormData): Promise<ActionResult> {
  await requireUser()
  const id = String(formData.get("id") || "")
  const data = readProduct(formData)
  if (!id) return { ok: false, error: "Missing product." }
  if (!data.name) return { ok: false, error: "Product name is required." }

  await prisma.product.update({ where: { id }, data })
  revalidatePath("/products")
  return { ok: true, id }
}

export async function deleteProduct(formData: FormData): Promise<ActionResult> {
  await requireUser()
  const id = String(formData.get("id") || "")
  await prisma.invoiceItem.updateMany({
    where: { productId: id },
    data: { productId: null },
  })
  await prisma.product.delete({ where: { id } })
  revalidatePath("/products")
  return { ok: true }
}

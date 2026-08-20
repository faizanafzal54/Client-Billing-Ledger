"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createProduct, deleteProduct, updateProduct } from "@/app/actions/products"
import { ConfirmDeleteButton } from "@/components/confirm-dialog"
import { Spinner } from "@/components/ui"
import { notifyDataChanged } from "@/lib/client-data"

type ProductValues = {
  id?: string
  name: string
  unit: string
  defaultRate: number
  description: string
}

export function ProductForm({
  product,
  onDone,
}: {
  product?: ProductValues
  onDone?: () => void
}) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function submit(formData: FormData) {
    setError("")
    startTransition(async () => {
      const result = product?.id ? await updateProduct(formData) : await createProduct(formData)
      if (!result.ok) setError(result.error || "Could not save product.")
      else {
        router.refresh()
        notifyDataChanged()
        onDone?.()
      }
    })
  }

  return (
    <form action={submit} className="space-y-3">
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Name</label>
          <input className="field" name="name" required defaultValue={product?.name} placeholder="PVC Resin K67" />
        </div>
        <div>
          <label className="label">Unit</label>
          <input className="field" name="unit" defaultValue={product?.unit ?? "KG"} />
        </div>
        <div>
          <label className="label">Default rate (PKR)</label>
          <input
            className="field"
            type="number"
            name="defaultRate"
            min="0"
            step="0.01"
            defaultValue={product?.defaultRate ?? ""}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea className="field min-h-20" name="description" defaultValue={product?.description} />
        </div>
      </div>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      <button className="btn-primary" disabled={pending} type="submit" aria-busy={pending}>
        {pending ? <Spinner /> : null}
        {pending ? "Saving…" : product?.id ? "Save product" : "Create product"}
      </button>
    </form>
  )
}

export function DeleteProductButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      title="Delete this product?"
      description="It will be removed from the product list. Existing invoices keep the item name."
      onConfirm={async () => {
        const formData = new FormData()
        formData.set("id", id)
        return deleteProduct(formData)
      }}
    />
  )
}

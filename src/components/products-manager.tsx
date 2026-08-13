"use client"

import { useMemo, useState } from "react"
import { ProductForm, DeleteProductButton } from "@/components/product-form"
import { formatPKR } from "@/lib/money"

type ProductRow = {
  id: string
  name: string
  unit: string
  defaultRate: number
  description: string
}

export function ProductsManager({ products }: { products: ProductRow[] }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ProductRow | null>(null)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return products
    return products.filter((product) =>
      [product.name, product.unit, product.description].join(" ").toLowerCase().includes(needle),
    )
  }, [products, query])

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label" htmlFor="product-search">
            Search
          </label>
          <input
            id="product-search"
            className="field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, unit, description"
          />
        </div>
        <button className="btn-primary sm:mb-px" type="button" onClick={() => setOpen((value) => !value)}>
          {open ? "Close form" : "New product"}
        </button>
      </div>
      {open ? (
        <div className="card mb-6 p-4 sm:p-5">
          <ProductForm onDone={() => setOpen(false)} />
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="card p-6 text-sm text-muted">
          {products.length === 0 ? "No products yet." : "No products match that search."}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => (
            <article key={product.id} className="card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-medium">{product.name}</h2>
                  <p className="text-sm text-muted">
                    {formatPKR(product.defaultRate)} / {product.unit}
                  </p>
                  {product.description ? <p className="mt-1 text-sm text-muted">{product.description}</p> : null}
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost" type="button" onClick={() => setEditing(product)}>
                    Edit
                  </button>
                  <DeleteProductButton id={product.id} />
                </div>
              </div>
              {editing?.id === product.id ? (
                <div className="mt-4 border-t border-line pt-4">
                  <ProductForm product={product} onDone={() => setEditing(null)} />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

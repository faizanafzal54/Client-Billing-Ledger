"use client"

import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Plus, Trash2, X } from "lucide-react"
import { createClient } from "@/app/actions/clients"
import { createInvoice, updateInvoice } from "@/app/actions/invoices"
import { createProduct } from "@/app/actions/products"
import { todayISO } from "@/lib/utils"
import { formatPKR } from "@/lib/money"

type ClientOption = {
  id: string
  name: string
  prefix: string
}

type ProductOption = {
  id: string
  name: string
  unit: string
  defaultRate: number
}

type Line = {
  productId?: string
  name: string
  unit: string
  quantity: number
  rate: number
}

type InvoiceSeed = {
  id: string
  clientId: string
  date: string
  dueDate: string
  poNumber: string
  vehicleNo: string
  notes: string
  taxPercent: number
  discount: number
  lines: Line[]
}

export function InvoiceForm({
  clients,
  products,
  defaultTax,
  invoice,
}: {
  clients: ClientOption[]
  products: ProductOption[]
  defaultTax: number
  invoice?: InvoiceSeed
}) {
  const router = useRouter()
  const [clientList, setClientList] = useState(clients)
  const [productList, setProductList] = useState(products)
  const [clientId, setClientId] = useState(invoice?.clientId ?? clients[0]?.id ?? "")
  const [lines, setLines] = useState<Line[]>(
    invoice?.lines?.length
      ? invoice.lines
      : [{ name: "", unit: "KG", quantity: 1, rate: 0 }],
  )
  const [taxPercent, setTaxPercent] = useState(invoice?.taxPercent ?? defaultTax)
  const [discount, setDiscount] = useState(invoice?.discount ?? 0)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [showClient, setShowClient] = useState(false)
  const [showProduct, setShowProduct] = useState<number | null>(null)

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + (line.quantity || 0) * (line.rate || 0), 0),
    [lines],
  )
  const afterDiscount = Math.max(0, subtotal - discount)
  const taxAmount = afterDiscount * (taxPercent / 100)
  const total = afterDiscount + taxAmount

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  function pickProduct(index: number, productId: string) {
    const product = productList.find((item) => item.id === productId)
    if (!product) {
      updateLine(index, { productId: undefined })
      return
    }
    updateLine(index, {
      productId: product.id,
      name: product.name,
      unit: product.unit,
      rate: product.defaultRate,
    })
  }

  async function onSubmit(formData: FormData) {
    setError("")
    setPending(true)
    formData.set("lines", JSON.stringify(lines))
    try {
      const result = invoice ? await updateInvoice(formData) : await createInvoice(formData)
      if (result?.error) setError(result.error)
      else if (invoice && result?.ok) router.push(`/invoices/${invoice.id}`)
    } finally {
      setPending(false)
    }
  }

  async function addClient(formData: FormData) {
    const result = await createClient(formData)
    if (!result.ok || !result.id) {
      setError(result.error || "Could not create client.")
      return
    }
    const created = {
      id: result.id,
      name: String(formData.get("name") || ""),
      prefix: String(formData.get("prefix") || ""),
    }
    setClientList((current) => [...current, created])
    setClientId(created.id)
    setShowClient(false)
    router.refresh()
  }

  async function addProduct(formData: FormData, index: number) {
    const result = await createProduct(formData)
    if (!result.ok || !result.id) {
      setError(result.error || "Could not create product.")
      return
    }
    const created = {
      id: result.id,
      name: String(formData.get("name") || ""),
      unit: String(formData.get("unit") || "KG"),
      defaultRate: Number(formData.get("defaultRate") || 0),
    }
    setProductList((current) => [...current, created])
    updateLine(index, {
      productId: created.id,
      name: created.name,
      unit: created.unit,
      rate: created.defaultRate,
    })
    setShowProduct(null)
    router.refresh()
  }

  return (
    <>
    <form action={onSubmit} className="space-y-6">
      {invoice ? <input type="hidden" name="id" value={invoice.id} /> : null}
      <section className="card p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl">Bill to</h2>
          <button className="btn-ghost" type="button" onClick={() => setShowClient(true)}>
            <Plus size={16} />
            New client
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="label">Client</label>
            <select className="field" name="clientId" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
              <option value="">Select client</option>
              {clientList.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.prefix})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input className="field" type="date" name="date" defaultValue={invoice?.date ?? todayISO()} required />
          </div>
          <div>
            <label className="label">Due date</label>
            <input className="field" type="date" name="dueDate" defaultValue={invoice?.dueDate} />
          </div>
          <div>
            <label className="label">P.O. number</label>
            <input className="field" name="poNumber" defaultValue={invoice?.poNumber} />
          </div>
          <div>
            <label className="label">Vehicle no.</label>
            <input className="field" name="vehicleNo" defaultValue={invoice?.vehicleNo} />
          </div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
          <h2 className="font-display text-xl">Products</h2>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => setLines((current) => [...current, { name: "", unit: "KG", quantity: 1, rate: 0 }])}
          >
            <Plus size={16} />
            Line
          </button>
        </div>
        <div className="space-y-4 p-4 sm:p-5">
          {lines.map((line, index) => (
            <div key={index} className="rounded-xl border border-line bg-white p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Item {index + 1}</p>
                <div className="flex gap-2">
                  <button className="btn-ghost py-1.5 text-xs" type="button" onClick={() => setShowProduct(index)}>
                    New product
                  </button>
                  {lines.length > 1 ? (
                    <button
                      className="btn-ghost py-1.5 text-bad"
                      type="button"
                      onClick={() => setLines((current) => current.filter((_, i) => i !== index))}
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <div className="lg:col-span-2">
                  <label className="label">Product</label>
                  <select
                    className="field"
                    value={line.productId ?? ""}
                    onChange={(e) => pickProduct(index, e.target.value)}
                  >
                    <option value="">Type or select</option>
                    {productList.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="label">Description</label>
                  <input
                    className="field"
                    value={line.name}
                    onChange={(e) => updateLine(index, { name: e.target.value, productId: undefined })}
                    placeholder="Chemical / item name"
                    required
                  />
                </div>
                <div>
                  <label className="label">Qty</label>
                  <input
                    className="field"
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.quantity}
                    onChange={(e) => updateLine(index, { quantity: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <input
                    className="field"
                    value={line.unit}
                    onChange={(e) => updateLine(index, { unit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Rate</label>
                  <input
                    className="field"
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.rate}
                    onChange={(e) => updateLine(index, { rate: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Amount</label>
                  <p className="field bg-cream">{formatPKR(line.quantity * line.rate)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card p-4 sm:p-5">
          <label className="label">Notes on invoice</label>
          <textarea className="field min-h-28" name="notes" defaultValue={invoice?.notes} />
        </div>
        <div className="card space-y-3 p-4 sm:p-5">
          <div>
            <label className="label">Discount (PKR)</label>
            <input
              className="field"
              type="number"
              name="discount"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Sales tax %</label>
            <input
              className="field"
              type="number"
              name="taxPercent"
              min="0"
              step="0.01"
              value={taxPercent}
              onChange={(e) => setTaxPercent(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatPKR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Tax</span>
              <span>{formatPKR(taxAmount)}</span>
            </div>
            <div className="flex justify-between font-display text-xl">
              <span>Total</span>
              <span>{formatPKR(total)}</span>
            </div>
          </div>
        </div>
      </section>

      {error ? <p className="rounded-lg bg-bad/10 px-3 py-2 text-sm text-bad">{error}</p> : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button className="btn-primary" disabled={pending} type="submit">
          {pending ? "Saving…" : invoice ? "Update invoice" : "Create invoice"}
        </button>
      </div>
    </form>
      {showClient ? (
        <Modal title="New client" onClose={() => setShowClient(false)}>
          <form action={addClient} className="space-y-3">
            <div>
              <label className="label">Name</label>
              <input className="field" name="name" required placeholder="TurkPlast" />
            </div>
            <div>
              <label className="label">Invoice prefix</label>
              <input className="field" name="prefix" required placeholder="Turk" />
              <p className="mt-1 text-xs text-muted">Used for client invoice numbers, e.g. Turk1</p>
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="field" name="phone" />
            </div>
            <div>
              <label className="label">Address</label>
              <input className="field" name="address" />
            </div>
            <button className="btn-primary w-full" type="submit">
              Add client
            </button>
          </form>
        </Modal>
      ) : null}

      {showProduct !== null ? (
        <Modal title="New product" onClose={() => setShowProduct(null)}>
          <form action={(formData) => addProduct(formData, showProduct)} className="space-y-3">
            <div>
              <label className="label">Name</label>
              <input className="field" name="name" required placeholder="PVC Cement 500 ML" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Unit</label>
                <input className="field" name="unit" defaultValue="BOTTLE" />
              </div>
              <div>
                <label className="label">Default rate</label>
                <input className="field" type="number" name="defaultRate" min="0" step="0.01" defaultValue="0" />
              </div>
            </div>
            <button className="btn-primary w-full" type="submit">
              Add product
            </button>
          </form>
        </Modal>
      ) : null}
    </>
  )
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  if (typeof document === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6">
      <div className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-paper p-5 sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-2xl">{title}</h3>
          <button className="btn-ghost px-2" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

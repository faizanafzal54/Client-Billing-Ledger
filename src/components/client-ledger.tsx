"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Download, Pencil } from "lucide-react"
import { EditPaymentDialog, type PaymentValues } from "@/components/payment-form"
import { LedgerSheet, type LedgerCompany, type LedgerMonthGroup, type LedgerRow } from "@/components/ledger-sheet"
import { Spinner } from "@/components/ui"
import { formatPKR } from "@/lib/money"
import { fileSlug, formatDate, monthKey, monthLabel } from "@/lib/utils"

function paymentValues(row: LedgerRow): PaymentValues {
  return {
    id: row.id,
    amount: row.credit,
    date: row.date,
    method: row.method || "bank",
    reference: row.paymentReference || "",
    notes: row.notes || "",
    invoiceId: row.invoiceId || "",
  }
}

function groupsFor(ledger: LedgerRow[], month: string): LedgerMonthGroup[] {
  const keys = [...new Set(ledger.map((row) => monthKey(row.date)))].sort()
  const selected = month === "all" ? keys : keys.filter((key) => key === month)

  return selected.map((key) => {
    const previous = ledger.filter((row) => monthKey(row.date) < key)
    const rows = ledger.filter((row) => monthKey(row.date) === key)
    return {
      key,
      label: monthLabel(key),
      opening: previous.at(-1)?.balance ?? 0,
      rows,
    }
  })
}

export function ClientLedger({
  clientId,
  clientName,
  company,
  ledger,
  invoices,
}: {
  clientId: string
  clientName: string
  company: LedgerCompany
  ledger: LedgerRow[]
  invoices: Array<{ id: string; label: string }>
}) {
  const exportRef = useRef<HTMLDivElement>(null)
  const [month, setMonth] = useState("all")
  const [editing, setEditing] = useState<LedgerRow | null>(null)
  const [exporting, setExporting] = useState<"pdf" | "png" | null>(null)
  const [exportError, setExportError] = useState("")

  const months = useMemo(
    () => [...new Set(ledger.map((row) => monthKey(row.date)))].sort().reverse(),
    [ledger],
  )
  const groups = useMemo(() => groupsFor(ledger, month), [ledger, month])
  const periodLabel = month === "all" ? "All months" : monthLabel(month)
  const showOpening = month !== "all"
  const filename = `${fileSlug(clientName)}-ledger-${month === "all" ? "all" : month}`

  async function capture() {
    const node = exportRef.current
    if (!node) throw new Error("Ledger preview is not ready.")
    const { toPng } = await import("html-to-image")
    return toPng(node, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#ffffff",
    })
  }

  async function downloadPng() {
    setExportError("")
    setExporting("png")
    try {
      const dataUrl = await capture()
      const link = document.createElement("a")
      link.download = `${filename}.png`
      link.href = dataUrl
      link.click()
    } catch {
      setExportError("Could not create PNG.")
    } finally {
      setExporting(null)
    }
  }

  async function downloadPdf() {
    setExportError("")
    setExporting("pdf")
    try {
      const dataUrl = await capture()
      const { jsPDF } = await import("jspdf")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const imgWidth = pageWidth - margin * 2
      const img = pdf.getImageProperties(dataUrl)
      const imgHeight = (img.height * imgWidth) / img.width
      let remaining = imgHeight
      let offset = margin

      pdf.addImage(dataUrl, "PNG", margin, offset, imgWidth, imgHeight)
      remaining -= pageHeight - margin
      while (remaining > 0) {
        offset -= pageHeight - margin
        pdf.addPage()
        pdf.addImage(dataUrl, "PNG", margin, offset, imgWidth, imgHeight)
        remaining -= pageHeight - margin
      }
      pdf.save(`${filename}.pdf`)
    } catch {
      setExportError("Could not create PDF.")
    } finally {
      setExporting(null)
    }
  }

  return (
    <section className="card min-w-0 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-3">
        <h2 className="font-display text-xl">Ledger</h2>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="ledger-month">
            Month
          </label>
          <select
            id="ledger-month"
            className="field min-w-0 flex-1"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          >
            <option value="all">All months</option>
            {months.map((key) => (
              <option key={key} value={key}>
                {monthLabel(key)}
              </option>
            ))}
          </select>
          <button className="btn-ghost shrink-0 px-3" type="button" onClick={downloadPng} disabled={Boolean(exporting) || ledger.length === 0} aria-busy={exporting === "png"}>
            {exporting === "png" ? <Spinner /> : <Download size={16} />}
            {exporting === "png" ? "PNG…" : "PNG"}
          </button>
          <button className="btn-ghost shrink-0 px-3" type="button" onClick={downloadPdf} disabled={Boolean(exporting) || ledger.length === 0} aria-busy={exporting === "pdf"}>
            {exporting === "pdf" ? <Spinner /> : <Download size={16} />}
            {exporting === "pdf" ? "PDF…" : "PDF"}
          </button>
        </div>
      </div>
      {exportError ? <p className="px-4 pt-3 text-sm text-bad">{exportError}</p> : null}

      <div className="md:hidden">
        {groups.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted">
            {ledger.length === 0 ? "No ledger entries yet." : "No ledger entries for this month."}
          </p>
        ) : (
          groups.flatMap((group) => {
            const rows = []
            if (groups.length > 1 || showOpening) {
              rows.push(
                <div key={`month-${group.key}`} className="border-t border-line bg-cream/60 px-4 py-2 text-sm font-semibold">
                  {group.label}
                </div>,
              )
            }
            if (showOpening) {
              rows.push(
                <div key={`opening-${group.key}`} className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
                  <p className="text-sm">Opening balance</p>
                  <p className="shrink-0 text-sm">{formatPKR(group.opening)}</p>
                </div>,
              )
            }
            for (const row of group.rows) {
              rows.push(
                <div key={`${row.type}-${row.id}`} className="border-t border-line px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted">{formatDate(row.date)}</p>
                      {row.type === "invoice" ? (
                        <Link href={`/invoices/${row.id}`} className="block text-sm underline-offset-2 hover:underline">
                          Invoice {row.reference}
                        </Link>
                      ) : (
                        <p className="text-sm">Payment · {row.reference}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-start gap-1">
                      <div className="text-right">
                        <p className="text-sm">{formatPKR(row.balance)}</p>
                        {row.debit ? <p className="text-xs text-muted">Dr {formatPKR(row.debit)}</p> : null}
                        {row.credit ? <p className="text-xs text-good">Cr {formatPKR(row.credit)}</p> : null}
                      </div>
                      {row.type === "payment" ? (
                        <button
                          className="group relative rounded-md p-1 text-muted"
                          type="button"
                          onClick={() => setEditing(row)}
                          title="Edit payment"
                          aria-label="Edit payment"
                        >
                          <Pencil size={14} />
                          <span className="pointer-events-none absolute bottom-full right-0 mb-1 hidden whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs text-cream group-hover:block group-focus-visible:block">
                            Edit payment
                          </span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>,
              )
            }
            return rows
          })
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Particulars</th>
              <th className="px-4 py-2 text-right">Debit</th>
              <th className="px-4 py-2 text-right">Credit</th>
              <th className="px-4 py-2 text-right">Balance</th>
              <th className="px-4 py-2 text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted" colSpan={6}>
                  {ledger.length === 0 ? "No ledger entries yet." : "No ledger entries for this month."}
                </td>
              </tr>
            ) : (
              groups.flatMap((group) => {
                const rows = []
                if (groups.length > 1 || showOpening) {
                  rows.push(
                    <tr key={`month-${group.key}`} className="border-t border-line bg-cream/60">
                      <td className="px-4 py-2 font-semibold" colSpan={6}>
                        {group.label}
                      </td>
                    </tr>,
                  )
                }
                if (showOpening) {
                  rows.push(
                    <tr key={`opening-${group.key}`} className="border-t border-line">
                      <td className="px-4 py-2 text-muted">—</td>
                      <td className="px-4 py-2">Opening balance</td>
                      <td className="px-4 py-2 text-right">—</td>
                      <td className="px-4 py-2 text-right">—</td>
                      <td className="px-4 py-2 text-right">{formatPKR(group.opening)}</td>
                      <td className="px-4 py-2" />
                    </tr>,
                  )
                }
                for (const row of group.rows) {
                  rows.push(
                    <tr key={`${row.type}-${row.id}`} className="border-t border-line">
                      <td className="px-4 py-2">{formatDate(row.date)}</td>
                      <td className="px-4 py-2">
                        {row.type === "invoice" ? (
                          <Link href={`/invoices/${row.id}`} className="underline-offset-2 hover:underline">
                            Invoice {row.reference}
                          </Link>
                        ) : (
                          `Payment · ${row.reference}`
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">{row.debit ? formatPKR(row.debit) : "—"}</td>
                      <td className="px-4 py-2 text-right">{row.credit ? formatPKR(row.credit) : "—"}</td>
                      <td className="px-4 py-2 text-right">{formatPKR(row.balance)}</td>
                      <td className="px-4 py-2 text-right">
                        {row.type === "payment" ? (
                          <button
                            className="btn-ghost px-2 py-1 text-xs"
                            type="button"
                            onClick={() => setEditing(row)}
                            aria-label="Edit payment"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                        ) : null}
                      </td>
                    </tr>,
                  )
                }
                return rows
              })
            )}
          </tbody>
        </table>
      </div>

      <div aria-hidden className="pointer-events-none fixed -left-[10000px] top-0">
        <div ref={exportRef} style={{ width: 900 }}>
          <LedgerSheet
            company={company}
            clientName={clientName}
            periodLabel={periodLabel}
            groups={groups}
            showOpening={showOpening}
          />
        </div>
      </div>

      {editing ? (
        <EditPaymentDialog
          clientId={clientId}
          payment={paymentValues(editing)}
          invoices={invoices}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </section>
  )
}

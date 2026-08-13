import Link from "next/link"
import { notFound } from "next/navigation"
import { ClientForm, DeleteClientButton } from "@/components/client-form"
import { displayInvoiceNo } from "@/lib/utils"
import { PaymentForm } from "@/components/payment-form"
import { PageHeader, StatCard, StatusBadge } from "@/components/ui"
import { formatPKR, formatNumber } from "@/lib/money"
import { getClientReport } from "@/lib/queries"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const report = await getClientReport(id)
  if (!report) notFound()
  const { client, billed, paid, outstanding, ledger, products } = report

  return (
    <div>
      <PageHeader
        title={client.name}
        description={`Client invoices start as ${client.prefix}1, ${client.prefix}2, …`}
        actions={
          <>
            <Link href={`/invoices/new`} className="btn-primary">
              New invoice
            </Link>
            <DeleteClientButton id={client.id} />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Billed" value={formatPKR(billed)} />
        <StatCard label="Received" value={formatPKR(paid)} tone="good" />
        <StatCard label="Outstanding" value={formatPKR(outstanding)} tone={outstanding > 0 ? "warn" : "good"} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="card overflow-hidden">
          <div className="border-b border-line px-4 py-3">
            <h2 className="font-display text-xl">Ledger</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Particulars</th>
                  <th className="px-4 py-2 text-right">Debit</th>
                  <th className="px-4 py-2 text-right">Credit</th>
                  <th className="px-4 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-muted" colSpan={5}>
                      No ledger entries yet.
                    </td>
                  </tr>
                ) : (
                  ledger.map((row) => (
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-4">
          <section className="card p-4 sm:p-5">
            <h2 className="font-display text-xl">Receive payment</h2>
            <p className="mb-4 text-sm text-muted">Applies to this client ledger. Optionally leave invoice blank for a general receipt.</p>
            <PaymentForm clientId={client.id} remaining={outstanding} />
          </section>
          <section className="card p-4 sm:p-5">
            <h2 className="font-display text-xl">Product mix</h2>
            <div className="mt-3 space-y-3">
              {products.length === 0 ? (
                <p className="text-sm text-muted">No product sales yet.</p>
              ) : (
                products.map((product) => (
                  <div key={product.name} className="flex items-center justify-between gap-3 border-b border-line pb-3 text-sm last:border-0">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted">
                        {formatNumber(product.qty)} {product.unit}
                      </p>
                    </div>
                    <p>{formatPKR(product.amount)}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-display text-xl">Invoices</h2>
        </div>
        <ul>
          {client.invoices.map((invoice) => (
            <li key={invoice.id} className="border-b border-line last:border-0">
              <Link href={`/invoices/${invoice.id}`} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium">
                    {displayInvoiceNo(invoice.globalNumber)} · {invoice.clientNumber}
                  </p>
                  <p className="text-xs text-muted">{formatDate(invoice.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatPKR(invoice.total)}</p>
                  <StatusBadge status={invoice.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="card mt-6 p-4 sm:p-5">
        <h2 className="font-display mb-4 text-xl">Edit client</h2>
        <ClientForm client={client} />
      </section>
    </div>
  )
}

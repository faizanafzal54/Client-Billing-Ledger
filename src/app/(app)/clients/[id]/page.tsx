import Link from "next/link"
import { notFound } from "next/navigation"
import { ClientForm, DeleteClientButton } from "@/components/client-form"
import { ClientLedger } from "@/components/client-ledger"
import { displayInvoiceNo } from "@/lib/utils"
import { PaymentForm } from "@/components/payment-form"
import { PageHeader, StatCard, StatusBadge } from "@/components/ui"
import { formatPKR, formatNumber } from "@/lib/money"
import { getClientReport, getCompany } from "@/lib/queries"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [report, company] = await Promise.all([getClientReport(id), getCompany()])
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
        <ClientLedger
          clientId={client.id}
          clientName={client.name}
          company={{
            name: company.name,
            city: company.city,
            address: company.address,
            phone: company.phone,
          }}
          invoices={client.invoices.map((invoice) => ({
            id: invoice.id,
            label: `${displayInvoiceNo(invoice.globalNumber)} · ${invoice.clientNumber}`,
          }))}
          ledger={ledger.map((row) => ({
            id: row.id,
            date: row.date.toISOString(),
            type: row.type,
            reference: row.reference,
            debit: row.debit,
            credit: row.credit,
            balance: row.balance,
            method: row.method,
            notes: row.notes,
            invoiceId: row.invoiceId,
            paymentReference: row.paymentReference,
          }))}
        />

        <div className="space-y-4">
          <section className="card p-4 sm:p-5">
            <h2 className="font-display text-xl">Receive payment</h2>
            <p className="mb-4 text-sm text-muted">Applies to this client ledger. Optionally leave invoice blank for a general receipt.</p>
            <PaymentForm
              clientId={client.id}
              remaining={outstanding}
              invoices={client.invoices.map((invoice) => ({
                id: invoice.id,
                label: `${displayInvoiceNo(invoice.globalNumber)} · ${invoice.clientNumber}`,
              }))}
            />
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

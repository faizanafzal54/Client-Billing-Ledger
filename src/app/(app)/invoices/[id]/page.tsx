import Link from "next/link"
import { notFound } from "next/navigation"
import { DeleteInvoiceButton } from "@/components/delete-invoice-button"
import { InvoiceDocument } from "@/components/invoice-document"
import { InvoicePaymentList, PaymentForm } from "@/components/payment-form"
import { PageHeader, StatusBadge } from "@/components/ui"
import { formatPKR } from "@/lib/money"
import { prisma } from "@/lib/prisma"
import { getCompany } from "@/lib/queries"
import { displayInvoiceNo } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [invoice, company] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        items: { orderBy: { sortOrder: "asc" } },
        payments: true,
      },
    }),
    getCompany(),
  ])
  if (!invoice) notFound()

  const paid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)
  const remaining = Math.max(0, invoice.total - paid)

  return (
    <div>
      <PageHeader
        title={`${displayInvoiceNo(invoice.globalNumber)} · ${invoice.clientNumber}`}
        description={`${invoice.client.name} · ${invoice.status}`}
        actions={
          <>
            <StatusBadge status={invoice.status} />
            <Link href={`/invoices/${invoice.id}/print`} className="btn-ghost">
              Print
            </Link>
            <Link href={`/invoices/${invoice.id}/edit`} className="btn-ghost">
              Edit
            </Link>
            <DeleteInvoiceButton id={invoice.id} />
          </>
        }
      />

      <div className="mb-6 -mx-4 overflow-x-auto overscroll-x-contain px-4 lg:mx-0 lg:px-0">
        <InvoiceDocument invoice={invoice} company={company} paid={paid} />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <h2 className="font-display text-xl">Record payment</h2>
          <p className="mb-4 text-sm text-muted">
            Paid {formatPKR(paid)} · remaining {formatPKR(remaining)}
          </p>
          <PaymentForm clientId={invoice.clientId} invoiceId={invoice.id} remaining={remaining} />
        </div>
        <div className="card p-4 sm:p-5">
          <h2 className="font-display text-xl">Payments on this invoice</h2>
          <InvoicePaymentList
            clientId={invoice.clientId}
            invoiceId={invoice.id}
            payments={invoice.payments.map((payment) => ({
              id: payment.id,
              amount: payment.amount,
              date: payment.date.toISOString(),
              method: payment.method,
              reference: payment.reference,
              notes: payment.notes,
              invoiceId: payment.invoiceId || invoice.id,
            }))}
          />
        </div>
      </section>
    </div>
  )
}

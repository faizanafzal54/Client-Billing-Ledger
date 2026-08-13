import Link from "next/link"
import { notFound } from "next/navigation"
import { InvoiceDocument } from "@/components/invoice-document"
import { PrintButton } from "@/components/print-button"
import { prisma } from "@/lib/prisma"
import { getCompany } from "@/lib/queries"

export const dynamic = "force-dynamic"

export default async function PrintInvoicePage({
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

  return (
    <div className="space-y-4">
      <div className="no-print flex items-center justify-between">
        <Link href={`/invoices/${invoice.id}`} className="btn-ghost">
          Back
        </Link>
        <PrintButton />
      </div>
      <div className="overflow-x-auto overscroll-x-contain print:overflow-visible">
        <InvoiceDocument invoice={invoice} company={company} paid={paid} />
      </div>
    </div>
  )
}

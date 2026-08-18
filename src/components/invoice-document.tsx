import { formatRs } from "@/lib/money"
import { displayInvoiceNo, formatInvoiceDate } from "@/lib/utils"

type InvoiceDoc = {
  globalNumber: string
  clientNumber: string
  date: Date
  dueDate: Date | null
  poNumber: string
  vehicleNo: string
  notes: string
  taxPercent: number
  discount: number
  subtotal: number
  taxAmount: number
  total: number
  client: {
    name: string
    address: string
    city: string
    phone: string
    ntn: string
  }
  items: Array<{
    description: string
    quantity: number
    unit: string
    rate: number
    amount: number
  }>
}

type CompanyDoc = {
  name: string
  tagline: string
  address: string
  city: string
  phone: string
  email: string
  ntn: string
  strn: string
  bankName: string
  bankAccount: string
  bankIban: string
  invoiceNotes: string
}

export function InvoiceDocument({
  invoice,
  company,
  paid = 0,
}: {
  invoice: InvoiceDoc
  company: CompanyDoc
  paid?: number
}) {
  const balanceDue = Math.max(0, invoice.total - paid)
  const invoiceNo = displayInvoiceNo(invoice.globalNumber)

  return (
    <article className="invoice-sheet print-sheet relative mx-auto w-[800px] max-w-[800px] shrink-0 overflow-hidden bg-white text-[#111] shadow-sm print:w-full print:max-w-none print:shadow-none">
      <svg className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 text-[#2f6fed]" viewBox="0 0 200 200" aria-hidden>
        <path fill="currentColor" d="M0 40c40 0 70 18 90 40 22 24 38 56 70 56V0H0v40Z" />
        <path fill="currentColor" opacity="0.85" d="M0 0c55 8 90 38 110 70C132 104 150 130 200 136V0H0Z" />
      </svg>
      <svg className="pointer-events-none absolute -bottom-20 -right-16 h-64 w-64 text-[#2f6fed]" viewBox="0 0 200 200" aria-hidden>
        <path fill="currentColor" d="M200 160c-40 0-70-18-90-40-22-24-38-56-70-56V200h160v-40Z" />
        <path fill="currentColor" opacity="0.85" d="M200 200c-55-8-90-38-110-70C68 96 50 70 0 64V200h200Z" />
      </svg>

      <div className="relative z-10 px-8 pb-16 pt-10 sm:px-12">
        <header className="flex items-start justify-between gap-8">
          <div className="flex min-w-0 items-start gap-4">
            <img
              src="/aac-logo.png"
              alt="Asghar Ali Chemicals"
              className="h-28 w-auto object-contain sm:h-32"
            />
            <div className="pt-1 text-[13px] leading-6">
              <p className="text-lg font-extrabold tracking-wide">{company.name.toUpperCase()}</p>
              {company.city ? <p>{company.city.toUpperCase()}</p> : null}
              {company.address ? <p>{company.address.toUpperCase()}</p> : null}
              {company.phone ? <p>{company.phone}</p> : null}
              {company.email ? <p>{company.email}</p> : null}
            </div>
          </div>
          <div className="min-w-[220px] shrink-0 text-right">
            <p className="text-lg font-extrabold uppercase">{invoice.client.name}</p>
            {invoice.client.address ? <p className="text-sm">{invoice.client.address}</p> : null}
            {invoice.client.city ? <p className="text-sm">{invoice.client.city}</p> : null}
            {invoice.client.phone ? <p className="text-sm">{invoice.client.phone}</p> : null}
            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex justify-end gap-3">
                <dt className="font-semibold">Invoice #:</dt>
                <dd>{invoiceNo}</dd>
              </div>
              <div className="flex justify-end gap-3">
                <dt className="font-semibold">Client #:</dt>
                <dd>{invoice.clientNumber}</dd>
              </div>
              <div className="flex justify-end gap-3">
                <dt className="font-semibold">Date:</dt>
                <dd>{formatInvoiceDate(invoice.date)}</dd>
              </div>
              {invoice.dueDate ? (
                <div className="flex justify-end gap-3">
                  <dt className="font-semibold">Due Date:</dt>
                  <dd>{formatInvoiceDate(invoice.dueDate)}</dd>
                </div>
              ) : null}
              {invoice.poNumber ? (
                <div className="flex justify-end gap-3">
                  <dt className="font-semibold">P.O. #:</dt>
                  <dd>{invoice.poNumber}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </header>

        <table className="mt-10 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#2f6fed] text-white">
              <th className="px-4 py-2.5 text-left font-semibold">Description</th>
              <th className="px-4 py-2.5 text-center font-semibold">QTY</th>
              <th className="px-4 py-2.5 text-right font-semibold">Price</th>
              <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={`${item.description}-${index}`} className="border-b border-[#dbe4f0]">
                <td className="px-4 py-3">
                  <p className="font-medium uppercase">{item.description}</p>
                  {item.unit ? <p className="text-xs text-[#667085]">{item.unit}</p> : null}
                </td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right">{formatRs(item.rate)}</td>
                <td className="px-4 py-3 text-right">{formatRs(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs text-sm">
            <div className="flex justify-between py-1.5">
              <span>Subtotal</span>
              <span>{formatRs(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 ? (
              <div className="flex justify-between py-1.5">
                <span>Discount</span>
                <span>{formatRs(invoice.discount)}</span>
              </div>
            ) : null}
            {invoice.taxPercent > 0 ? (
              <div className="flex justify-between py-1.5">
                <span>Sales tax {invoice.taxPercent}%</span>
                <span>{formatRs(invoice.taxAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between py-1.5">
              <span>Total</span>
              <span>{formatRs(invoice.total)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Paid</span>
              <span>{formatRs(paid)}</span>
            </div>
            <div className="mt-1 flex justify-between bg-[#2f6fed] px-3 py-2.5 font-bold text-white">
              <span>Balance Due</span>
              <span>{formatRs(balanceDue)}</span>
            </div>
          </div>
        </div>

        <p className="mt-10 text-sm">{invoice.notes || company.invoiceNotes || "Thanks for your business."}</p>
      </div>
    </article>
  )
}

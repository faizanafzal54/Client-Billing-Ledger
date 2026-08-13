import Link from "next/link"
import { PageHeader, StatCard } from "@/components/ui"
import { formatPKR, formatNumber } from "@/lib/money"
import { getDashboardData } from "@/lib/queries"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const data = await getDashboardData()

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Company-wide sales and per-client outstanding balances."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total billed" value={formatPKR(data.billed)} />
        <StatCard label="Collected" value={formatPKR(data.paid)} tone="good" />
        <StatCard label="Outstanding" value={formatPKR(data.outstanding)} tone={data.outstanding > 0 ? "warn" : "good"} />
        <StatCard label="This month" value={formatPKR(data.monthSales)} />
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-display text-xl">Client reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2 text-right">Invoices</th>
                <th className="px-4 py-2 text-right">Billed</th>
                <th className="px-4 py-2 text-right">Paid</th>
                <th className="px-4 py-2 text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {data.byClient.map((client) => (
                <tr key={client.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${client.id}`} className="font-medium underline-offset-2 hover:underline">
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">{client.invoices}</td>
                  <td className="px-4 py-3 text-right">{formatPKR(client.billed)}</td>
                  <td className="px-4 py-3 text-right">{formatPKR(client.paid)}</td>
                  <td className="px-4 py-3 text-right">{formatPKR(client.outstanding)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-display text-xl">Product sales</h2>
        </div>
        <ul>
          {data.topProducts.map((product) => (
            <li key={product.name} className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-0">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-muted">Qty {formatNumber(product.qty)}</p>
              </div>
              <p className="text-sm">{formatPKR(product.amount)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

import { formatPKR } from "@/lib/money"
import { formatDate } from "@/lib/utils"

export type LedgerRow = {
  id: string
  date: string
  type: "invoice" | "payment"
  kind?: "credit" | "debit"
  reference: string
  debit: number
  credit: number
  balance: number
  method?: string
  notes?: string
  invoiceId?: string
  paymentReference?: string
}

export type LedgerCompany = {
  name: string
  city: string
  address: string
  phone: string
}

export type LedgerMonthGroup = {
  key: string
  label: string
  opening: number
  rows: LedgerRow[]
}

export function LedgerSheet({
  company,
  clientName,
  periodLabel,
  groups,
  showOpening,
}: {
  company: LedgerCompany
  clientName: string
  periodLabel: string
  groups: LedgerMonthGroup[]
  showOpening: boolean
}) {
  return (
    <article
      style={{
        width: 900,
        background: "#ffffff",
        color: "#14221c",
        fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif",
        padding: 32,
      }}
    >
      <header style={{ borderBottom: "2px solid #14221c", paddingBottom: 16, marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "0.04em" }}>
          {company.name.toUpperCase()}
        </p>
        <p style={{ margin: "16px 0 0", fontSize: 18, fontWeight: 700 }}>Client Ledger</p>
        <p style={{ margin: "4px 0 0", fontSize: 14 }}>
          Client: <strong>{clientName}</strong>
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 14 }}>
          Period: <strong>{periodLabel}</strong>
        </p>
      </header>

      {groups.length === 0 ? (
        <p style={{ fontSize: 14, color: "#6b645b" }}>No ledger entries for this period.</p>
      ) : (
        groups.map((group) => (
          <section key={group.key} style={{ marginBottom: 28 }}>
            {groups.length > 1 || showOpening ? (
              <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700 }}>{group.label}</h3>
            ) : null}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f3eee4", textAlign: "left" }}>
                  <th style={{ padding: "8px 10px", fontSize: 11, letterSpacing: "0.12em" }}>DATE</th>
                  <th style={{ padding: "8px 10px", fontSize: 11, letterSpacing: "0.12em" }}>PARTICULARS</th>
                  <th style={{ padding: "8px 10px", fontSize: 11, letterSpacing: "0.12em", textAlign: "right" }}>
                    DEBIT
                  </th>
                  <th style={{ padding: "8px 10px", fontSize: 11, letterSpacing: "0.12em", textAlign: "right" }}>
                    CREDIT
                  </th>
                  <th style={{ padding: "8px 10px", fontSize: 11, letterSpacing: "0.12em", textAlign: "right" }}>
                    BALANCE
                  </th>
                </tr>
              </thead>
              <tbody>
                {showOpening ? (
                  <tr>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #d8d0c2" }}>—</td>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #d8d0c2" }}>Opening balance</td>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #d8d0c2", textAlign: "right" }}>—</td>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #d8d0c2", textAlign: "right" }}>—</td>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #d8d0c2", textAlign: "right" }}>
                      {formatPKR(group.opening)}
                    </td>
                  </tr>
                ) : null}
                {group.rows.map((row) => (
                  <tr key={`${row.type}-${row.id}`}>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #d8d0c2" }}>{formatDate(row.date)}</td>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #d8d0c2" }}>
                      {row.type === "invoice"
                        ? `Invoice ${row.reference}`
                        : row.kind === "debit"
                          ? `Previous pending · ${row.reference}`
                          : `Payment · ${row.reference}`}
                    </td>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #d8d0c2", textAlign: "right" }}>
                      {row.debit ? formatPKR(row.debit) : "—"}
                    </td>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #d8d0c2", textAlign: "right" }}>
                      {row.credit ? formatPKR(row.credit) : "—"}
                    </td>
                    <td style={{ padding: "8px 10px", borderTop: "1px solid #d8d0c2", textAlign: "right" }}>
                      {formatPKR(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))
      )}
    </article>
  )
}

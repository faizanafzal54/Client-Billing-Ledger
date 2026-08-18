import { prisma } from "@/lib/prisma"
import { displayInvoiceNo } from "@/lib/utils"

export async function getCompany() {
  const company = await prisma.company.findUnique({ where: { key: "company" } })
  if (company) return company
  return prisma.company.create({
    data: {
      key: "company",
      name: "Asghar Ali Chemicals",
      tagline: "Dealers in Industrial Chemicals",
      address: "MAIN CANAL ROAD",
      city: "Lahore",
      phone: "03224360607",
      email: "asgharumair809@gmail.com",
    },
  })
}

export async function clientBalance(clientId: string) {
  const [invoices, payments] = await Promise.all([
    prisma.invoice.aggregate({ where: { clientId }, _sum: { total: true } }),
    prisma.payment.aggregate({ where: { clientId }, _sum: { amount: true } }),
  ])
  const billed = invoices._sum.total ?? 0
  const paid = payments._sum.amount ?? 0
  return { billed, paid, outstanding: billed - paid }
}

export async function getDashboardData() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const yearStart = new Date(now.getFullYear(), 0, 1)

  const [invoices, payments, clients, products] = await Promise.all([
    prisma.invoice.findMany({
      include: { client: true, payments: true, items: true },
      orderBy: { date: "desc" },
    }),
    prisma.payment.findMany(),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany(),
  ])

  const billed = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const paid = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const monthSales = invoices
    .filter((invoice) => invoice.date >= monthStart)
    .reduce((sum, invoice) => sum + invoice.total, 0)
  const yearSales = invoices
    .filter((invoice) => invoice.date >= yearStart)
    .reduce((sum, invoice) => sum + invoice.total, 0)

  const monthKeys: string[] = []
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthKeys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`)
  }

  const monthlySales = monthKeys.map((key) => {
    const [year, month] = key.split("-").map(Number)
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 1)
    const total = invoices
      .filter((invoice) => invoice.date >= start && invoice.date < end)
      .reduce((sum, invoice) => sum + invoice.total, 0)
    const label = start.toLocaleString("en-GB", { month: "short" })
    return { key, label, total }
  })

  const byClient = clients
    .map((client) => {
      const clientInvoices = invoices.filter((invoice) => invoice.clientId === client.id)
      const clientPayments = payments.filter((payment) => payment.clientId === client.id)
      const clientBilled = clientInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
      const clientPaid = clientPayments.reduce((sum, payment) => sum + payment.amount, 0)
      return {
        id: client.id,
        name: client.name,
        billed: clientBilled,
        paid: clientPaid,
        outstanding: clientBilled - clientPaid,
        invoices: clientInvoices.length,
      }
    })
    .sort((a, b) => b.billed - a.billed)

  const productSales = new Map<string, { name: string; qty: number; amount: number }>()
  for (const invoice of invoices) {
    for (const item of invoice.items) {
      const current = productSales.get(item.description) ?? {
        name: item.description,
        qty: 0,
        amount: 0,
      }
      current.qty += item.quantity
      current.amount += item.amount
      productSales.set(item.description, current)
    }
  }

  return {
    billed,
    paid,
    outstanding: billed - paid,
    monthSales,
    yearSales,
    invoiceCount: invoices.length,
    clientCount: clients.length,
    productCount: products.length,
    monthlySales,
    byClient,
    topProducts: [...productSales.values()].sort((a, b) => b.amount - a.amount).slice(0, 6),
    recent: invoices.slice(0, 8),
  }
}

export async function getClientReport(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      invoices: {
        include: { items: true, payments: true },
        orderBy: { date: "desc" },
      },
      payments: { orderBy: { date: "desc" } },
    },
  })
  if (!client) return null

  const billed = client.invoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const paid = client.payments.reduce((sum, payment) => sum + payment.amount, 0)

  const ledger = [
    ...client.invoices.map((invoice) => ({
      id: invoice.id,
      date: invoice.date,
      type: "invoice" as const,
      reference: `${displayInvoiceNo(invoice.globalNumber)} / ${invoice.clientNumber}`,
      debit: invoice.total,
      credit: 0,
      note: invoice.notes,
      method: "",
      notes: "",
      invoiceId: "",
      paymentReference: "",
    })),
    ...client.payments.map((payment) => ({
      id: payment.id,
      date: payment.date,
      type: "payment" as const,
      reference: payment.reference || payment.method,
      debit: 0,
      credit: payment.amount,
      note: payment.notes,
      method: payment.method,
      notes: payment.notes,
      invoiceId: payment.invoiceId || "",
      paymentReference: payment.reference,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  let running = 0
  const ledgerWithBalance = ledger.map((row) => {
    running += row.debit - row.credit
    return { ...row, balance: running }
  })

  const productSales = new Map<string, { name: string; qty: number; amount: number; unit: string }>()
  for (const invoice of client.invoices) {
    for (const item of invoice.items) {
      const current = productSales.get(item.description) ?? {
        name: item.description,
        qty: 0,
        amount: 0,
        unit: item.unit,
      }
      current.qty += item.quantity
      current.amount += item.amount
      productSales.set(item.description, current)
    }
  }

  return {
    client,
    billed,
    paid,
    outstanding: billed - paid,
    ledger: ledgerWithBalance,
    products: [...productSales.values()].sort((a, b) => b.amount - a.amount),
  }
}

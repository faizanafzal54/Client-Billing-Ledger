import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function nextInvoiceNumbers(clientId: string, prefix: string) {
  const [globalCounter, clientCounter] = await prisma.$transaction([
    prisma.counter.upsert({
      where: { key: "invoice" },
      create: { key: "invoice", value: 1 },
      update: { value: { increment: 1 } },
    }),
    prisma.counter.upsert({
      where: { key: `client:${clientId}` },
      create: { key: `client:${clientId}`, value: 1 },
      update: { value: { increment: 1 } },
    }),
  ])

  return {
    globalNumber: `INV${String(globalCounter.value).padStart(5, "0")}`,
    clientNumber: `${prefix}${clientCounter.value}`,
  }
}

export function invoiceStatus(total: number, paid: number) {
  if (paid <= 0) return "unpaid"
  if (paid + 0.01 >= total) return "paid"
  return "partial"
}

export const invoiceInclude = {
  client: true,
  items: { orderBy: { sortOrder: "asc" as const } },
  payments: true,
} satisfies Prisma.InvoiceInclude

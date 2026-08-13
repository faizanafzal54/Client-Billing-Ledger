import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const password = process.env.APP_PASSWORD || "AsgharAli@2026"

async function main() {
  const hash = await bcrypt.hash(password, 10)

  await prisma.user.upsert({
    where: { email: "asgharumair809@gmail.com" },
    update: {},
    create: {
      email: "asgharumair809@gmail.com",
      name: "Umair Asghar",
      password: hash,
    },
  })

  await prisma.user.upsert({
    where: { email: "faizanafzal2924@gmail.com" },
    update: {},
    create: {
      email: "faizanafzal2924@gmail.com",
      name: "Faizan Afzal",
      password: hash,
    },
  })

  await prisma.company.upsert({
    where: { key: "company" },
    update: {
      name: "Asghar Ali Chemicals",
      address: "MAIN CANAL ROAD",
      city: "Lahore",
      phone: "03224360607",
      email: "asgharumair809@gmail.com",
      invoiceNotes: "Thanks for your business.",
    },
    create: {
      key: "company",
      name: "Asghar Ali Chemicals",
      tagline: "Dealers in Industrial Chemicals",
      address: "MAIN CANAL ROAD",
      city: "Lahore",
      phone: "03224360607",
      email: "asgharumair809@gmail.com",
      ntn: "",
      strn: "",
      taxPercent: 0,
      invoiceNotes: "Thanks for your business.",
    },
  })

  const turk =
    (await prisma.client.findFirst({ where: { name: "TurkPlast" } })) ??
    (await prisma.client.create({
      data: {
        name: "TurkPlast",
        prefix: "Turk",
        city: "Lahore",
        notes: "Pipes and fittings manufacturer",
      },
    }))

  const dura =
    (await prisma.client.findFirst({ where: { name: "DuraFlow" } })) ??
    (await prisma.client.create({
      data: {
        name: "DuraFlow",
        prefix: "Dura",
        city: "Lahore",
        notes: "PPRC / UPVC pipes and fittings",
      },
    }))

  const products = [{ name: "PVC Cement 500 ML", unit: "BOTTLE", defaultRate: 350 }]

  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } })
    if (!existing) {
      await prisma.product.create({ data: product })
    }
  }

  const extraNames = [
    "PVC Resin K67",
    "Calcium Carbonate (CaCO3)",
    "Titanium Dioxide",
    "Lead Stabilizer",
    "PE Wax",
    "Stearic Acid",
    "DOP Plasticizer",
    "Carbon Black",
    "PVC Cement 500 ML (12 Bottle Tray)",
  ]
  const extra = await prisma.product.findMany({
    where: { name: { in: extraNames } },
  })
  for (const product of extra) {
    await prisma.invoiceItem.updateMany({
      where: { productId: product.id },
      data: { productId: null },
    })
    await prisma.product.delete({ where: { id: product.id } })
  }

  await prisma.counter.upsert({
    where: { key: "invoice" },
    update: {},
    create: { key: "invoice", value: 0 },
  })
  await prisma.counter.upsert({
    where: { key: `client:${turk.id}` },
    update: {},
    create: { key: `client:${turk.id}`, value: 0 },
  })
  await prisma.counter.upsert({
    where: { key: `client:${dura.id}` },
    update: {},
    create: { key: `client:${dura.id}`, value: 0 },
  })

  console.log("Seeded Asghar Ali Chemicals ledger on MongoDB Atlas.")
  console.log("Login emails:")
  console.log("  asgharumair809@gmail.com")
  console.log("  faizanafzal2924@gmail.com")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

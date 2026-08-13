import { ProductsManager } from "@/components/products-manager"
import { PageHeader } from "@/components/ui"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } })

  return (
    <div>
      <PageHeader
        title="Products"
        description="Chemicals and other items you sell. You can also add a product while creating an invoice."
      />
      <ProductsManager products={products} />
    </div>
  )
}

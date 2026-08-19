"use client"

import { ProductsManager } from "@/components/products-manager"
import { PageHeader } from "@/components/ui"
import { LoadError, PageHeaderSkeleton, TableSkeleton } from "@/components/skeletons"
import { useApi } from "@/lib/client-data"

type ProductRow = {
  id: string
  name: string
  unit: string
  defaultRate: number
  description: string
}

export function ProductsView() {
  const { data, error, loading } = useApi<ProductRow[]>("/api/products")

  if (loading && !data) {
    return (
      <div>
        <PageHeaderSkeleton />
        <TableSkeleton cols={4} />
      </div>
    )
  }
  if (error || !data) return <LoadError />

  return (
    <div>
      <PageHeader
        title="Products"
        description="Chemicals and other items you sell. You can also add a product while creating an invoice."
      />
      <ProductsManager products={data} />
    </div>
  )
}

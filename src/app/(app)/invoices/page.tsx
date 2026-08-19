import { Suspense } from "react"
import { PageHeaderSkeleton, TableSkeleton } from "@/components/skeletons"
import { InvoicesView } from "@/components/views/invoices-view"

function InvoicesFallback() {
  return (
    <div>
      <PageHeaderSkeleton withAction />
      <TableSkeleton />
    </div>
  )
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<InvoicesFallback />}>
      <InvoicesView />
    </Suspense>
  )
}

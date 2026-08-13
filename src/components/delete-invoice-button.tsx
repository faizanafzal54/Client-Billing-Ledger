"use client"

import { deleteInvoice } from "@/app/actions/invoices"
import { ConfirmDeleteButton } from "@/components/confirm-dialog"

export function DeleteInvoiceButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      title="Delete this invoice?"
      description="This cannot be undone. The invoice will be removed from the client ledger."
      onConfirm={async () => {
        const formData = new FormData()
        formData.set("id", id)
        await deleteInvoice(formData)
      }}
    />
  )
}

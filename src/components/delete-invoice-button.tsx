"use client"

import { useRouter } from "next/navigation"
import { deleteInvoice } from "@/app/actions/invoices"
import { ConfirmDeleteButton } from "@/components/confirm-dialog"

export function DeleteInvoiceButton({
  id,
  className,
  ariaLabel,
  redirectTo = "/invoices",
  children,
}: {
  id: string
  className?: string
  ariaLabel?: string
  redirectTo?: string | null
  children?: React.ReactNode
}) {
  const router = useRouter()

  return (
    <ConfirmDeleteButton
      className={className}
      ariaLabel={ariaLabel}
      title="Delete this invoice?"
      description="This cannot be undone. The invoice will be removed from the client ledger."
      onConfirm={async () => {
        const formData = new FormData()
        formData.set("id", id)
        const result = await deleteInvoice(formData)
        if (result.ok) {
          router.refresh()
          if (redirectTo) router.push(redirectTo)
        }
        return result
      }}
    >
      {children ?? "Delete"}
    </ConfirmDeleteButton>
  )
}

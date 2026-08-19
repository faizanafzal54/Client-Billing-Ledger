"use client"

import type { ButtonHTMLAttributes } from "react"
import { useFormStatus } from "react-dom"
import { Spinner } from "@/components/ui"

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: string
}

export function SubmitButton({
  children,
  className,
  pendingLabel,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()
  const busy = pending || Boolean(disabled)

  return (
    <button {...props} type="submit" className={className} disabled={busy} aria-busy={pending}>
      {pending ? <Spinner /> : null}
      {pending ? pendingLabel || null : children}
    </button>
  )
}

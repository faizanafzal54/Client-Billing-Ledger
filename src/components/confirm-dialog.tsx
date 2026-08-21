"use client"

import { useEffect, useState, useTransition } from "react"
import { X } from "lucide-react"
import type { ActionResult } from "@/lib/definitions"
import { Spinner } from "@/components/ui"
import { notifyDataChanged } from "@/lib/client-data"

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  pending = false,
  error,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  pending?: boolean
  error?: string
  onCancel: () => void
  onConfirm: () => void
}) {
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onCancel()
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, pending, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={pending ? undefined : onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative z-10 w-full max-w-md rounded-t-2xl bg-paper p-5 sm:rounded-2xl"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 id="confirm-title" className="font-display text-2xl">
            {title}
          </h3>
          <button className="btn-ghost px-2" type="button" onClick={onCancel} disabled={pending}>
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-muted">{description}</p>
        {error ? <p className="mt-3 rounded-lg bg-bad/10 px-3 py-2 text-sm text-bad">{error}</p> : null}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button className="btn-ghost" type="button" onClick={onCancel} disabled={pending}>
            Cancel
          </button>
          <button className="btn-danger" type="button" onClick={onConfirm} disabled={pending} aria-busy={pending}>
            {pending ? <Spinner /> : null}
            {pending ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ConfirmDeleteButton({
  title,
  description,
  confirmLabel,
  className = "btn-danger",
  ariaLabel,
  children = "Delete",
  onConfirm,
}: {
  title: string
  description: string
  confirmLabel?: string
  className?: string
  ariaLabel?: string
  children?: React.ReactNode
  onConfirm: () => Promise<ActionResult | void>
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  return (
    <>
      <button
        className={className}
        type="button"
        aria-label={ariaLabel}
        onClick={() => {
          setError("")
          setOpen(true)
        }}
      >
        {children}
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        pending={pending}
        error={error}
        onCancel={() => {
          if (!pending) setOpen(false)
        }}
        onConfirm={() => {
          setError("")
          startTransition(async () => {
            const result = await onConfirm()
            if (result && result.ok === false) {
              setError(result.error || "Could not delete.")
              return
            }
            setOpen(false)
            notifyDataChanged()
          })
        }}
      />
    </>
  )
}

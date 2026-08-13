"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient, deleteClient, updateClient } from "@/app/actions/clients"
import { ConfirmDeleteButton } from "@/components/confirm-dialog"

type ClientValues = {
  id?: string
  name: string
  prefix: string
  address: string
  city: string
  phone: string
  email: string
  ntn: string
  notes: string
}

export function ClientForm({
  client,
  onDone,
}: {
  client?: ClientValues
  onDone?: () => void
}) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function submit(formData: FormData) {
    setError("")
    startTransition(async () => {
      const result = client?.id ? await updateClient(formData) : await createClient(formData)
      if (!result.ok) setError(result.error || "Could not save client.")
      else {
        router.refresh()
        onDone?.()
      }
    })
  }

  return (
    <form action={submit} className="space-y-3">
      {client?.id ? <input type="hidden" name="id" value={client.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input className="field" name="name" required defaultValue={client?.name} placeholder="TurkPlast" />
        </div>
        <div>
          <label className="label">Invoice prefix</label>
          <input className="field" name="prefix" required defaultValue={client?.prefix} placeholder="Turk" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="field" name="phone" defaultValue={client?.phone} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="field" name="email" type="email" defaultValue={client?.email} />
        </div>
        <div>
          <label className="label">City</label>
          <input className="field" name="city" defaultValue={client?.city} />
        </div>
        <div>
          <label className="label">NTN</label>
          <input className="field" name="ntn" defaultValue={client?.ntn} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Address</label>
          <input className="field" name="address" defaultValue={client?.address} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Notes</label>
          <textarea className="field min-h-20" name="notes" defaultValue={client?.notes} />
        </div>
      </div>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      <button className="btn-primary" disabled={pending} type="submit">
        {pending ? "Saving…" : client?.id ? "Save client" : "Create client"}
      </button>
    </form>
  )
}

export function DeleteClientButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      title="Delete this client?"
      description="Only clients with no invoices can be deleted. Their ledger history stays if invoices exist."
      onConfirm={async () => {
        const formData = new FormData()
        formData.set("id", id)
        return deleteClient(formData)
      }}
    />
  )
}

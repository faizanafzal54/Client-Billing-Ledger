"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ClientForm } from "@/components/client-form"
import { formatPKR } from "@/lib/money"

type ClientRow = {
  id: string
  name: string
  prefix: string
  city: string
  phone: string
  billed: number
  outstanding: number
  invoices: number
}

export function ClientsManager({ clients }: { clients: ClientRow[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return clients
    return clients.filter((client) =>
      [client.name, client.prefix].join(" ").toLowerCase().includes(needle),
    )
  }, [clients, query])

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label" htmlFor="client-search">
            Search
          </label>
          <input
            id="client-search"
            className="field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or prefix"
          />
        </div>
        <button className="btn-primary sm:mb-px" type="button" onClick={() => setOpen((value) => !value)}>
          {open ? "Close form" : "New client"}
        </button>
      </div>
      {open ? (
        <div className="card mb-6 p-4 sm:p-5">
          <ClientForm onDone={() => setOpen(false)} />
        </div>
      ) : null}

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            {clients.length === 0
              ? "No clients yet. Add TurkPlast, DuraFlow, or any other buyer."
              : "No clients match that search."}
          </p>
        ) : (
          <ul>
            {filtered.map((client) => (
              <li key={client.id} className="border-b border-line last:border-0">
                <Link href={`/clients/${client.id}`} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-xs text-muted">
                      Prefix {client.prefix}
                      {client.city ? ` · ${client.city}` : ""}
                      {client.phone ? ` · ${client.phone}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{formatPKR(client.billed)}</p>
                    <p className="text-xs text-warn">{formatPKR(client.outstanding)} due</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

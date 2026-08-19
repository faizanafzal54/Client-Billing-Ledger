"use client"

import { useEffect, useState } from "react"

export function notifyDataChanged() {
  window.dispatchEvent(new Event("ledger-data"))
}

export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(Boolean(url))

  useEffect(() => {
    if (!url) {
      setLoading(false)
      return
    }

    let active = true
    const controllers: AbortController[] = []
    const endpoint = url

    async function load(background = false) {
      const controller = new AbortController()
      controllers.push(controller)
      if (!background) {
        setLoading(true)
        setError("")
        setData(null)
      }
      try {
        const response = await fetch(endpoint, { signal: controller.signal, credentials: "same-origin" })
        if (response.status === 401) {
          window.location.href = "/login"
          return
        }
        if (response.status === 404) {
          if (active && !background) setError("not-found")
          return
        }
        if (!response.ok) throw new Error("Request failed")
        const payload = (await response.json()) as T
        if (active) {
          setData(payload)
          setError("")
        }
      } catch (err) {
        if (!active) return
        if (err instanceof DOMException && err.name === "AbortError") return
        if (!background) setError("Failed to load")
      } finally {
        if (active) setLoading(false)
      }
    }

    void load(false)
    function onRefresh() {
      void load(true)
    }
    window.addEventListener("ledger-data", onRefresh)
    return () => {
      active = false
      for (const controller of controllers) controller.abort()
      window.removeEventListener("ledger-data", onRefresh)
    }
  }, [url])

  return { data, error, loading }
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

/** YYYY-MM-DD from a date input, keeping the local time of `at` (defaults to now). */
export function dateAtTime(value: string, at = new Date()) {
  const [year, month, day] = String(value || "").slice(0, 10).split("-").map(Number)
  if (!year || !month || !day) return at
  return new Date(year, month - 1, day, at.getHours(), at.getMinutes(), at.getSeconds(), at.getMilliseconds())
}

export function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatInvoiceDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function slugPrefix(name: string) {
  const cleaned = name.replace(/[^A-Za-z0-9]/g, "")
  return cleaned.slice(0, 6) || "CL"
}

export function displayInvoiceNo(globalNumber: string) {
  const digits = globalNumber.replace(/\D/g, "") || "0"
  return `INV${digits.padStart(5, "0")}`
}

export function monthKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number)
  return new Date(year, month - 1, 1).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  })
}

export function fileSlug(value: string) {
  return value.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "") || "file"
}

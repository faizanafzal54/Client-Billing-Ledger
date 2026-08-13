const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
]

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
]

function twoDigits(n: number) {
  if (n < 20) return ONES[n]
  const ten = Math.floor(n / 10)
  const one = n % 10
  return `${TENS[ten]}${one ? ` ${ONES[one]}` : ""}`.trim()
}

function threeDigits(n: number) {
  const hundred = Math.floor(n / 100)
  const rest = n % 100
  if (hundred && rest) return `${ONES[hundred]} Hundred ${twoDigits(rest)}`
  if (hundred) return `${ONES[hundred]} Hundred`
  return twoDigits(rest)
}

export function amountInWords(amount: number) {
  const rounded = Math.round(amount)
  if (rounded === 0) return "Rupees Zero Only"

  const crore = Math.floor(rounded / 10_000_000)
  const lakh = Math.floor((rounded % 10_000_000) / 100_000)
  const thousand = Math.floor((rounded % 100_000) / 1000)
  const rest = rounded % 1000

  const parts: string[] = []
  if (crore) parts.push(`${threeDigits(crore)} Crore`)
  if (lakh) parts.push(`${threeDigits(lakh)} Lakh`)
  if (thousand) parts.push(`${threeDigits(thousand)} Thousand`)
  if (rest) parts.push(threeDigits(rest))

  return `Rupees ${parts.join(" ")} Only`
}

export function formatPKR(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
}

export function formatRs(amount: number) {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `Rs${formatted}`
}

export function formatNumber(amount: number, digits = 2) {
  return new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount)
}

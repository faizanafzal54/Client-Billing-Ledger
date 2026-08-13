import type { Metadata, Viewport } from "next"
import { Fraunces, Manrope } from "next/font/google"
import "./globals.css"

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
})

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Asghar Ali Chemicals",
  description: "Client billing ledger for Asghar Ali Chemicals",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14221c",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full bg-cream text-ink">{children}</body>
    </html>
  )
}

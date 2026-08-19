"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  Settings,
  Users,
} from "lucide-react"
import { logout } from "@/app/actions/auth"
import { SubmitButton } from "@/components/submit-button"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/products", label: "Products", icon: Package },
  { href: "/reports", label: "Reports", icon: BarChart3 },
]

export function AppShell({
  children,
  userName,
}: {
  children: React.ReactNode
  userName: string
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-ink text-cream lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <p className="font-display text-xl leading-tight">Asghar Ali</p>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-brass">Chemicals Ledger</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                  active ? "bg-white/10 text-white" : "text-cream/70 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm text-cream/80">{userName}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/settings" className="btn-ghost flex-1 border-white/15 bg-transparent text-cream hover:bg-white/10">
              <Settings size={16} />
              Settings
            </Link>
            <form action={logout}>
              <SubmitButton
                className="btn-ghost border-white/15 bg-transparent text-cream hover:bg-white/10"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </SubmitButton>
            </form>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64 print:pl-0">
        <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-line bg-cream/90 px-4 py-3 backdrop-blur lg:px-8">
          <div>
            <p className="font-display text-lg lg:hidden">Asghar Ali Chemicals</p>
            <p className="hidden text-sm text-muted lg:block">Sales ledger & invoicing</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings" className="btn-ghost px-3 lg:hidden" aria-label="Settings">
              <Settings size={16} />
            </Link>
            <Link href="/invoices/new" className="btn-primary">
              <Plus size={16} />
              New invoice
            </Link>
          </div>
        </header>
        <main className="px-4 pb-24 pt-6 lg:px-8 lg:pb-10 print:p-0">{children}</main>
      </div>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-paper lg:hidden">
        {nav.slice(0, 4).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-ink" : "text-muted",
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
        <Link
          href="/reports"
          className={cn(
            "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
            pathname.startsWith("/reports") || pathname.startsWith("/settings") ? "text-ink" : "text-muted",
          )}
        >
          <BarChart3 size={18} />
          More
        </Link>
      </nav>
    </div>
  )
}

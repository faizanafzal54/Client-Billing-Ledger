import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-brass-dark">Private ledger</p>
          <h1 className="font-display mt-2 text-4xl">Asghar Ali Chemicals</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage invoices, clients, and sales.</p>
        </div>
        <div className="card p-6">
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-muted">Access is limited to authorized company accounts.</p>
      </div>
    </main>
  )
}

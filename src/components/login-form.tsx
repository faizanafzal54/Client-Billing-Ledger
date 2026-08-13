"use client"

import { useActionState } from "react"
import { login } from "@/app/actions/auth"
import { PasswordField } from "@/components/password-field"

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="field"
          placeholder="asgharumair809@gmail.com"
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <PasswordField
          id="password"
          name="password"
          required
          autoComplete="current-password"
        />
      </div>
      {state?.error ? (
        <p className="rounded-lg bg-bad/10 px-3 py-2 text-sm text-bad">{state.error}</p>
      ) : null}
      <button className="btn-primary w-full" disabled={pending} type="submit">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  )
}

"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export function PasswordField({
  id,
  name,
  autoComplete,
  required,
  minLength,
}: {
  id?: string
  name: string
  autoComplete?: string
  required?: boolean
  minLength?: number
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="field has-toggle"
      />
      <button
        className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-muted hover:text-ink"
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

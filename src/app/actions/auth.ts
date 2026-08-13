"use server"

import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { ALLOWED_EMAILS } from "@/lib/definitions"
import { prisma } from "@/lib/prisma"
import { createSession, deleteSession } from "@/lib/session"

export type LoginState = { error?: string } | undefined

export async function login(prevState: LoginState, formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase()
  const password = String(formData.get("password") || "")

  if (!ALLOWED_EMAILS.includes(email as (typeof ALLOWED_EMAILS)[number])) {
    return { error: "This account is not authorized to access the ledger." }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: "This account is not authorized to access the ledger." }
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return { error: "Incorrect email or password." }
  }

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
  })
  redirect("/dashboard")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}

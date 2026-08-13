export type SessionPayload = {
  userId: string
  email: string
  name: string
  expiresAt: string
}

export const ALLOWED_EMAILS = [
  "asgharumair809@gmail.com",
  "faizanafzal2924@gmail.com",
] as const

export type AllowedEmail = (typeof ALLOWED_EMAILS)[number]

export type ActionResult = {
  ok: boolean
  error?: string
  id?: string
}

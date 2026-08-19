"use client"

import { useState, useTransition } from "react"
import { changePassword, updateCompany } from "@/app/actions/settings"
import { logout } from "@/app/actions/auth"
import { PasswordField } from "@/components/password-field"
import { SubmitButton } from "@/components/submit-button"
import { Spinner } from "@/components/ui"
import { notifyDataChanged } from "@/lib/client-data"

type CompanyValues = {
  name: string
  tagline: string
  address: string
  city: string
  phone: string
  email: string
  ntn: string
  strn: string
  bankName: string
  bankAccount: string
  bankIban: string
  taxPercent: number
  invoiceNotes: string
}

export function SettingsForms({ company }: { company: CompanyValues }) {
  const [companyMessage, setCompanyMessage] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [companyPending, startCompany] = useTransition()
  const [passwordPending, startPassword] = useTransition()

  return (
    <div className="space-y-6">
      <section className="card p-4 sm:p-5">
        <h2 className="font-display mb-4 text-xl">Company details</h2>
        <form
          className="grid gap-3 sm:grid-cols-2"
          action={(formData) => {
            setCompanyMessage("")
            startCompany(async () => {
              await updateCompany(formData)
              setCompanyMessage("Company details saved.")
              notifyDataChanged()
            })
          }}
        >
          <div>
            <label className="label">Company name</label>
            <input className="field" name="name" defaultValue={company.name} required />
          </div>
          <div>
            <label className="label">Tagline</label>
            <input className="field" name="tagline" defaultValue={company.tagline} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input className="field" name="address" defaultValue={company.address} />
          </div>
          <div>
            <label className="label">City</label>
            <input className="field" name="city" defaultValue={company.city} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="field" name="phone" defaultValue={company.phone} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="field" name="email" defaultValue={company.email} />
          </div>
          <div>
            <label className="label">NTN</label>
            <input className="field" name="ntn" defaultValue={company.ntn} />
          </div>
          <div>
            <label className="label">STRN</label>
            <input className="field" name="strn" defaultValue={company.strn} />
          </div>
          <div>
            <label className="label">Default sales tax %</label>
            <input className="field" type="number" name="taxPercent" min="0" step="0.01" defaultValue={company.taxPercent} />
          </div>
          <div>
            <label className="label">Bank name</label>
            <input className="field" name="bankName" defaultValue={company.bankName} />
          </div>
          <div>
            <label className="label">Account no.</label>
            <input className="field" name="bankAccount" defaultValue={company.bankAccount} />
          </div>
          <div>
            <label className="label">IBAN</label>
            <input className="field" name="bankIban" defaultValue={company.bankIban} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Invoice footer notes</label>
            <textarea className="field min-h-20" name="invoiceNotes" defaultValue={company.invoiceNotes} />
          </div>
          {companyMessage ? <p className="text-sm text-good sm:col-span-2">{companyMessage}</p> : null}
          <div className="sm:col-span-2">
            <button className="btn-primary" disabled={companyPending} type="submit" aria-busy={companyPending}>
              {companyPending ? <Spinner /> : null}
              {companyPending ? "Saving…" : "Save company"}
            </button>
          </div>
        </form>
      </section>

      <section className="card p-4 sm:p-5">
        <h2 className="font-display mb-4 text-xl">Change password</h2>
        <form
          className="max-w-md space-y-3"
          action={(formData) => {
            setPasswordError("")
            setPasswordMessage("")
            startPassword(async () => {
              const result = await changePassword(formData)
              if (!result.ok) setPasswordError(result.error || "Could not change password.")
              else setPasswordMessage("Password updated.")
            })
          }}
        >
          <div>
            <label className="label" htmlFor="currentPassword">
              Current password
            </label>
            <PasswordField
              id="currentPassword"
              name="currentPassword"
              required
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="label" htmlFor="newPassword">
              New password
            </label>
            <PasswordField
              id="newPassword"
              name="newPassword"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {passwordError ? <p className="text-sm text-bad">{passwordError}</p> : null}
          {passwordMessage ? <p className="text-sm text-good">{passwordMessage}</p> : null}
          <button className="btn-primary" disabled={passwordPending} type="submit" aria-busy={passwordPending}>
            {passwordPending ? <Spinner /> : null}
            {passwordPending ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>

      <form action={logout}>
        <SubmitButton className="btn-ghost" pendingLabel="Signing out…">
          Sign out
        </SubmitButton>
      </form>
    </div>
  )
}

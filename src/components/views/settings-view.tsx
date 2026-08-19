"use client"

import { SettingsForms } from "@/components/settings-forms"
import { PageHeader } from "@/components/ui"
import { FormSkeleton, LoadError, PageHeaderSkeleton } from "@/components/skeletons"
import { useApi } from "@/lib/client-data"

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

export function SettingsView() {
  const { data, error, loading } = useApi<CompanyValues>("/api/company")

  if (loading && !data) {
    return (
      <div>
        <PageHeaderSkeleton />
        <FormSkeleton />
      </div>
    )
  }
  if (error || !data) return <LoadError />

  return (
    <div>
      <PageHeader title="Settings" description="These details print on every invoice." />
      <SettingsForms company={data} />
    </div>
  )
}

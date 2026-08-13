import { PageHeader } from "@/components/ui"
import { SettingsForms } from "@/components/settings-forms"
import { getCompany } from "@/lib/queries"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const company = await getCompany()

  return (
    <div>
      <PageHeader
        title="Settings"
        description="These details print on every invoice."
      />
      <SettingsForms company={company} />
    </div>
  )
}

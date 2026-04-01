import { HomeContentManagementClient } from "@/components/admin/home-content-management-client"
import { getHomeContentEditorConfig } from "@/data/home-content-store"

export default async function HomeContentPage() {
  const data = await getHomeContentEditorConfig()

  return <HomeContentManagementClient initialData={data} />
}

export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"

import { AdminLayoutClient } from "@/components/admin/admin-layout-client"
import { getAdminSession } from "@/lib/auth"

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getAdminSession()

  if (!session) {
    redirect("/giris")
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}

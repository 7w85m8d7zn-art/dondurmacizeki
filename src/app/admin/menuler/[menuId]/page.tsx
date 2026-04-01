import { notFound } from "next/navigation"

import { MenuDetailClient } from "@/components/admin/menu-detail-client"
import { getCatalogManagementData } from "@/data/catalog-store"
import { getMenuDetail, getMenuManagementData } from "@/data/menu-management-store"

interface MenuDetailPageProps {
  params: Promise<{
    menuId: string
  }>
}

export default async function MenuDetailPage({
  params,
}: MenuDetailPageProps) {
  const { menuId } = await params
  const detail = await getMenuDetail(menuId)

  if (!detail) {
    notFound()
  }

  const [{ branches }, catalog] = await Promise.all([
    getMenuManagementData(),
    getCatalogManagementData(),
  ])

  return <MenuDetailClient branches={branches} menu={detail} catalog={catalog} />
}

export const dynamic = "force-dynamic"

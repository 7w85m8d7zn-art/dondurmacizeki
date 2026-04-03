import "server-only"

import type {
  QrDesignFormValues,
  QrDesignItem,
  QrDesignManagementData,
} from "@/types/qr-design-management"
import {
  getSupabaseAdminClient,
  throwIfSupabaseError,
} from "@/lib/supabase-data"

type QrDesignRow = {
  id: string
  branchId: string
  menuId: string
  generatedUrl: string
  title: string
  subtitle: string | null
  showLogo: boolean
  showIcon: boolean
  backgroundColor: string
  qrBackgroundColor: string
  textColor: string
  accentColor: string
  frameThickness: number
  cornerRadius: number
  templateKey: string
  logoUrl: string | null
  isActive: boolean
  updatedAt: string
}

type QrDesignEntity = Omit<QrDesignRow, "updatedAt"> & {
  updatedAt: Date
}

function toQrDesignEntity(row: QrDesignRow): QrDesignEntity {
  return {
    ...row,
    updatedAt: new Date(row.updatedAt),
  }
}

function mapQrDesign(
  design: QrDesignEntity,
  resolveBranchName: (branchId: string) => Promise<string>,
  resolveMenuName: (menuId: string) => Promise<string>,
): Promise<QrDesignItem> {
  return Promise.all([
    resolveBranchName(design.branchId),
    resolveMenuName(design.menuId),
  ]).then(([branchName, menuName]) => ({
    id: design.id,
    branchId: design.branchId,
    branchName,
    menuId: design.menuId,
    menuName,
    generatedUrl: design.generatedUrl,
    title: design.title,
    subtitle: design.subtitle ?? "",
    showLogo: design.showLogo,
    showIcon: design.showIcon,
    backgroundColor: design.backgroundColor,
    qrBackgroundColor: design.qrBackgroundColor,
    textColor: design.textColor,
    accentColor: design.accentColor,
    frameThickness: design.frameThickness,
    cornerRadius: design.cornerRadius,
    templateId: design.templateKey,
    logoUrl: design.logoUrl ?? "",
    isActive: design.isActive,
    updatedAt: design.updatedAt.toISOString(),
  }))
}

export async function getQrDesignManagementData(
  resolveBranchName: (branchId: string) => Promise<string>,
  resolveMenuName: (menuId: string) => Promise<string>,
): Promise<QrDesignManagementData> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("QrDesign")
    .select("*")
    .order("updatedAt", { ascending: false })

  throwIfSupabaseError(error, "QR tasarım listesi alınamadı")

  const designs = ((data ?? []) as QrDesignRow[]).map(toQrDesignEntity)

  return {
    designs: await Promise.all(
      designs.map((design) => mapQrDesign(design, resolveBranchName, resolveMenuName)),
    ),
  }
}

export async function getQrDesignById(
  designId: string,
  resolveBranchName: (branchId: string) => Promise<string>,
  resolveMenuName: (menuId: string) => Promise<string>,
) {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("QrDesign")
    .select("*")
    .eq("id", designId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return mapQrDesign(toQrDesignEntity(data as QrDesignRow), resolveBranchName, resolveMenuName)
}

export async function createQrDesign(values: QrDesignFormValues) {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from("QrDesign")
    .insert({
      branchId: values.branchId,
      menuId: values.menuId,
      generatedUrl: values.generatedUrl,
      title: values.title,
      subtitle: values.subtitle,
      showLogo: values.showLogo,
      showIcon: values.showIcon,
      backgroundColor: values.backgroundColor,
      qrBackgroundColor: values.qrBackgroundColor,
      textColor: values.textColor,
      accentColor: values.accentColor,
      frameThickness: values.frameThickness,
      cornerRadius: values.cornerRadius,
      templateKey: values.templateId,
      logoUrl: values.logoUrl,
      isActive: values.isActive,
    })
    .select("*")
    .single()

  throwIfSupabaseError(error, "QR tasarımı oluşturulamadı")

  return toQrDesignEntity(data as QrDesignRow)
}

export async function updateQrDesign(designId: string, values: QrDesignFormValues) {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from("QrDesign")
    .update({
      branchId: values.branchId,
      menuId: values.menuId,
      generatedUrl: values.generatedUrl,
      title: values.title,
      subtitle: values.subtitle,
      showLogo: values.showLogo,
      showIcon: values.showIcon,
      backgroundColor: values.backgroundColor,
      qrBackgroundColor: values.qrBackgroundColor,
      textColor: values.textColor,
      accentColor: values.accentColor,
      frameThickness: values.frameThickness,
      cornerRadius: values.cornerRadius,
      templateKey: values.templateId,
      logoUrl: values.logoUrl,
      isActive: values.isActive,
    })
    .eq("id", designId)
    .select("*")
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return toQrDesignEntity(data as QrDesignRow)
}

export async function deleteQrDesign(designId: string) {
  const supabase = getSupabaseAdminClient()
  const { error } = await supabase.from("QrDesign").delete().eq("id", designId)
  return !error
}

export async function deleteQrDesignsByMenuId(menuId: string) {
  const supabase = getSupabaseAdminClient()
  await supabase.from("QrDesign").delete().eq("menuId", menuId)
}

export async function deleteQrDesignsByBranchId(branchId: string) {
  const supabase = getSupabaseAdminClient()
  await supabase.from("QrDesign").delete().eq("branchId", branchId)
}

export async function hasQrDesignConflict(
  branchId: string,
  menuId: string,
  excludedDesignId?: string,
) {
  const supabase = getSupabaseAdminClient()

  let query = supabase
    .from("QrDesign")
    .select("id")
    .eq("branchId", branchId)
    .eq("menuId", menuId)

  if (excludedDesignId) {
    query = query.neq("id", excludedDesignId)
  }

  const { data, error } = await query.limit(1).maybeSingle()

  if (error) {
    return false
  }

  return Boolean(data)
}

import {
  createQrDesign,
  deleteQrDesign,
  getQrDesignById,
  getQrDesignManagementData,
  hasQrDesignConflict,
  updateQrDesign,
} from "@/data/qr-design-store"
import { getBranchNameById, hasBranch } from "@/data/branches-store"
import { getMenuById } from "@/data/menu-management-store"
import { badRequest, conflict, notFound } from "@/lib/api-response"
import type { QrDesignFormValues } from "@/types/qr-design-management"
import { resolveMenuName } from "./menu-service"

export async function listQrDesigns() {
  return getQrDesignManagementData(getBranchNameById, resolveMenuName)
}

export async function getQrDesignRecord(designId: string) {
  const design = await getQrDesignById(designId, getBranchNameById, resolveMenuName)

  if (!design) {
    throw notFound("QR tasarimi bulunamadi.")
  }

  return design
}

export async function createQrDesignRecord(values: QrDesignFormValues) {
  await validateQrDependencies(values.branchId, values.menuId)

  if (await hasQrDesignConflict(values.branchId, values.menuId)) {
    throw conflict("Bu sube ve menu icin zaten bir QR tasarimi var.")
  }

  return shapeQrDesignResponse(await createQrDesign(values))
}

export async function updateQrDesignRecord(designId: string, values: QrDesignFormValues) {
  await validateQrDependencies(values.branchId, values.menuId)

  if (await hasQrDesignConflict(values.branchId, values.menuId, designId)) {
    throw conflict("Bu sube ve menu icin zaten bir QR tasarimi var.")
  }

  const design = await updateQrDesign(designId, values)

  if (!design) {
    throw notFound("QR tasarimi bulunamadi.")
  }

  return shapeQrDesignResponse(design)
}

export async function deleteQrDesignRecord(designId: string) {
  const deleted = await deleteQrDesign(designId)

  if (!deleted) {
    throw notFound("QR tasarimi bulunamadi.")
  }

  return { id: designId }
}

async function validateQrDependencies(branchId: string, menuId: string) {
  if (!(await hasBranch(branchId))) {
    throw badRequest("Secilen sube bulunamadi.")
  }

  if (!(await getMenuById(menuId))) {
    throw badRequest("Secilen menu bulunamadi.")
  }
}

async function shapeQrDesignResponse(values: {
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
  updatedAt: Date
}) {
  return {
    id: values.id,
    branchId: values.branchId,
    menuId: values.menuId,
    generatedUrl: values.generatedUrl,
    title: values.title,
    subtitle: values.subtitle ?? "",
    showLogo: values.showLogo,
    showIcon: values.showIcon,
    backgroundColor: values.backgroundColor,
    qrBackgroundColor: values.qrBackgroundColor,
    textColor: values.textColor,
    accentColor: values.accentColor,
    frameThickness: values.frameThickness,
    cornerRadius: values.cornerRadius,
    templateId: values.templateKey,
    logoUrl: values.logoUrl ?? "",
    isActive: values.isActive,
    updatedAt: values.updatedAt.toISOString(),
    branchName: await getBranchNameById(values.branchId),
    menuName: await resolveMenuName(values.menuId),
  }
}

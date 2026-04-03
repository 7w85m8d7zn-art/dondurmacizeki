import {
  createBranch,
  deleteBranch,
  getBranchById,
  getBranchManagementData,
  getBranchNameById,
  isBranchSlugTaken,
  toggleBranchStatus,
  updateBranch,
} from "@/data/branches-store"
import { deleteQrDesignsByBranchId } from "@/data/qr-design-store"
import { removeHomeBranchCard, upsertHomeBranchCard } from "@/data/home-content-store"
import { getMenusByBranchId } from "@/data/menu-management-store"
import { badRequest, conflict, notFound } from "@/lib/api-response"
import type { BranchFormValues } from "@/types/branch-management"
import { deleteMenuCascade, getMenuCountByBranchId } from "./menu-service"

export function listBranches() {
  return getBranchManagementData(getMenuCountByBranchId)
}

export async function getBranchDetail(branchId: string) {
  const branch = await getBranchById(branchId)

  if (!branch) {
    throw notFound("Şube bulunamadı.")
  }

  return {
    ...branch,
    menuCount: await getMenuCountByBranchId(branch.id),
  }
}

export async function createBranchRecord(values: BranchFormValues) {
  if (await isBranchSlugTaken(values.slug)) {
    throw conflict("Bu şube slug'i zaten kullanımda.")
  }

  const branch = await createBranch(values)

  await upsertHomeBranchCard({
    branchId: branch.id,
    title: branch.name,
    shortAddress: branch.shortAddress,
    mapUrl: branch.mapUrl,
  })

  return {
    ...branch,
    menuCount: 0,
  }
}

export async function updateBranchRecord(branchId: string, values: BranchFormValues) {
  if (!(await getBranchById(branchId))) {
    throw notFound("Şube bulunamadı.")
  }

  if (await isBranchSlugTaken(values.slug, branchId)) {
    throw conflict("Bu şube slug'i zaten kullanımda.")
  }

  const branch = await updateBranch(branchId, values)

  if (!branch) {
    throw notFound("Şube bulunamadı.")
  }

  await upsertHomeBranchCard({
    branchId: branch.id,
    title: branch.name,
    shortAddress: branch.shortAddress,
    mapUrl: branch.mapUrl,
  })

  return {
    ...branch,
    menuCount: await getMenuCountByBranchId(branch.id),
  }
}

export async function deleteBranchCascade(branchId: string) {
  const branch = await getBranchById(branchId)

  if (!branch) {
    throw notFound("Şube bulunamadı.")
  }

  for (const menu of await getMenusByBranchId(branchId)) {
    await deleteMenuCascade(menu.id)
  }

  await deleteQrDesignsByBranchId(branchId)
  await removeHomeBranchCard(branchId)

  const deleted = await deleteBranch(branchId)

  if (!deleted) {
    throw badRequest("Şube silinemedi.")
  }

  return { id: branchId }
}

export async function toggleBranchRecord(branchId: string) {
  const branch = await toggleBranchStatus(branchId)

  if (!branch) {
    throw notFound("Şube bulunamadı.")
  }

  return {
    ...branch,
    menuCount: await getMenuCountByBranchId(branch.id),
  }
}

export async function getBranchName(branchId: string) {
  return getBranchNameById(branchId)
}

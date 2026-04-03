import {
  createMenu,
  deleteMenu,
  getMenuById,
  getMenuDetail,
  getMenuManagementData,
  getMenuName,
  getMenuRelationCountByBranchId,
  isBranchValid,
  isMenuNameTaken,
  isMenuSlugTaken,
  toggleMenuStatus,
  updateMenu,
} from "@/data/menu-management-store"
import { getBranchNameById } from "@/data/branches-store"
import {
  createMenuOption,
  deleteCategoriesByMenuId,
  deleteMenuOption,
  getCategoriesByMenuId,
  updateMenuOption,
} from "@/data/catalog-store"
import { deleteQrDesignsByMenuId } from "@/data/qr-design-store"
import { badRequest, conflict, notFound } from "@/lib/api-response"
import type { MenuFormValues } from "@/types/menu-management"

export async function listMenus() {
  return getMenuManagementData()
}

export async function getMenuRecord(menuId: string) {
  const menu = await getMenuDetail(menuId)

  if (!menu) {
    throw notFound("Menü bulunamadı.")
  }

  return menu
}

export async function createMenuRecord(values: MenuFormValues) {
  if (!(await isBranchValid(values.branchId))) {
    throw badRequest("Seçilen şube bulunamadı.")
  }

  if (await isMenuNameTaken(values.name)) {
    throw conflict("Bu isimde bir menü zaten bulunuyor.")
  }

  if (await isMenuSlugTaken(values.slug)) {
    throw conflict("Bu menüye ait bağlantı kısa adı zaten kullanımda.")
  }

  const menu = await createMenu(values)

  await createMenuOption({
    id: menu.id,
    name: menu.name,
    branchName: await getBranchNameById(menu.branchId),
  })

  return menu
}

export async function updateMenuRecord(menuId: string, values: MenuFormValues) {
  if (!(await isBranchValid(values.branchId))) {
    throw badRequest("Seçilen şube bulunamadı.")
  }

  if (await isMenuNameTaken(values.name, menuId)) {
    throw conflict("Bu isimde bir menü zaten bulunuyor.")
  }

  if (await isMenuSlugTaken(values.slug, menuId)) {
    throw conflict("Bu menüye ait bağlantı kısa adı zaten kullanımda.")
  }

  const menu = await updateMenu(menuId, values)

  if (!menu) {
    throw notFound("Menü bulunamadı.")
  }

  await updateMenuOption(menu.id, {
    name: menu.name,
    branchName: await getBranchNameById(menu.branchId),
  })

  return menu
}

export async function deleteMenuCascade(menuId: string) {
  const menu = await getMenuById(menuId)

  if (!menu) {
    throw notFound("Menü bulunamadı.")
  }

  await deleteCategoriesByMenuId(menuId)
  await deleteMenuOption(menuId)
  await deleteQrDesignsByMenuId(menuId)

  const deleted = await deleteMenu(menuId)

  if (!deleted) {
    throw badRequest("Menü silinemedi.")
  }

  return { id: menuId }
}

export async function toggleMenuRecord(menuId: string) {
  const menu = await toggleMenuStatus(menuId)

  if (!menu) {
    throw notFound("Menü bulunamadı.")
  }

  return menu
}

export async function getMenuCountByBranchId(branchId: string) {
  return getMenuRelationCountByBranchId(branchId)
}

export async function resolveMenuName(menuId: string) {
  return getMenuName(menuId)
}

export async function getMenuCategoryCount(menuId: string) {
  return (await getCategoriesByMenuId(menuId)).length
}

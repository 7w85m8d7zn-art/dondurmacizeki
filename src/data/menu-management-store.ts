import "server-only"

import { slugify } from "@/lib/slugify"
import {
  getSupabaseAdminClient,
  throwIfSupabaseError,
} from "@/lib/supabase-data"
import type {
  MenuDetail,
  MenuFormValues,
  MenuManagementData,
  MenuManagementItem,
} from "@/types/menu-management"

type BranchRow = {
  id: string
  name: string
  shortAddress: string
  isActive: boolean
  sortOrder: number
}

type MenuRow = {
  id: string
  name: string
  description: string | null
  coverImageUrl: string
  slug: string
  isActive: boolean
  sortOrder: number
  updatedAt: string
}

type BranchMenuRow = {
  id: string
  branchId: string
  menuId: string
  isDefault: boolean
  isActive: boolean
  sortOrder: number
}

type CategoryRow = {
  id: string
  menuId: string
  name: string
  description: string | null
  sortOrder: number
}

type ProductRow = {
  id: string
  categoryId: string
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR")
}

async function fetchMenus(menuIds?: string[]) {
  const supabase = getSupabaseAdminClient()

  let query = supabase.from("Menu").select("*").order("sortOrder", { ascending: true })

  if (menuIds) {
    if (!menuIds.length) {
      return [] as MenuRow[]
    }

    query = query.in("id", menuIds)
  }

  const { data, error } = await query
  throwIfSupabaseError(error, "Menü listesi alınamadı")

  return (data ?? []) as MenuRow[]
}

async function fetchBranchMenus(menuIds?: string[]) {
  const supabase = getSupabaseAdminClient()

  let query = supabase
    .from("BranchMenu")
    .select("*")
    .order("sortOrder", { ascending: true })

  if (menuIds) {
    if (!menuIds.length) {
      return [] as BranchMenuRow[]
    }

    query = query.in("menuId", menuIds)
  }

  const { data, error } = await query
  throwIfSupabaseError(error, "Şube-menü ilişkileri alınamadı")

  return (data ?? []) as BranchMenuRow[]
}

async function fetchCategories(menuIds?: string[]) {
  const supabase = getSupabaseAdminClient()

  let query = supabase
    .from("Category")
    .select("id,menuId,name,description,sortOrder")
    .order("sortOrder", { ascending: true })

  if (menuIds) {
    if (!menuIds.length) {
      return [] as CategoryRow[]
    }

    query = query.in("menuId", menuIds)
  }

  const { data, error } = await query
  throwIfSupabaseError(error, "Kategori listesi alınamadı")

  return (data ?? []) as CategoryRow[]
}

async function fetchProducts(categoryIds?: string[]) {
  const supabase = getSupabaseAdminClient()

  let query = supabase.from("Product").select("id,categoryId")

  if (categoryIds) {
    if (!categoryIds.length) {
      return [] as ProductRow[]
    }

    query = query.in("categoryId", categoryIds)
  }

  const { data, error } = await query
  throwIfSupabaseError(error, "Ürün listesi alınamadı")

  return (data ?? []) as ProductRow[]
}

async function fetchBranches(branchIds?: string[]) {
  const supabase = getSupabaseAdminClient()

  let query = supabase
    .from("Branch")
    .select("id,name,shortAddress,isActive,sortOrder")
    .order("sortOrder", { ascending: true })

  if (branchIds) {
    if (!branchIds.length) {
      return [] as BranchRow[]
    }

    query = query.in("id", branchIds)
  }

  const { data, error } = await query
  throwIfSupabaseError(error, "Şube listesi alınamadı")

  return (data ?? []) as BranchRow[]
}

function mapMenuRecord(menu: {
  id: string
  name: string
  description: string | null
  coverImageUrl: string
  slug: string
  isActive: boolean
  sortOrder: number
  updatedAt: string
  branchMenus: Array<{
    branchId: string
    branch: {
      name: string
    }
  }>
  categories: Array<{
    _count: {
      products: number
    }
  }>
}): MenuManagementItem {
  const branchRelation = menu.branchMenus[0]
  const productCount = menu.categories.reduce(
    (total, category) => total + category._count.products,
    0,
  )

  return {
    id: menu.id,
    name: menu.name,
    description: menu.description ?? "",
    coverImageUrl: menu.coverImageUrl,
    slug: menu.slug,
    branchId: branchRelation?.branchId ?? "",
    branchName: branchRelation?.branch.name ?? "Şube bulunamadı",
    status: menu.isActive ? "active" : "passive",
    sortOrder: menu.sortOrder,
    categoryCount: menu.categories.length,
    productCount,
    updatedAt: new Date(menu.updatedAt).toISOString(),
  }
}

async function buildMenuItems(menuIds?: string[]) {
  const menus = await fetchMenus(menuIds)
  const ids = menus.map((menu) => menu.id)

  const [branchMenus, categories] = await Promise.all([
    fetchBranchMenus(ids),
    fetchCategories(ids),
  ])

  const [branches, products] = await Promise.all([
    fetchBranches([...new Set(branchMenus.map((item) => item.branchId))]),
    fetchProducts(categories.map((category) => category.id)),
  ])

  const branchById = new Map(branches.map((branch) => [branch.id, branch]))
  const productCountByCategoryId = new Map<string, number>()
  const branchMenusByMenuId = new Map<string, BranchMenuRow[]>()
  const categoriesByMenuId = new Map<string, CategoryRow[]>()

  for (const product of products) {
    productCountByCategoryId.set(
      product.categoryId,
      (productCountByCategoryId.get(product.categoryId) ?? 0) + 1,
    )
  }

  for (const relation of branchMenus) {
    const current = branchMenusByMenuId.get(relation.menuId) ?? []
    current.push(relation)
    branchMenusByMenuId.set(relation.menuId, current)
  }

  for (const category of categories) {
    const current = categoriesByMenuId.get(category.menuId) ?? []
    current.push(category)
    categoriesByMenuId.set(category.menuId, current)
  }

  return menus.map((menu) => {
    const menuBranchMenus = (branchMenusByMenuId.get(menu.id) ?? [])
      .sort((first, second) => first.sortOrder - second.sortOrder)
      .map((branchMenu) => ({
        branchId: branchMenu.branchId,
        branch: {
          name: branchById.get(branchMenu.branchId)?.name ?? "Şube bulunamadı",
        },
      }))

    const menuCategories = (categoriesByMenuId.get(menu.id) ?? [])
      .map((category) => ({
        _count: {
          products: productCountByCategoryId.get(category.id) ?? 0,
        },
      }))

    return mapMenuRecord({
      ...menu,
      branchMenus: menuBranchMenus,
      categories: menuCategories,
    })
  })
}

export async function getMenuManagementData(): Promise<MenuManagementData> {
  const [branches, menus] = await Promise.all([
    fetchBranches(),
    buildMenuItems(),
  ])

  return {
    branches: branches
      .filter((branch) => branch.isActive)
      .map((branch) => ({
        id: branch.id,
        name: branch.name,
        shortAddress: branch.shortAddress,
      })),
    menus,
  }
}

export async function getMenuDetail(menuId: string): Promise<MenuDetail | null> {
  const menuItems = await buildMenuItems([menuId])
  const menu = menuItems[0]

  if (!menu) {
    return null
  }

  const categories = await fetchCategories([menuId])
  const products = await fetchProducts(categories.map((category) => category.id))

  const productCountByCategoryId = new Map<string, number>()

  for (const product of products) {
    productCountByCategoryId.set(
      product.categoryId,
      (productCountByCategoryId.get(product.categoryId) ?? 0) + 1,
    )
  }

  return {
    ...menu,
    categories: categories
      .sort((first, second) => first.sortOrder - second.sortOrder)
      .map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description ?? "",
        productCount: productCountByCategoryId.get(category.id) ?? 0,
        sortOrder: category.sortOrder,
      })),
  }
}

export async function createMenu(values: MenuFormValues) {
  const supabase = getSupabaseAdminClient()

  const { data: menu, error: menuError } = await supabase
    .from("Menu")
    .insert({
      name: values.name,
      description: values.description,
      coverImageUrl: values.coverImageUrl,
      slug: slugify(values.slug),
      isActive: values.status === "active",
      sortOrder: values.sortOrder,
    })
    .select("*")
    .single()

  throwIfSupabaseError(menuError, "Menü oluşturulamadı")

  const { error: relationError } = await supabase.from("BranchMenu").insert({
    branchId: values.branchId,
    menuId: menu.id,
    isDefault: true,
    isActive: values.status === "active",
    sortOrder: values.sortOrder,
  })

  throwIfSupabaseError(relationError, "Menü-şube ilişkisi oluşturulamadı")

  const created = await getMenuById(menu.id)

  if (!created) {
    throw new Error("Oluşturulan menü alınamadı")
  }

  return created
}

export async function updateMenu(menuId: string, values: MenuFormValues) {
  const supabase = getSupabaseAdminClient()

  const { data: existing, error: existingError } = await supabase
    .from("Menu")
    .select("id")
    .eq("id", menuId)
    .maybeSingle()

  if (existingError || !existing) {
    return null
  }

  const { error: menuError } = await supabase
    .from("Menu")
    .update({
      name: values.name,
      description: values.description,
      coverImageUrl: values.coverImageUrl,
      slug: slugify(values.slug),
      isActive: values.status === "active",
      sortOrder: values.sortOrder,
    })
    .eq("id", menuId)

  if (menuError) {
    return null
  }

  const { data: currentRelation } = await supabase
    .from("BranchMenu")
    .select("id")
    .eq("menuId", menuId)
    .order("sortOrder", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (currentRelation?.id) {
    const { error: relationUpdateError } = await supabase
      .from("BranchMenu")
      .update({
        branchId: values.branchId,
        isActive: values.status === "active",
        isDefault: true,
        sortOrder: values.sortOrder,
      })
      .eq("id", currentRelation.id)

    if (relationUpdateError) {
      return null
    }
  } else {
    const { error: relationCreateError } = await supabase.from("BranchMenu").insert({
      branchId: values.branchId,
      menuId,
      isActive: values.status === "active",
      isDefault: true,
      sortOrder: values.sortOrder,
    })

    if (relationCreateError) {
      return null
    }
  }

  return getMenuById(menuId)
}

export async function deleteMenu(menuId: string) {
  const supabase = getSupabaseAdminClient()

  const { data: existing, error: existingError } = await supabase
    .from("Menu")
    .select("id")
    .eq("id", menuId)
    .maybeSingle()

  if (existingError || !existing) {
    return false
  }

  const { error } = await supabase.from("Menu").delete().eq("id", menuId)
  return !error
}

export async function toggleMenuStatus(menuId: string) {
  const supabase = getSupabaseAdminClient()

  const { data: existing, error: existingError } = await supabase
    .from("Menu")
    .select("id,isActive")
    .eq("id", menuId)
    .maybeSingle()

  if (existingError || !existing) {
    return null
  }

  const nextActive = !existing.isActive

  const { error: menuError } = await supabase
    .from("Menu")
    .update({ isActive: nextActive })
    .eq("id", menuId)

  if (menuError) {
    return null
  }

  await supabase
    .from("BranchMenu")
    .update({ isActive: nextActive })
    .eq("menuId", menuId)

  return getMenuById(menuId)
}

export async function isMenuSlugTaken(slug: string, excludedMenuId?: string) {
  const supabase = getSupabaseAdminClient()

  let query = supabase.from("Menu").select("id").eq("slug", slugify(slug))

  if (excludedMenuId) {
    query = query.neq("id", excludedMenuId)
  }

  const { data, error } = await query.limit(1).maybeSingle()

  if (error) {
    return false
  }

  return Boolean(data)
}

export async function isMenuNameTaken(name: string, excludedMenuId?: string) {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase.from("Menu").select("id,name")

  if (error) {
    return false
  }

  const normalized = normalizeName(name)

  return (data ?? []).some(
    (menu) => normalizeName(menu.name) === normalized && menu.id !== excludedMenuId,
  )
}

export async function isBranchValid(branchId: string) {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("Branch")
    .select("id")
    .eq("id", branchId)
    .maybeSingle()

  if (error) {
    return false
  }

  return Boolean(data)
}

export async function getMenuById(menuId: string) {
  const menu = (await buildMenuItems([menuId]))[0]
  return menu ?? null
}

export async function getMenusByBranchId(branchId: string) {
  const supabase = getSupabaseAdminClient()

  const { data: relations, error } = await supabase
    .from("BranchMenu")
    .select("menuId")
    .eq("branchId", branchId)

  if (error) {
    return []
  }

  const menuIds = [...new Set((relations ?? []).map((item) => item.menuId))]
  return buildMenuItems(menuIds)
}

export async function getMenuRelationCountByBranchId(branchId: string) {
  const supabase = getSupabaseAdminClient()
  const { count, error } = await supabase
    .from("BranchMenu")
    .select("id", { count: "exact", head: true })
    .eq("branchId", branchId)

  if (error) {
    return 0
  }

  return count ?? 0
}

export async function getMenuName(menuId: string) {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("Menu")
    .select("name")
    .eq("id", menuId)
    .maybeSingle()

  if (error) {
    return "Menü bulunamadı"
  }

  return data?.name ?? "Menü bulunamadı"
}

import "server-only"

import {
  getSupabaseAdminClient,
  throwIfSupabaseError,
  toNumberValue,
} from "@/lib/supabase-data"
import type {
  CatalogManagementData,
  CategoryFormValues,
  CategoryManagementItem,
  CategoryOption,
  MenuOption,
  ProductFormValues,
  ProductManagementItem,
} from "@/types/catalog-management"

type MenuRow = {
  id: string
  name: string
}

type BranchRow = {
  id: string
  name: string
}

type BranchMenuRow = {
  branchId: string
  menuId: string
  sortOrder: number
}

type CategoryRow = {
  id: string
  name: string
  description: string | null
  sortOrder: number
  isActive: boolean
  menuId: string
}

type ProductRow = {
  id: string
  name: string
  description: string | null
  price: string | number
  imageUrl: string
  isActive: boolean
  sortOrder: number
  categoryId: string
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR")
}

function mapMenuOption(menu: {
  id: string
  name: string
  branchMenus: Array<{
    branch: {
      name: string
    }
  }>
}): MenuOption {
  return {
    id: menu.id,
    name: menu.name,
    branchName: menu.branchMenus[0]?.branch.name ?? "Sube bulunamadi",
  }
}

function mapCategory(category: {
  id: string
  name: string
  description: string | null
  sortOrder: number
  isActive: boolean
  menuId: string
  menu: {
    name: string
  }
  _count: {
    products: number
  }
}): CategoryManagementItem {
  return {
    id: category.id,
    name: category.name,
    description: category.description ?? "",
    sortOrder: category.sortOrder,
    status: category.isActive ? "active" : "passive",
    menuId: category.menuId,
    menuName: category.menu.name,
    productCount: category._count.products,
  }
}

function mapProduct(product: {
  id: string
  name: string
  description: string | null
  price: string | number
  imageUrl: string
  isActive: boolean
  sortOrder: number
  categoryId: string
  category: {
    name: string
    menuId: string
    menu: {
      name: string
    }
  }
}): ProductManagementItem {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    price: toNumberValue(product.price),
    imageUrl: product.imageUrl,
    status: product.isActive ? "active" : "passive",
    sortOrder: product.sortOrder,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    menuId: product.category.menuId,
    menuName: product.category.menu.name,
  }
}

async function fetchMenus() {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("Menu")
    .select("id,name")
    .order("sortOrder", { ascending: true })

  throwIfSupabaseError(error, "Menu listesi alinamadi")
  return (data ?? []) as MenuRow[]
}

async function fetchBranches(branchIds?: string[]) {
  const supabase = getSupabaseAdminClient()

  let query = supabase.from("Branch").select("id,name")

  if (branchIds) {
    if (!branchIds.length) {
      return [] as BranchRow[]
    }

    query = query.in("id", branchIds)
  }

  const { data, error } = await query
  throwIfSupabaseError(error, "Sube listesi alinamadi")

  return (data ?? []) as BranchRow[]
}

async function fetchBranchMenus(menuIds?: string[]) {
  const supabase = getSupabaseAdminClient()

  let query = supabase
    .from("BranchMenu")
    .select("branchId,menuId,sortOrder")
    .order("sortOrder", { ascending: true })

  if (menuIds) {
    if (!menuIds.length) {
      return [] as BranchMenuRow[]
    }

    query = query.in("menuId", menuIds)
  }

  const { data, error } = await query
  throwIfSupabaseError(error, "Menu-sube iliskileri alinamadi")

  return (data ?? []) as BranchMenuRow[]
}

async function fetchCategories(menuIds?: string[]) {
  const supabase = getSupabaseAdminClient()

  let query = supabase
    .from("Category")
    .select("id,name,description,sortOrder,isActive,menuId")
    .order("sortOrder", { ascending: true })

  if (menuIds) {
    if (!menuIds.length) {
      return [] as CategoryRow[]
    }

    query = query.in("menuId", menuIds)
  }

  const { data, error } = await query
  throwIfSupabaseError(error, "Kategori listesi alinamadi")

  return (data ?? []) as CategoryRow[]
}

async function fetchProducts(categoryIds?: string[]) {
  const supabase = getSupabaseAdminClient()

  let query = supabase
    .from("Product")
    .select("id,name,description,price,imageUrl,isActive,sortOrder,categoryId")
    .order("sortOrder", { ascending: true })

  if (categoryIds) {
    if (!categoryIds.length) {
      return [] as ProductRow[]
    }

    query = query.in("categoryId", categoryIds)
  }

  const { data, error } = await query
  throwIfSupabaseError(error, "Urun listesi alinamadi")

  return (data ?? []) as ProductRow[]
}

async function getCategoryOptions(): Promise<CategoryOption[]> {
  const [categories, menus] = await Promise.all([fetchCategories(), fetchMenus()])
  const menuById = new Map(menus.map((menu) => [menu.id, menu]))

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    menuId: category.menuId,
    menuName: menuById.get(category.menuId)?.name ?? "Menu bulunamadi",
  }))
}

export async function getCatalogManagementData(): Promise<CatalogManagementData> {
  const [menus, branchMenus, categories, products] = await Promise.all([
    fetchMenus(),
    fetchBranchMenus(),
    fetchCategories(),
    fetchProducts(),
  ])

  const [branches, categoryOptions] = await Promise.all([
    fetchBranches([...new Set(branchMenus.map((item) => item.branchId))]),
    getCategoryOptions(),
  ])

  const branchById = new Map(branches.map((branch) => [branch.id, branch]))
  const menuById = new Map(menus.map((menu) => [menu.id, menu]))
  const categoryById = new Map(categories.map((category) => [category.id, category]))

  const productCountByCategoryId = new Map<string, number>()

  for (const product of products) {
    productCountByCategoryId.set(
      product.categoryId,
      (productCountByCategoryId.get(product.categoryId) ?? 0) + 1,
    )
  }

  return {
    menus: menus.map((menu) => {
      const branchRelation = branchMenus
        .filter((item) => item.menuId === menu.id)
        .sort((first, second) => first.sortOrder - second.sortOrder)[0]

      return mapMenuOption({
        id: menu.id,
        name: menu.name,
        branchMenus: [
          {
            branch: {
              name: branchById.get(branchRelation?.branchId ?? "")?.name ?? "Sube bulunamadi",
            },
          },
        ],
      })
    }),
    categories: categories.map((category) =>
      mapCategory({
        ...category,
        menu: {
          name: menuById.get(category.menuId)?.name ?? "Menu bulunamadi",
        },
        _count: {
          products: productCountByCategoryId.get(category.id) ?? 0,
        },
      }),
    ),
    categoryOptions,
    products: products.map((product) => {
      const category = categoryById.get(product.categoryId)
      const menu = category ? menuById.get(category.menuId) : null

      return mapProduct({
        ...product,
        category: {
          name: category?.name ?? "Kategori bulunamadi",
          menuId: category?.menuId ?? "",
          menu: {
            name: menu?.name ?? "Menu bulunamadi",
          },
        },
      })
    }),
  }
}

export async function createCategory(values: CategoryFormValues) {
  const supabase = getSupabaseAdminClient()

  const { data: category, error } = await supabase
    .from("Category")
    .insert({
      menuId: values.menuId,
      name: values.name,
      slug: values.name,
      description: values.description,
      sortOrder: values.sortOrder,
      isActive: values.status === "active",
    })
    .select("id,name,description,sortOrder,isActive,menuId")
    .single()

  throwIfSupabaseError(error, "Kategori olusturulamadi")
  if (!category) {
    throw new Error("Kategori olusturulamadi")
  }

  const { data: menu } = await supabase
    .from("Menu")
    .select("name")
    .eq("id", category.menuId)
    .maybeSingle()

  return mapCategory({
    ...(category as CategoryRow),
    menu: {
      name: menu?.name ?? "Menu bulunamadi",
    },
    _count: {
      products: 0,
    },
  })
}

export async function updateCategory(categoryId: string, values: CategoryFormValues) {
  const supabase = getSupabaseAdminClient()

  const { data: category, error } = await supabase
    .from("Category")
    .update({
      menuId: values.menuId,
      name: values.name,
      slug: values.name,
      description: values.description,
      sortOrder: values.sortOrder,
      isActive: values.status === "active",
    })
    .eq("id", categoryId)
    .select("id,name,description,sortOrder,isActive,menuId")
    .maybeSingle()

  if (error || !category) {
    return null
  }

  const [{ data: menu }, { count: productCount }] = await Promise.all([
    supabase.from("Menu").select("name").eq("id", category.menuId).maybeSingle(),
    supabase
      .from("Product")
      .select("id", { count: "exact", head: true })
      .eq("categoryId", category.id),
  ])

  return mapCategory({
    ...(category as CategoryRow),
    menu: {
      name: menu?.name ?? "Menu bulunamadi",
    },
    _count: {
      products: productCount ?? 0,
    },
  })
}

export async function deleteCategory(categoryId: string) {
  const supabase = getSupabaseAdminClient()
  const { error } = await supabase.from("Category").delete().eq("id", categoryId)
  return !error
}

export async function deleteCategoriesByMenuId(menuId: string) {
  const supabase = getSupabaseAdminClient()
  await supabase.from("Category").delete().eq("menuId", menuId)
}

export async function reorderCategories(orderedIds: string[]) {
  const supabase = getSupabaseAdminClient()

  for (const [index, id] of orderedIds.entries()) {
    await supabase
      .from("Category")
      .update({ sortOrder: index + 1 })
      .eq("id", id)
  }

  return (await getCatalogManagementData()).categories
}

export async function createProduct(values: ProductFormValues) {
  const supabase = getSupabaseAdminClient()

  const { data: product, error } = await supabase
    .from("Product")
    .insert({
      categoryId: values.categoryId,
      name: values.name,
      slug: values.name,
      description: values.description,
      price: values.price,
      imageUrl: values.imageUrl,
      isActive: values.status === "active",
      sortOrder: values.sortOrder,
    })
    .select("id,name,description,price,imageUrl,isActive,sortOrder,categoryId")
    .single()

  throwIfSupabaseError(error, "Urun olusturulamadi")
  if (!product) {
    throw new Error("Urun olusturulamadi")
  }

  const { data: category } = await supabase
    .from("Category")
    .select("id,name,menuId")
    .eq("id", product.categoryId)
    .maybeSingle()

  const { data: menu } = await supabase
    .from("Menu")
    .select("name")
    .eq("id", category?.menuId ?? "")
    .maybeSingle()

  return mapProduct({
    ...(product as ProductRow),
    category: {
      name: category?.name ?? "Kategori bulunamadi",
      menuId: category?.menuId ?? "",
      menu: {
        name: menu?.name ?? "Menu bulunamadi",
      },
    },
  })
}

export async function updateProduct(productId: string, values: ProductFormValues) {
  const supabase = getSupabaseAdminClient()

  const { data: product, error } = await supabase
    .from("Product")
    .update({
      categoryId: values.categoryId,
      name: values.name,
      slug: values.name,
      description: values.description,
      price: values.price,
      imageUrl: values.imageUrl,
      isActive: values.status === "active",
      sortOrder: values.sortOrder,
    })
    .eq("id", productId)
    .select("id,name,description,price,imageUrl,isActive,sortOrder,categoryId")
    .maybeSingle()

  if (error || !product) {
    return null
  }

  const { data: category } = await supabase
    .from("Category")
    .select("id,name,menuId")
    .eq("id", product.categoryId)
    .maybeSingle()

  const { data: menu } = await supabase
    .from("Menu")
    .select("name")
    .eq("id", category?.menuId ?? "")
    .maybeSingle()

  return mapProduct({
    ...(product as ProductRow),
    category: {
      name: category?.name ?? "Kategori bulunamadi",
      menuId: category?.menuId ?? "",
      menu: {
        name: menu?.name ?? "Menu bulunamadi",
      },
    },
  })
}

export async function deleteProduct(productId: string) {
  const supabase = getSupabaseAdminClient()
  const { error } = await supabase.from("Product").delete().eq("id", productId)
  return !error
}

export async function reorderProducts(orderedIds: string[]) {
  const supabase = getSupabaseAdminClient()

  for (const [index, id] of orderedIds.entries()) {
    await supabase
      .from("Product")
      .update({ sortOrder: index + 1 })
      .eq("id", id)
  }

  return (await getCatalogManagementData()).products
}

export async function getCategoriesByMenuId(menuId: string) {
  const [categories, products, menuResult] = await Promise.all([
    fetchCategories([menuId]),
    fetchProducts(),
    getSupabaseAdminClient().from("Menu").select("name").eq("id", menuId).maybeSingle(),
  ])

  const productCountByCategoryId = new Map<string, number>()

  for (const product of products) {
    productCountByCategoryId.set(
      product.categoryId,
      (productCountByCategoryId.get(product.categoryId) ?? 0) + 1,
    )
  }

  return categories
    .sort((first, second) => first.sortOrder - second.sortOrder)
    .map((category) =>
      mapCategory({
        ...category,
        menu: {
          name: menuResult.data?.name ?? "Menu bulunamadi",
        },
        _count: {
          products: productCountByCategoryId.get(category.id) ?? 0,
        },
      }),
    )
}

export async function createMenuOption(_menu: MenuOption) {
  return null
}

export async function updateMenuOption(_menuId: string, _values: Partial<MenuOption>) {
  return null
}

export async function deleteMenuOption(_menuId: string) {
  return null
}

export async function isValidMenuId(menuId: string) {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from("Menu")
    .select("id")
    .eq("id", menuId)
    .maybeSingle()

  if (error) {
    return false
  }

  return Boolean(data)
}

export async function isValidCategoryId(categoryId: string) {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from("Category")
    .select("id")
    .eq("id", categoryId)
    .maybeSingle()

  if (error) {
    return false
  }

  return Boolean(data)
}

export async function isProductNameTaken(
  name: string,
  categoryId: string,
  excludedProductId?: string,
) {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from("Product")
    .select("id,name")
    .eq("categoryId", categoryId)

  if (error) {
    return false
  }

  const normalized = normalizeName(name)

  return (data ?? []).some(
    (product) =>
      normalizeName(product.name) === normalized && product.id !== excludedProductId,
  )
}

import { MenuManagementClient } from "@/components/admin/menu-management-client"
import { getCatalogManagementData } from "@/data/catalog-store"
import { getMenuManagementData } from "@/data/menu-management-store"
import { visitorData } from "@/data/visitor-data"
import { shouldUseSupabaseFallback } from "@/lib/supabase-data"
import type { CatalogManagementData } from "@/types/catalog-management"
import type { MenuManagementData } from "@/types/menu-management"

function buildFallbackMenuState(): {
  data: MenuManagementData
  catalog: CatalogManagementData
} {
  const branches = visitorData.branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    shortAddress: branch.shortAddress,
  }))

  const now = new Date().toISOString()
  const seenMenuIds = new Set<string>()

  const menus = visitorData.branches
    .map((branch) => ({
      branchId: branch.id,
      branchName: branch.name,
      menu: branch.menu,
    }))
    .filter(({ menu }) => {
      if (seenMenuIds.has(menu.id)) {
        return false
      }

      seenMenuIds.add(menu.id)
      return true
    })
    .map(({ branchId, branchName, menu }, index) => {
      const productCount = menu.categories.reduce(
        (total, category) => total + category.products.length,
        0,
      )

      return {
        id: menu.id,
        name: menu.name,
        description: menu.description,
        coverImageUrl:
          menu.categories[0]?.products[0]?.imageUrl ??
          "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=1200&q=80",
        slug: menu.name,
        branchId,
        branchName,
        status: "active" as const,
        sortOrder: index + 1,
        categoryCount: menu.categories.length,
        productCount,
        updatedAt: now,
      }
    })

  const menuOptions = menus.map((menu) => ({
    id: menu.id,
    name: menu.name,
    branchName: menu.branchName,
  }))

  const categories = menus.flatMap((menu) =>
    visitorData.branches
      .find((branch) => branch.menu.id === menu.id)
      ?.menu.categories.map((category, categoryIndex) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        sortOrder: categoryIndex + 1,
        status: "active" as const,
        menuId: menu.id,
        menuName: menu.name,
        productCount: category.products.length,
      })) ?? [],
  )

  const categoryOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
    menuId: category.menuId,
    menuName: category.menuName,
  }))

  const products = categories.flatMap((category) => {
    const matchedCategory = visitorData.branches
      .find((branch) => branch.menu.id === category.menuId)
      ?.menu.categories.find((item) => item.id === category.id)

    return (
      matchedCategory?.products.map((product, productIndex) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        status: product.isActive ? ("active" as const) : ("passive" as const),
        sortOrder: productIndex + 1,
        categoryId: category.id,
        categoryName: category.name,
        menuId: category.menuId,
        menuName: category.menuName,
      })) ?? []
    )
  })

  return {
    data: {
      branches,
      menus,
    },
    catalog: {
      menus: menuOptions,
      categories,
      categoryOptions,
      products,
    },
  }
}

export default async function MenuManagementPage() {
  const { data, catalog } = await getMenuManagementState()

  return <MenuManagementClient initialData={data} initialCatalog={catalog} />
}

async function getMenuManagementState(): Promise<{
  data: MenuManagementData
  catalog: CatalogManagementData
}> {
  try {
    const [data, catalog] = await Promise.all([
      getMenuManagementData(),
      getCatalogManagementData(),
    ])

    return { data, catalog }
  } catch (error) {
    if (!shouldUseSupabaseFallback(error)) {
      throw error
    }

    console.warn(
      "Supabase baglantisi/table cache hazir degil, menuler sayfasi fallback veri ile aciliyor.",
    )

    const fallback = buildFallbackMenuState()

    return fallback
  }
}

export const dynamic = "force-dynamic"

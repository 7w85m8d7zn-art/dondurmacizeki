import { MenuCatalog } from "@/components/visitor/menu-catalog"
import { getCatalogManagementData } from "@/data/catalog-store"
import { visitorData } from "@/data/visitor-data"
import { shouldUseSupabaseFallback } from "@/lib/supabase-data"
import type { Menu } from "@/types/menu"

function getFallbackMenus(): Menu[] {
  const seenMenuIds = new Set<string>()

  return visitorData.branches
    .map((branch) => branch.menu)
    .filter((menu) => {
      if (seenMenuIds.has(menu.id)) {
        return false
      }

      seenMenuIds.add(menu.id)
      return true
    })
}

export default async function MenuListesiPage() {
  let menus: Menu[]

  try {
    const catalogData = await getCatalogManagementData()
    const activeCategoryByMenuId = new Map<string, typeof catalogData.categories>()
    const activeProductsByCategoryId = new Map<string, typeof catalogData.products>()

    for (const category of catalogData.categories) {
      if (category.status !== "active") {
        continue
      }

      const current = activeCategoryByMenuId.get(category.menuId) ?? []
      current.push(category)
      activeCategoryByMenuId.set(category.menuId, current)
    }

    for (const product of catalogData.products) {
      if (product.status !== "active") {
        continue
      }

      const current = activeProductsByCategoryId.get(product.categoryId) ?? []
      current.push(product)
      activeProductsByCategoryId.set(product.categoryId, current)
    }

    menus = catalogData.menus
      .filter((menu) => menu.status === "active")
      .sort(
        (first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0),
      )
      .map((menu) => ({
        id: menu.id,
        name: menu.name,
        description: menu.description ?? "",
        categories: (activeCategoryByMenuId.get(menu.id) ?? [])
          .sort((first, second) => first.sortOrder - second.sortOrder)
          .map((category) => ({
            id: category.id,
            name: category.name,
            description: category.description,
            products: (activeProductsByCategoryId.get(category.id) ?? [])
              .sort((first, second) => first.sortOrder - second.sortOrder)
              .map((product) => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                imageUrl: product.imageUrl,
                isActive: product.status === "active",
              })),
          })),
      }))
  } catch (error) {
    if (!shouldUseSupabaseFallback(error)) {
      throw error
    }

    console.warn(
      "Database baglantisi kurulamadi, menu listesi fallback veriden gosteriliyor.",
    )

    menus = getFallbackMenus()
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-x-clip px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="space-y-5">
        <MenuCatalog menus={menus} />
      </section>
    </main>
  )
}

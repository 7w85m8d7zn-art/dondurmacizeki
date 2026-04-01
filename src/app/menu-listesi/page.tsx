import { MenuCatalog } from "@/components/visitor/menu-catalog"
import { getCatalogManagementData } from "@/data/catalog-store"
import { getMenuManagementData } from "@/data/menu-management-store"
import { visitorData } from "@/data/visitor-data"
import { shouldUseSupabaseFallback } from "@/lib/supabase-data"
import type { Menu } from "@/types/menu"

export const dynamic = "force-dynamic"

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
    const [menuData, catalogData] = await Promise.all([
      getMenuManagementData(),
      getCatalogManagementData(),
    ])

    menus = menuData.menus
      .filter((menu) => menu.status === "active")
      .sort((first, second) => first.sortOrder - second.sortOrder)
      .map((menu) => ({
        id: menu.id,
        name: menu.name,
        description: menu.description,
        categories: catalogData.categories
          .filter(
            (category) =>
              category.menuId === menu.id && category.status === "active",
          )
          .sort((first, second) => first.sortOrder - second.sortOrder)
          .map((category) => ({
            id: category.id,
            name: category.name,
            description: category.description,
            products: catalogData.products
              .filter(
                (product) =>
                  product.menuId === menu.id &&
                  product.categoryId === category.id &&
                  product.status === "active",
              )
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

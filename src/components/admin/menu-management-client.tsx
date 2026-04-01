"use client"

import { startTransition, useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Power,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { CategoryFormPanel } from "@/components/admin/category-form-panel"
import { MenuFormPanel } from "@/components/admin/menu-form-panel"
import { ProductFormPanel } from "@/components/admin/product-form-panel"
import { AppImage } from "@/components/ui/app-image"
import type { ApiErrorResponse, ApiSuccessResponse } from "@/lib/api-response"
import { cn } from "@/lib/utils"
import type {
  CatalogManagementData,
  CategoryFormValues,
  CategoryManagementItem,
  ProductFormValues,
  ProductManagementItem,
} from "@/types/catalog-management"
import type {
  MenuFormValues,
  MenuManagementData,
  MenuManagementItem,
} from "@/types/menu-management"

interface MenuManagementClientProps {
  initialData: MenuManagementData
  initialCatalog: CatalogManagementData
}

type MenuConfirmAction =
  | { type: "delete"; menu: MenuManagementItem }
  | { type: "deactivate"; menu: MenuManagementItem }

type ProductConfirmAction = {
  type: "delete"
  product: ProductManagementItem
}

function normalizeMenuData(data?: Partial<MenuManagementData> | null): MenuManagementData {
  return {
    branches: data?.branches ?? [],
    menus: data?.menus ?? [],
  }
}

function normalizeCatalogData(
  data?: Partial<CatalogManagementData> | null,
): CatalogManagementData {
  return {
    menus: data?.menus ?? [],
    categories: data?.categories ?? [],
    categoryOptions: data?.categoryOptions ?? [],
    products: data?.products ?? [],
  }
}

export function MenuManagementClient({
  initialData,
  initialCatalog,
}: MenuManagementClientProps) {
  const router = useRouter()
  const [data, setData] = useState<MenuManagementData>(normalizeMenuData(initialData))
  const [catalogState, setCatalogState] = useState<CatalogManagementData>(
    normalizeCatalogData(initialCatalog),
  )
  const [editingMenu, setEditingMenu] = useState<MenuManagementItem | null>(null)
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(
    initialData?.menus?.[0]?.id ?? null,
  )
  const [feedback, setFeedback] = useState<string | null>(null)
  const [menuFormError, setMenuFormError] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<MenuConfirmAction | null>(null)
  const [productConfirmAction, setProductConfirmAction] =
    useState<ProductConfirmAction | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isProductPanelOpen, setIsProductPanelOpen] = useState(false)
  const [editingCategory, setEditingCategory] =
    useState<CategoryManagementItem | null>(null)
  const [editingProduct, setEditingProduct] =
    useState<ProductManagementItem | null>(null)

  const selectedMenu = useMemo(
    () => (data.menus ?? []).find((menu) => menu.id === selectedMenuId) ?? null,
    [data.menus, selectedMenuId],
  )

  const selectedMenuCategories = useMemo(
    () =>
      (catalogState.categories ?? [])
        .filter((category) => category.menuId === selectedMenuId)
        .sort((first, second) => first.sortOrder - second.sortOrder),
    [catalogState.categories, selectedMenuId],
  )

  const selectedMenuProducts = useMemo(
    () =>
      (catalogState.products ?? [])
        .filter((product) => product.menuId === selectedMenuId)
        .sort((first, second) => {
          if (first.categoryName === second.categoryName) {
            return first.sortOrder - second.sortOrder
          }

          return first.categoryName.localeCompare(second.categoryName, "tr")
        }),
    [catalogState.products, selectedMenuId],
  )

  const selectedMenuCategoryOptions = useMemo(
    () =>
      (catalogState.categoryOptions ?? []).filter(
        (category) => category.menuId === selectedMenuId,
      ),
    [catalogState.categoryOptions, selectedMenuId],
  )

  function normalizeName(value: string) {
    return value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .toLocaleLowerCase("tr-TR")
      .trim()
      .replace(/\s+/g, " ")
  }

  function validateMenuConflicts(
    values: Pick<MenuFormValues, "name" | "slug">,
    excludedMenuId?: string,
  ) {
    const normalizedName = normalizeName(values.name)
    const normalizedSlug = values.slug.trim().toLocaleLowerCase("tr-TR")

    const duplicatedName = data.menus.some((menu) => {
      if (menu.id === excludedMenuId) {
        return false
      }

      return normalizeName(menu.name) === normalizedName
    })

    if (duplicatedName) {
      return "Bu isimde bir menü zaten bulunuyor."
    }

    const duplicatedSlug = data.menus.some((menu) => {
      if (menu.id === excludedMenuId) {
        return false
      }

      return menu.slug.trim().toLocaleLowerCase("tr-TR") === normalizedSlug
    })

    if (duplicatedSlug) {
      return "Bu menüye ait bağlantı kısa adı zaten kullanımda."
    }

    return null
  }

  function buildNextMenuDraft() {
    const defaultBranchId = data.branches[0]?.id

    if (!defaultBranchId) {
      return null
    }

    const coverImageUrl =
      data.menus[0]?.coverImageUrl ??
      "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=1200&q=80"

    let index = data.menus.length + 1

    while (true) {
      const name = `Yeni Menü ${index}`
      const slug = `yeni-menu-${index}`
      const error = validateMenuConflicts({ name, slug })

      if (!error) {
        return {
          name,
          description:
            "Yeni menü taslağı. Bu ekran üzerinden kategori ve ürün eklenebilir.",
          coverImageUrl,
          slug,
          branchId: defaultBranchId,
          status: "active" as const,
          sortOrder: data.menus.length + 1,
        } satisfies MenuFormValues
      }

      index += 1
    }
  }

  function replaceMenuInState(updatedMenu: MenuManagementItem) {
    setData((current) => ({
      ...current,
      menus: current.menus
        .map((menu) => (menu.id === updatedMenu.id ? updatedMenu : menu))
        .sort((first, second) => first.sortOrder - second.sortOrder),
    }))
  }

  async function refreshMenus() {
    const response = await fetch("/api/admin/menus", { cache: "no-store" })
    const payload = (await response.json()) as ApiSuccessResponse<MenuManagementData>

    if (!response.ok || !payload.success) {
      throw new Error(payload.message ?? "Menüler yenilenemedi.")
    }

    const nextData = normalizeMenuData(payload.data)
    setData(nextData)

    if (!nextData.menus.some((menu) => menu.id === selectedMenuId)) {
      setSelectedMenuId(nextData.menus[0]?.id ?? null)
    }

    return nextData
  }

  async function refreshCatalog() {
    const response = await fetch("/api/admin/categories", { cache: "no-store" })
    const payload =
      (await response.json()) as ApiSuccessResponse<CatalogManagementData>

    if (!response.ok || !payload.success) {
      throw new Error(payload.message ?? "Menü içeriği yenilenemedi.")
    }

    const nextCatalog = normalizeCatalogData(payload.data)
    setCatalogState(nextCatalog)
    return nextCatalog
  }

  async function refreshAll() {
    const [nextMenus, nextCatalog] = await Promise.all([
      refreshMenus(),
      refreshCatalog(),
    ])

    return {
      menus: nextMenus,
      catalog: nextCatalog,
    }
  }

  async function handleCreate(values: MenuFormValues) {
    setFeedback(null)
    setMenuFormError(null)

    if (!values.branchId) {
      const nextMessage =
        "Menu olusturmak icin once en az bir sube eklemelisin."
      setMenuFormError(nextMessage)
      setFeedback(nextMessage)
      return
    }

    const conflictMessage = validateMenuConflicts(values)

    if (conflictMessage) {
      setMenuFormError(conflictMessage)
      return
    }

    try {
      const response = await fetch("/api/admin/menus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const payload = (await response.json()) as
        | ApiSuccessResponse<MenuManagementItem>
        | ApiErrorResponse

      if (!response.ok || !payload.success) {
        throw new Error(
          "message" in payload ? payload.message : "Menü oluşturulamadı.",
        )
      }

      await refreshAll()
      setSelectedMenuId(payload.data.id)
      setMenuFormError(null)
      setFeedback("Yeni menü başarıyla eklendi.")
      startTransition(() => router.refresh())
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Menü oluşturulamadı."
      setMenuFormError(nextMessage)
      setFeedback(nextMessage)
    }
  }

  async function handleDelete(menuId: string) {
    setFeedback(null)

    try {
      const response = await fetch(`/api/admin/menus/${menuId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Menü silinemedi.")
      }

      if (selectedMenuId === menuId) {
        setEditingCategory(null)
        setEditingProduct(null)
        setIsProductPanelOpen(false)
      }

      await refreshAll()
      setFeedback("Menü silindi.")
      startTransition(() => router.refresh())
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Menü silinemedi.")
    }
  }

  async function handleToggleStatus(menuId: string) {
    setFeedback(null)

    try {
      const response = await fetch(`/api/admin/menus/${menuId}/toggle`, {
        method: "POST",
      })

      const payload = (await response.json()) as
        | ApiSuccessResponse<MenuManagementItem>
        | ApiErrorResponse

      if (!response.ok || !payload.success) {
        throw new Error(
          "message" in payload
            ? payload.message
            : "Menü durumu güncellenemedi.",
        )
      }

      await refreshAll()

      if (selectedMenuId === menuId) {
        setEditingMenu((current) =>
          current?.id === menuId ? { ...current, status: payload.data.status } : current,
        )
      }

      setFeedback("Menü durumu güncellendi.")
      startTransition(() => router.refresh())
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Menü durumu güncellenemedi.",
      )
    }
  }

  async function updateMenuOrder(menu: MenuManagementItem, sortOrder: number) {
    const response = await fetch(`/api/admin/menus/${menu.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: menu.name,
        description: menu.description,
        coverImageUrl: menu.coverImageUrl,
        slug: menu.slug,
        branchId: menu.branchId,
        status: menu.status,
        sortOrder,
      } satisfies MenuFormValues),
    })

    const payload = (await response.json()) as
      | ApiSuccessResponse<MenuManagementItem>
      | ApiErrorResponse

    if (!response.ok || !payload.success) {
      throw new Error(
        "message" in payload ? payload.message : "Menü sırası güncellenemedi.",
      )
    }
  }

  async function handleSwapOrder(menu: MenuManagementItem, direction: "up" | "down") {
    const currentIndex = data.menus.findIndex((item) => item.id === menu.id)
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const targetMenu = data.menus[targetIndex]

    if (!targetMenu) {
      return
    }

    setFeedback(null)

    try {
      await updateMenuOrder(menu, targetMenu.sortOrder)
      await updateMenuOrder(targetMenu, menu.sortOrder)
      await refreshAll()
      setFeedback("Menü sırası güncellendi.")
      startTransition(() => router.refresh())
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Menü sırası güncellenemedi.",
      )
    }
  }

  async function handleUpdateMenu(values: MenuFormValues) {
    if (!editingMenu) {
      return
    }

    setFeedback(null)
    setMenuFormError(null)

    const conflictMessage = validateMenuConflicts(values, editingMenu.id)

    if (conflictMessage) {
      setMenuFormError(conflictMessage)
      return
    }

    try {
      const response = await fetch(`/api/admin/menus/${editingMenu.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const payload = (await response.json()) as
        | ApiSuccessResponse<MenuManagementItem>
        | ApiErrorResponse

      if (!response.ok || !payload.success) {
        throw new Error(
          "message" in payload ? payload.message : "Menü güncellenemedi.",
        )
      }

      replaceMenuInState(payload.data)
      await refreshAll()
      setMenuFormError(null)
      setEditingMenu(payload.data)
      setSelectedMenuId(payload.data.id)
      setIsMenuModalOpen(false)
      setFeedback("Menü güncellendi.")
      startTransition(() => router.refresh())
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Menü güncellenemedi."
      setMenuFormError(nextMessage)
      setFeedback(nextMessage)
    }
  }

  async function handleCreateCategory(values: CategoryFormValues) {
    if (!selectedMenu) {
      return
    }

    setFeedback(null)

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const payload = (await response.json()) as
        | ApiSuccessResponse<CategoryManagementItem>
        | ApiErrorResponse

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Kategori oluşturulamadı.")
      }

      await refreshAll()
      setIsCategoryModalOpen(false)
      setEditingCategory(null)
      setFeedback("Kategori başarıyla eklendi.")
      startTransition(() => router.refresh())
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Kategori oluşturulamadı.",
      )
    }
  }

  async function handleUpdateCategory(values: CategoryFormValues) {
    if (!editingCategory) {
      return
    }

    setFeedback(null)

    try {
      const response = await fetch(
        `/api/admin/categories/${editingCategory.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      )

      const payload = (await response.json()) as
        | ApiSuccessResponse<CategoryManagementItem>
        | ApiErrorResponse

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Kategori güncellenemedi.")
      }

      await refreshAll()
      setIsCategoryModalOpen(false)
      setEditingCategory(null)
      setFeedback("Kategori güncellendi.")
      startTransition(() => router.refresh())
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Kategori güncellenemedi.",
      )
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    const confirmed = window.confirm(
      "Bu kategoriyi ve bağlı ürünleri silmek istediğinize emin misiniz?",
    )

    if (!confirmed) {
      return
    }

    setFeedback(null)

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      })
      const payload = (await response.json()) as
        | ApiSuccessResponse<{ id: string }>
        | ApiErrorResponse

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Kategori silinemedi.")
      }

      await refreshAll()

      if (editingCategory?.id === categoryId) {
        setEditingCategory(null)
      }

      if (editingProduct?.categoryId === categoryId) {
        setEditingProduct(null)
        setIsProductPanelOpen(false)
      }

      setFeedback("Kategori ve bağlı ürünler silindi.")
      startTransition(() => router.refresh())
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Kategori silinemedi.")
    }
  }

  async function handleCreateProduct(values: ProductFormValues) {
    setFeedback(null)

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const payload = (await response.json()) as
        | ApiSuccessResponse<ProductManagementItem>
        | ApiErrorResponse

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Ürün oluşturulamadı.")
      }

      await refreshAll()
      setEditingProduct(null)
      setIsProductPanelOpen(false)
      setFeedback("Ürün başarıyla eklendi.")
      startTransition(() => router.refresh())
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Ürün oluşturulamadı.")
    }
  }

  async function handleUpdateProduct(values: ProductFormValues) {
    if (!editingProduct) {
      return
    }

    setFeedback(null)

    try {
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const payload = (await response.json()) as
        | ApiSuccessResponse<ProductManagementItem>
        | ApiErrorResponse

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Ürün güncellenemedi.")
      }

      await refreshAll()
      setEditingProduct(null)
      setIsProductPanelOpen(false)
      setFeedback("Ürün güncellendi.")
      startTransition(() => router.refresh())
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Ürün güncellenemedi.")
    }
  }

  async function handleDeleteProduct(productId: string) {
    setFeedback(null)

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      })
      const payload = (await response.json()) as
        | ApiSuccessResponse<{ id: string }>
        | ApiErrorResponse

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Ürün silinemedi.")
      }

      await refreshAll()

      if (editingProduct?.id === productId) {
        setEditingProduct(null)
        setIsProductPanelOpen(false)
      }

      setFeedback("Ürün silindi.")
      startTransition(() => router.refresh())
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Ürün silinemedi.")
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-stone-200 bg-white px-6 py-5 shadow-[0_14px_40px_rgba(28,25,23,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-stone-500">
              Kategorilerinizi ve lezzetlerinizi tek bir yerden yönetin.
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
              {data.menus.length} menü kaydı
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const draft = buildNextMenuDraft()

                if (!draft) {
                  const nextMessage =
                    "Menu olusturmak icin once en az bir sube eklemelisin."
                  setMenuFormError(nextMessage)
                  setFeedback(nextMessage)
                  return
                }

                void handleCreate(draft)
              }}
              disabled={data.branches.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-[#f21d23] px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(242,29,35,0.24)] transition hover:bg-[#df171d] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
            >
              <Plus className="size-4" />
              Menü Ekle
            </button>
          </div>
        </div>
      </section>

      {feedback ? (
        <div className="rounded-[1.3rem] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm">
          {feedback}
        </div>
      ) : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data.menus.map((menu, index) => {
          const isSelected = menu.id === selectedMenuId
          const isFirst = index === 0
          const isLast = index === data.menus.length - 1
          const heroTitle = menu.name.toUpperCase()
          const heroSubtitle =
            isSelected && selectedMenuCategories.length
              ? selectedMenuCategories[0].name.toUpperCase()
              : menu.name.toUpperCase()

          return (
            <article
              key={menu.id}
              className={cn(
                "overflow-hidden rounded-[2rem] border bg-white shadow-[0_14px_32px_rgba(28,25,23,0.05)] transition",
                isSelected
                  ? "border-[#ff2a30] shadow-[0_20px_44px_rgba(242,29,35,0.12)]"
                  : "border-stone-200",
              )}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedMenuId(menu.id)
                  setEditingCategory(null)
                  setEditingProduct(null)
                  setIsProductPanelOpen(false)
                }}
                className="block w-full text-left"
              >
                <div className="relative min-h-[162px] overflow-hidden border-b border-stone-200 bg-[radial-gradient(circle_at_20%_20%,rgba(90,115,75,0.24),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(170,35,40,0.22),transparent_28%),linear-gradient(180deg,rgba(13,13,13,0.55),rgba(13,13,13,0.82)),linear-gradient(135deg,#1a241f_0%,#1a1513_45%,#070707_100%)] px-4 py-4 text-white">
                  {menu.coverImageUrl ? (
                    <>
                      <AppImage
                        src={menu.coverImageUrl}
                        alt={menu.name}
                        fill
                        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,13,13,0.48),rgba(13,13,13,0.8))]" />
                    </>
                  ) : null}
                  <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:18px_18px]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_35%,rgba(0,0,0,0.45)_100%)]" />
                  <div className="relative flex items-start justify-between gap-3">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-black/35 text-[11px] font-semibold">
                      {index + 1}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-semibold",
                        menu.status === "active"
                          ? "bg-emerald-100/12 text-emerald-100"
                          : "bg-white/12 text-white/75",
                      )}
                    >
                      {menu.status === "active" ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                  <div className="relative mt-8 space-y-4">
                    <h3 className="max-w-[12ch] text-[2rem] font-black uppercase leading-none tracking-tight text-white [text-shadow:0_4px_18px_rgba(0,0,0,0.45)] sm:text-[2.35rem]">
                      {heroTitle}
                    </h3>
                    <p className="text-lg font-black uppercase tracking-tight text-white [text-shadow:0_4px_18px_rgba(0,0,0,0.45)]">
                      {heroSubtitle}
                    </p>
                  </div>
                </div>
              </button>

              <div className="space-y-5 p-5">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[#f4f7fb] px-4 py-2 text-sm font-semibold text-[#90a1ba]">
                    {menu.productCount} Ürün Listeli
                  </span>
                </div>

                <div className="border-t border-stone-200/80" />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <ActionIconButton
                      label="Düzenle"
                      onClick={() => {
                        setSelectedMenuId(menu.id)
                        setEditingMenu(menu)
                        setIsMenuModalOpen(true)
                      }}
                    >
                      <Pencil className="size-4" />
                    </ActionIconButton>
                    <ActionIconButton
                      label="Sil"
                      onClick={() => setConfirmAction({ type: "delete", menu })}
                    >
                      <Trash2 className="size-4" />
                    </ActionIconButton>
                    <ActionIconButton
                      label={menu.status === "active" ? "Pasif yap" : "Aktif yap"}
                      onClick={() => {
                        if (menu.status === "active") {
                          setConfirmAction({
                            type: "deactivate",
                            menu,
                          })
                          return
                        }

                        void handleToggleStatus(menu.id)
                      }}
                    >
                      <Power className="size-4" />
                    </ActionIconButton>
                  </div>

                  <div className="flex flex-col gap-2">
                    <ActionIconButton
                      label="Yukarı taşı"
                      onClick={() => void handleSwapOrder(menu, "up")}
                      disabled={isFirst}
                    >
                      <ChevronUp className="size-4" />
                    </ActionIconButton>
                    <ActionIconButton
                      label="Aşağı taşı"
                      onClick={() => void handleSwapOrder(menu, "down")}
                      disabled={isLast}
                    >
                      <ChevronDown className="size-4" />
                    </ActionIconButton>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                  <span>{menu.branchName}</span>
                  <span className="text-stone-300">/</span>
                  <span>{menu.categoryCount} kategori</span>
                  <span className="text-stone-300">/</span>
                  <span>#{menu.sortOrder}</span>
                </div>

                {isSelected ? (
                  <div className="rounded-[1.2rem] bg-[#fbfbfa] px-4 py-3 text-sm text-stone-600">
                    {selectedMenuCategories.length ? (
                      <p className="line-clamp-2">
                        {selectedMenuCategories
                          .slice(0, 3)
                          .map((category) => category.name)
                          .join(" / ")}
                      </p>
                    ) : (
                      <p className="line-clamp-2">{menu.description}</p>
                    )}
                  </div>
                ) : null}
              </div>
            </article>
          )
        })}
      </section>

      {selectedMenu ? (
        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_14px_40px_rgba(28,25,23,0.05)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
                {selectedMenu.name} İçeriği
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                {selectedMenu.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Yukarıda hangi menüye tıklarsanız burada yalnızca o menüye bağlı
                ürünler listelenir.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null)
                  setIsCategoryModalOpen(true)
                }}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                <Plus className="size-4" />
                Kategori Ekle
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null)
                  setIsProductPanelOpen(true)
                }}
                disabled={!selectedMenuCategoryOptions.length}
                className="inline-flex items-center gap-2 rounded-full bg-[#ef1c24] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#dd161f] disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                <Plus className="size-4" />
                Ürün Ekle
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {selectedMenuCategories.length ? (
              selectedMenuCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setEditingCategory(category)
                    setIsCategoryModalOpen(true)
                  }}
                  className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-white"
                >
                  {category.name} · {category.productCount} urun
                </button>
              ))
            ) : (
              <div className="rounded-full border border-dashed border-stone-300 bg-stone-50 px-4 py-2 text-sm text-stone-500">
                Bu menüye henüz kategori eklenmedi.
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            {selectedMenuProducts.length ? (
              selectedMenuProducts.map((product, index) => (
                <article
                  key={product.id}
                  className="grid gap-4 rounded-[1.5rem] border border-stone-200 bg-[#fcfcfb] px-4 py-4 sm:grid-cols-[32px_72px_minmax(0,1fr)_auto]"
                >
                  <div className="flex items-start justify-center pt-1 text-sm font-semibold text-stone-500">
                    {index + 1}
                  </div>

                  <div className="overflow-hidden rounded-[1rem] border border-stone-200 bg-white">
                    <AppImage
                      src={product.imageUrl}
                      alt={product.name}
                      width={72}
                      height={72}
                      className="size-[72px] object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-950">
                          {product.name}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-500">
                          {product.description}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-[#ef1c24]">
                        {new Intl.NumberFormat("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                          maximumFractionDigits: 2,
                        }).format(product.price)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-stone-700">
                        {product.categoryName}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-stone-700">
                        {product.status === "active" ? "Aktif" : "Pasif"}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-stone-700">
                        Sıra {product.sortOrder}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ActionIconButton
                      label="Ürünü düzenle"
                      onClick={() => {
                        setEditingProduct(product)
                        setIsProductPanelOpen(true)
                      }}
                    >
                      <Pencil className="size-4" />
                    </ActionIconButton>
                    <ActionIconButton
                      label="Ürünü sil"
                      onClick={() =>
                        setProductConfirmAction({
                          type: "delete",
                          product,
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </ActionIconButton>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.3rem] border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-sm text-stone-500">
                {selectedMenuCategoryOptions.length
                  ? "Bu menüye ait ürün yok. Ürün Ekle ile ilk ürünü ekleyebilirsin."
                  : "Ürün eklemek için önce bu menüye kategori eklenmeli."}
              </div>
            )}
          </div>

        </section>
      ) : null}

      {isMenuModalOpen && editingMenu ? (
        <MenuFormPanel
          branches={data.branches}
          mode="edit"
          initialValues={editingMenu}
          onSubmit={handleUpdateMenu}
          errorMessage={menuFormError}
          onClearError={() => setMenuFormError(null)}
          onCancel={() => {
            setIsMenuModalOpen(false)
            setEditingMenu(null)
            setMenuFormError(null)
          }}
          submitLabel="Kaydet"
        />
      ) : null}

      {isCategoryModalOpen && selectedMenu ? (
        <CategoryFormPanel
          menus={[
            {
              id: selectedMenu.id,
              name: selectedMenu.name,
              branchName: selectedMenu.branchName,
            },
          ]}
          initialValues={editingCategory}
          onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
          onCancel={() => {
            setIsCategoryModalOpen(false)
            setEditingCategory(null)
          }}
        />
      ) : null}

      {isProductPanelOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[2rem]">
            <ProductFormPanel
              menus={catalogState.menus}
              categories={catalogState.categoryOptions}
              preferredMenuId={selectedMenuId}
              initialValues={editingProduct}
              onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
              onCancel={() => {
                setEditingProduct(null)
                setIsProductPanelOpen(false)
              }}
            />
          </div>
        </div>
      ) : null}

      {confirmAction ? (
        <MenuConfirmDialog
          title={
            confirmAction.type === "delete"
              ? "Menüyü Sil"
              : "Menüyü Pasife Al"
          }
          description={
            confirmAction.type === "delete"
              ? `"${confirmAction.menu.name}" menüsünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
              : `"${confirmAction.menu.name}" menüsünü pasife almak istediğinize emin misiniz? Menü ziyaretçilere kapatılacak.`
          }
          confirmLabel={
            confirmAction.type === "delete" ? "Sil" : "Pasife Al"
          }
          tone={confirmAction.type === "delete" ? "danger" : "warning"}
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => {
            const action = confirmAction
            setConfirmAction(null)

            if (action.type === "delete") {
              void handleDelete(action.menu.id)
              return
            }

            void handleToggleStatus(action.menu.id)
          }}
        />
      ) : null}

      {productConfirmAction ? (
        <MenuConfirmDialog
          title="Ürünü Sil"
          description={`"${productConfirmAction.product.name}" ürününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          confirmLabel="Sil"
          tone="danger"
          onCancel={() => setProductConfirmAction(null)}
          onConfirm={() => {
            const action = productConfirmAction
            setProductConfirmAction(null)
            void handleDeleteProduct(action.product.id)
          }}
        />
      ) : null}
    </div>
  )
}

function ActionIconButton({
  children,
  label,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-2xl border bg-white transition",
        disabled
          ? "cursor-not-allowed border-stone-200 text-stone-300"
          : "border-stone-200 text-slate-500 hover:bg-stone-50 hover:text-stone-950",
      )}
    >
      {children}
    </button>
  )
}

function MenuConfirmDialog({
  title,
  description,
  confirmLabel,
  tone,
  onCancel,
  onConfirm,
}: {
  title: string
  description: string
  confirmLabel: string
  tone: "danger" | "warning"
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-md rounded-[1.8rem] border border-stone-200 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
          Onay Gerekli
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-stone-500">{description}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Vazgec
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition",
              tone === "danger"
                ? "bg-[#f21d23] hover:bg-[#df171d]"
                : "bg-stone-950 hover:bg-stone-800",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

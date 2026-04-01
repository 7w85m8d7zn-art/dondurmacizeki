"use client"

import { startTransition, useMemo, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { CategoryFormPanel } from "@/components/admin/category-form-panel"
import { ProductFormPanel } from "@/components/admin/product-form-panel"
import { AppImage } from "@/components/ui/app-image"
import type { ApiErrorResponse, ApiSuccessResponse } from "@/lib/api-response"
import { cn } from "@/lib/utils"
import type { BranchOption, MenuDetail } from "@/types/menu-management"
import type {
  CatalogManagementData,
  CategoryFormValues,
  CategoryManagementItem,
  ProductFormValues,
  ProductManagementItem,
} from "@/types/catalog-management"

interface MenuDetailClientProps {
  branches: BranchOption[]
  menu: MenuDetail
  catalog: CatalogManagementData
}

export function MenuDetailClient({
  menu,
  catalog,
}: MenuDetailClientProps) {
  const router = useRouter()
  const [catalogState, setCatalogState] = useState(catalog)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    catalog.categories.find((category) => category.menuId === menu.id)?.id ?? null,
  )
  const [editingCategory, setEditingCategory] =
    useState<CategoryManagementItem | null>(null)
  const [editingProduct, setEditingProduct] =
    useState<ProductManagementItem | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const menuCategories = useMemo(
    () =>
      catalogState.categories
        .filter((category) => category.menuId === menu.id)
        .sort((first, second) => first.sortOrder - second.sortOrder),
    [catalogState.categories, menu.id],
  )

  const selectedCategory = useMemo(
    () => menuCategories.find((category) => category.id === selectedCategoryId) ?? null,
    [menuCategories, selectedCategoryId],
  )

  const categoryProducts = useMemo(
    () =>
      catalogState.products
        .filter((product) => product.categoryId === selectedCategoryId)
        .sort((first, second) => first.sortOrder - second.sortOrder),
    [catalogState.products, selectedCategoryId],
  )

  const menuCategoryOptions = useMemo(
    () => catalogState.categoryOptions.filter((category) => category.menuId === menu.id),
    [catalogState.categoryOptions, menu.id],
  )

  async function refreshCatalog() {
    const response = await fetch("/api/admin/categories", { cache: "no-store" })
    const payload =
      (await response.json()) as ApiSuccessResponse<CatalogManagementData>

    if (!payload.success) {
      throw new Error("Menu icerigi yenilenemedi.")
    }

    setCatalogState(payload.data)
    return payload.data
  }

  async function handleCreateCategory(values: CategoryFormValues) {
    setIsBusy(true)
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
        throw new Error(payload.message ?? "Kategori olusturulamadi.")
      }

      const nextCatalog = await refreshCatalog()
      setSelectedCategoryId(payload.data.id)
      setEditingCategory(
        nextCatalog.categories.find((category) => category.id === payload.data.id) ??
          null,
      )
      setIsCategoryModalOpen(false)
      setFeedback("Kategori basariyla eklendi.")
      startTransition(() => router.refresh())
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Kategori olusturulamadi.",
      )
    } finally {
      setIsBusy(false)
    }
  }

  async function handleUpdateCategory(values: CategoryFormValues) {
    if (!editingCategory) {
      return
    }

    setIsBusy(true)
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
        throw new Error(payload.message ?? "Kategori guncellenemedi.")
      }

      await refreshCatalog()
      setEditingCategory(payload.data)
      setSelectedCategoryId(payload.data.id)
      setIsCategoryModalOpen(false)
      setFeedback("Kategori guncellendi.")
      startTransition(() => router.refresh())
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Kategori guncellenemedi.",
      )
    } finally {
      setIsBusy(false)
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    const confirmed = window.confirm(
      "Bu kategoriyi ve bagli urunleri silmek istediginize emin misiniz?",
    )

    if (!confirmed) {
      return
    }

    setIsBusy(true)
    setFeedback(null)

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      })
      const payload = (await response.json()) as
        | ApiSuccessResponse<boolean>
        | ApiErrorResponse

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Kategori silinemedi.")
      }

      const nextCatalog = await refreshCatalog()
      const nextSelectedCategory =
        nextCatalog.categories.find((category) => category.menuId === menu.id)?.id ?? null

      setSelectedCategoryId(nextSelectedCategory)
      setEditingCategory(null)
      setEditingProduct(null)
      setFeedback("Kategori ve bagli urunler silindi.")
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Kategori silinemedi.")
    } finally {
      setIsBusy(false)
    }
  }

  async function handleCreateProduct(values: ProductFormValues) {
    setIsBusy(true)
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
        throw new Error(payload.message ?? "Urun olusturulamadi.")
      }

      await refreshCatalog()
      setEditingProduct(payload.data)
      setSelectedCategoryId(payload.data.categoryId)
      setFeedback("Urun basariyla eklendi.")
      startTransition(() => router.refresh())
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Urun olusturulamadi.")
    } finally {
      setIsBusy(false)
    }
  }

  async function handleUpdateProduct(values: ProductFormValues) {
    if (!editingProduct) {
      return
    }

    setIsBusy(true)
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
        throw new Error(payload.message ?? "Urun guncellenemedi.")
      }

      await refreshCatalog()
      setEditingProduct(payload.data)
      setSelectedCategoryId(payload.data.categoryId)
      setFeedback("Urun guncellendi.")
      startTransition(() => router.refresh())
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Urun guncellenemedi.")
    } finally {
      setIsBusy(false)
    }
  }

  async function handleDeleteProduct(productId: string) {
    const confirmed = window.confirm("Bu urunu silmek istediginize emin misiniz?")

    if (!confirmed) {
      return
    }

    setIsBusy(true)
    setFeedback(null)

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      })
      const payload = (await response.json()) as
        | ApiSuccessResponse<boolean>
        | ApiErrorResponse

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Urun silinemedi.")
      }

      await refreshCatalog()
      if (editingProduct?.id === productId) {
        setEditingProduct(null)
      }
      setFeedback("Urun silindi.")
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Urun silinemedi.")
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.9rem] border border-stone-200 bg-white p-5 shadow-[0_12px_30px_rgba(28,25,23,0.04)]">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
            Menu Icerigi Yonetimi
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
            {menu.name}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-stone-500">
            Kategoriye tikla, o kategoriye ait urunler sag tarafta gelsin. Boylesiyle
            admin kisi menu icini daha hizli ve dogrudan yonetebilir.
          </p>
        </div>
      </section>

      {feedback ? (
        <div className="rounded-[1.4rem] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm">
          {feedback}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <section className="space-y-4">
          <div className="rounded-[1.8rem] border border-stone-200 bg-white p-4 shadow-[0_12px_30px_rgba(28,25,23,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-stone-950">
                  Kategoriler
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Hangi kategoriye basarsan urunleri acilir.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null)
                  setIsCategoryModalOpen(true)
                }}
                disabled={isBusy}
                className="inline-flex items-center gap-2 rounded-full bg-[#ef1c24] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#dd161f]"
              >
                <Plus className="size-4" />
                Kategori
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {menuCategories.map((category) => (
                <article
                  key={category.id}
                  className={cn(
                    "rounded-[1.25rem] border px-4 py-3 transition",
                    selectedCategoryId === category.id
                      ? "border-stone-950 bg-stone-950 text-white shadow-[0_18px_36px_rgba(28,25,23,0.12)]"
                      : "border-stone-200 bg-stone-50 text-stone-900 hover:bg-white",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(category.id)
                      setEditingCategory(category)
                      setEditingProduct(null)
                    }}
                    disabled={isBusy}
                    className="block w-full text-left"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{category.name}</p>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          selectedCategoryId === category.id
                            ? "bg-white/10 text-white"
                            : "bg-white text-stone-600",
                        )}
                      >
                        {category.productCount} urun
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-2 line-clamp-2 text-sm leading-6",
                        selectedCategoryId === category.id
                          ? "text-white/75"
                          : "text-stone-500",
                      )}
                    >
                      {category.description}
                    </p>
                  </button>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(category)
                        setIsCategoryModalOpen(true)
                      }}
                      disabled={isBusy}
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-xl border transition",
                        selectedCategoryId === category.id
                          ? "border-white/10 bg-white/10 text-white"
                          : "border-stone-200 bg-white text-stone-500",
                      )}
                      aria-label="Kategori duzenle"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleDeleteCategory(category.id)
                      }}
                      disabled={isBusy}
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-xl border transition",
                        selectedCategoryId === category.id
                          ? "border-white/10 bg-white/10 text-white"
                          : "border-stone-200 bg-white text-stone-500",
                      )}
                      aria-label="Kategori sil"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </article>
              ))}

              {menuCategories.length === 0 ? (
                <div className="rounded-[1.25rem] border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                  Bu menuye ait kategori yok. Once kategori ekleyelim.
                </div>
              ) : null}
            </div>
          </div>

        </section>

        <section className="space-y-4">
          <div className="rounded-[1.8rem] border border-stone-200 bg-white p-4 shadow-[0_12px_30px_rgba(28,25,23,0.04)] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
                  Urunler
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-stone-950 sm:text-2xl">
                  {selectedCategory?.name ?? "Kategori secin"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Ornek akista oldugu gibi: `Tatlilar - Kunefe Cesitleri` gibi bir
                  kategoriye bas ve ilgili urunleri tek alanda duzenle.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                disabled={!selectedCategoryId}
                className="inline-flex items-center gap-2 rounded-full bg-[#ef1c24] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#dd161f] disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                <Plus className="size-4" />
                Urun Ekle
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {categoryProducts.length ? (
                categoryProducts.map((product) => (
                  <article
                    key={product.id}
                    className="grid gap-3 rounded-[1.35rem] border border-stone-200 bg-stone-50 px-4 py-3 sm:grid-cols-[84px_minmax(0,1fr)_auto]"
                  >
                    <div className="overflow-hidden rounded-[1rem]">
                      <AppImage
                        src={product.imageUrl}
                        alt={product.name}
                        width={84}
                        height={84}
                        className="size-[84px] object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-950">{product.name}</p>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-500">
                            {product.description}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-stone-950">
                          {new Intl.NumberFormat("tr-TR", {
                            style: "currency",
                            currency: "TRY",
                            maximumFractionDigits: 2,
                          }).format(product.price)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-700">
                          {product.status === "active" ? "Aktif" : "Pasif"}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-700">
                          Sira {product.sortOrder}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(product)}
                        disabled={isBusy}
                        className="inline-flex size-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-950"
                        aria-label="Urun duzenle"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteProduct(product.id)}
                        disabled={isBusy}
                        className="inline-flex size-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-950"
                        aria-label="Urun sil"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-sm text-stone-500">
                  {selectedCategoryId
                    ? "Bu kategoriye ait urun yok. Yeni urun ekleyebilirsin."
                    : "Urunleri gormek icin once soldan bir kategori sec."}
                </div>
              )}
            </div>
          </div>

          <ProductFormPanel
            menus={catalogState.menus}
            categories={menuCategoryOptions}
            preferredMenuId={menu.id}
            initialValues={editingProduct}
            onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
            onCancel={() => setEditingProduct(null)}
          />
        </section>
      </section>

      {isCategoryModalOpen ? (
        <CategoryFormPanel
          menus={catalogState.menus.filter((item) => item.id === menu.id)}
          initialValues={editingCategory}
          onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
          onCancel={() => {
            setIsCategoryModalOpen(false)
            setEditingCategory(null)
          }}
        />
      ) : null}
    </div>
  )
}

"use client"

import { useDeferredValue, useMemo, useState, useTransition } from "react"

import { AppImage } from "@/components/ui/app-image"
import { cn } from "@/lib/utils"
import type { Menu, Product } from "@/types/menu"

function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price)
}

type MenuFilterValue = "all" | string

interface MenuCatalogProps {
  menus: Menu[]
}

interface MenuCatalogItem extends Product {
  menuId: string
  menuName: string
  categoryId: string
  categoryName: string
}

export function MenuCatalog({ menus }: MenuCatalogProps) {
  const [activeFilter, setActiveFilter] = useState<MenuFilterValue>("all")
  const [isPending, startFilterTransition] = useTransition()
  const deferredFilter = useDeferredValue(activeFilter)

  const items = useMemo<MenuCatalogItem[]>(
    () =>
      menus.flatMap((menu) =>
        menu.categories.flatMap((category) =>
          category.products
            .filter((product) => product.isActive)
            .map((product) => ({
              ...product,
              menuId: menu.id,
              menuName: menu.name,
              categoryId: category.id,
              categoryName: category.name,
            })),
        ),
      ),
    [menus],
  )

  const filteredItems = useMemo(
    () =>
      deferredFilter === "all"
        ? items
        : items.filter((item) => item.menuId === deferredFilter),
    [deferredFilter, items],
  )

  const activeMenu =
    deferredFilter === "all"
      ? null
      : menus.find((menu) => menu.id === deferredFilter) ?? null

  if (!menus.length || !items.length) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center">
        <div className="mx-auto max-w-2xl rounded-[2.2rem] border border-amber-100 bg-[linear-gradient(135deg,rgba(255,253,249,0.96),rgba(255,247,237,0.96))] px-8 py-12 text-center shadow-[0_24px_60px_rgba(120,53,15,0.10)]">
          <div className="mx-auto h-1.5 w-20 rounded-full bg-[linear-gradient(90deg,#f97316,#facc15)]" />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.32em] text-amber-700">
            Menü Güncelleniyor
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-stone-950 sm:text-4xl">
            Ürünlerimiz eklenme aşamasındadır.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-stone-600">
            Menümüz üzerinde çalışmalarımız devam ediyor. Kısa süre içinde ürünlerimizi
            burada inceleyebileceksiniz. Anlayışınız için teşekkür ederiz.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,253,249,0.96),rgba(255,248,238,0.92))] shadow-[0_22px_60px_rgba(120,53,15,0.08)] backdrop-blur">
        <div className="border-b border-amber-100/80 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.68),rgba(255,255,255,0.34))] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="h-1 w-16 rounded-full bg-[linear-gradient(90deg,#f97316,#facc15)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-700">
                Menü Listesi
              </p>
              <h2 className="text-2xl font-black tracking-[-0.03em] text-stone-950 sm:text-3xl">
                {activeMenu?.name ?? "Tüm Lezzetler"}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-stone-600">
                {activeMenu?.description ??
                  "Tüm menüler arasında rahatça geçiş yap, ürünleri hızlıca tara ve ilgini çeken lezzete anında odaklan."}
              </p>
            </div>

            <div className="inline-flex w-fit items-center rounded-full border border-amber-200/80 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-800 shadow-sm">
              {activeMenu?.name ?? "Tüm Menüler"}
            </div>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <div className="sticky top-2 z-20 -mx-1 overflow-x-auto px-1 py-1 sm:top-4">
            <div className="inline-flex min-w-full items-center gap-2 rounded-[1.8rem] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,250,244,0.92))] p-2.5 shadow-[0_18px_44px_rgba(120,53,15,0.08)] backdrop-blur-xl">
              <MenuFilterButton
                isActive={activeFilter === "all"}
                onClick={() => startFilterTransition(() => setActiveFilter("all"))}
              >
                Tümü
              </MenuFilterButton>
              {menus.map((menu) => (
                <MenuFilterButton
                  key={menu.id}
                  isActive={activeFilter === menu.id}
                  onClick={() =>
                    startFilterTransition(() => setActiveFilter(menu.id))
                  }
                >
                  {menu.name}
                </MenuFilterButton>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,250,245,0.78))] p-3 shadow-[0_18px_52px_rgba(120,53,15,0.07)] backdrop-blur transition-all duration-300 sm:p-4",
          isPending ? "translate-y-1 opacity-75" : "translate-y-0 opacity-100",
        )}
      >
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="group grid gap-3 rounded-[1.45rem] border border-stone-200/70 bg-[linear-gradient(135deg,rgba(250,250,249,0.96),rgba(255,255,255,0.98))] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200 hover:bg-white hover:shadow-[0_16px_34px_rgba(120,53,15,0.08)] sm:gap-4 sm:rounded-[1.6rem] sm:p-3.5 sm:grid-cols-[118px_minmax(0,1fr)_132px] sm:items-center"
            >
              <div className="relative h-[92px] overflow-hidden rounded-[1.15rem] bg-stone-100 sm:h-[118px] sm:w-[118px] sm:rounded-[1.3rem]">
                <AppImage
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 118px"
                  className="object-cover transition duration-500 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.16))]" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-800">
                    {item.menuName}
                  </span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-700">
                    {item.categoryName}
                  </span>
                  {item.badges?.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                <p className="mt-2.5 truncate text-base font-black tracking-tight text-stone-950 sm:mt-3 sm:text-[1.35rem]">
                  {item.name}
                </p>
                <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-6 text-stone-600">
                  {item.description}
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-stone-500 sm:mt-3">
                  <span className="rounded-full bg-stone-100 px-2.5 py-1">
                    Günlük hazır servis
                  </span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1">
                    Taze sunum
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-[1rem] border border-amber-100 bg-[linear-gradient(180deg,#fffdfa,#fff6ea)] px-3.5 py-2.5 shadow-[0_10px_24px_rgba(120,53,15,0.06)] sm:min-w-[116px] sm:flex-col sm:items-end sm:justify-center sm:self-stretch sm:rounded-[1.2rem] sm:px-5 sm:py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-stone-400">
                  Fiyat
                </p>
                <span className="block text-lg font-black tracking-tight text-stone-950 sm:text-[2rem]">
                  {formatPrice(item.price)}
                </span>
              </div>
            </article>
          ))}

          {filteredItems.length === 0 ? (
            <div className="rounded-[1.2rem] border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center">
              <p className="text-sm font-medium text-stone-700">
                Bu menü için aktif ürün bulunamadı.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function MenuFilterButton({
  children,
  isActive,
  onClick,
}: {
  children: React.ReactNode
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-w-max rounded-full border px-4 py-2.5 text-sm font-semibold transition",
        isActive
          ? "border-stone-950 bg-[linear-gradient(180deg,#1c1917,#0f0d0c)] text-white shadow-[0_12px_24px_rgba(28,25,23,0.18)]"
          : "border-transparent bg-transparent text-stone-700 hover:border-amber-100 hover:bg-white hover:text-stone-950",
      )}
    >
      {children}
    </button>
  )
}

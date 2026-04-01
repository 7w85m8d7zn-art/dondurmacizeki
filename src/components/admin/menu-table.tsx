"use client"

import Link from "next/link"

import { MenuStatusBadge } from "@/components/admin/menu-status-badge"
import type { MenuManagementItem } from "@/types/menu-management"

interface MenuTableProps {
  menus: MenuManagementItem[]
  onEdit: (menuId: string) => void
  onDelete: (menuId: string) => void
  onToggleStatus: (menuId: string) => void
}

export function MenuTable({
  menus,
  onEdit,
  onDelete,
  onToggleStatus,
}: MenuTableProps) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-stone-950">
            Menu Listesi
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Tum menuleri listele, subeye ata, detaylarini duzenle veya durumu
            degistir.
          </p>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
          {menus.length} menu
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {menus.map((menu) => (
          <article
            key={menu.id}
            className="grid gap-4 rounded-[1.5rem] border border-stone-200 p-4 xl:grid-cols-[1.5fr_0.8fr_0.8fr_0.7fr_auto]"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-medium text-stone-950">{menu.name}</p>
                <MenuStatusBadge status={menu.status} />
              </div>
              <p className="text-sm leading-6 text-stone-500">
                {menu.description}
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-stone-500">
                <span className="rounded-full bg-stone-100 px-3 py-1">
                  /{menu.slug}
                </span>
                <span className="rounded-full bg-stone-100 px-3 py-1">
                  {menu.categoryCount} kategori
                </span>
                <span className="rounded-full bg-stone-100 px-3 py-1">
                  Sira {menu.sortOrder}
                </span>
              </div>
            </div>

            <div className="text-sm text-stone-700">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                Sube
              </p>
              <p className="mt-2 font-medium">{menu.branchName}</p>
            </div>

            <div className="text-sm text-stone-700">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                Guncelleme
              </p>
              <p className="mt-2 font-medium">
                {new Intl.DateTimeFormat("tr-TR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }).format(new Date(menu.updatedAt))}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 xl:flex-col xl:items-start">
              <button
                type="button"
                onClick={() => onToggleStatus(menu.id)}
                className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                {menu.status === "active" ? "Pasife Al" : "Aktif Et"}
              </button>
              <Link
                href={`/admin/menuler/${menu.id}`}
                className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Detay
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <button
                type="button"
                onClick={() => onEdit(menu.id)}
                className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Duzenle
              </button>
              <button
                type="button"
                onClick={() => onDelete(menu.id)}
                className="rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
              >
                Sil
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

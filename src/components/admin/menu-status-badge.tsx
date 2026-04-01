import type { MenuStatus } from "@/types/menu-management"

interface MenuStatusBadgeProps {
  status: MenuStatus
}

export function MenuStatusBadge({ status }: MenuStatusBadgeProps) {
  const isActive = status === "active"

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-stone-100 text-stone-700"
      }`}
    >
      {isActive ? "Aktif" : "Pasif"}
    </span>
  )
}

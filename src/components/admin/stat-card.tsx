import { cn } from "@/lib/utils"
import type { AdminStat } from "@/types/admin"

const toneStyles: Record<AdminStat["tone"], string> = {
  neutral: "bg-white text-stone-950",
  positive: "bg-emerald-50 text-emerald-950",
  accent: "bg-amber-50 text-amber-950",
}

export function StatCard({ label, value, change, tone }: AdminStat) {
  return (
    <article
      className={cn(
        "rounded-[1.9rem] border border-stone-200 p-5 shadow-sm",
        toneStyles[tone],
      )}
    >
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <strong className="text-2xl font-semibold tracking-tight sm:text-3xl">{value}</strong>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-stone-700">
          {change}
        </span>
      </div>
    </article>
  )
}

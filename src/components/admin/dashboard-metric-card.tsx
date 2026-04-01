import { cn } from "@/lib/utils"

interface DashboardMetricCardProps {
  label: string
  value: string
  subtitle: string
  accent?: "primary" | "neutral" | "soft"
}

const accentStyles: Record<NonNullable<DashboardMetricCardProps["accent"]>, string> = {
  primary:
    "border-red-500/90 bg-[#ef1c24] text-white shadow-[0_20px_50px_rgba(239,28,36,0.22)]",
  neutral: "border-stone-200 bg-white text-stone-950",
  soft: "border-stone-200 bg-white text-stone-950",
}

export function DashboardMetricCard({
  label,
  value,
  subtitle,
  accent = "neutral",
}: DashboardMetricCardProps) {
  const isPrimary = accent === "primary"

  return (
    <article
      className={cn(
        "rounded-[1.8rem] border p-5 shadow-[0_12px_30px_rgba(28,25,23,0.04)] transition",
        accentStyles[accent],
      )}
    >
      <div className="space-y-4">
        <div
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-xl text-sm font-semibold",
            isPrimary ? "bg-white/12 text-white" : "bg-stone-100 text-stone-700",
          )}
        >
          {label.slice(0, 1)}
        </div>

        <div className="space-y-2">
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.22em]",
              isPrimary ? "text-white/70" : "text-stone-400",
            )}
          >
            {label}
          </p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <p
            className={cn(
              "text-sm",
              isPrimary ? "text-white/80" : "text-stone-500",
            )}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </article>
  )
}

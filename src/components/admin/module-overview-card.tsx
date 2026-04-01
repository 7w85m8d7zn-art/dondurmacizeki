import type { ModuleSummary } from "@/types/admin"

interface ModuleOverviewCardProps {
  summary: ModuleSummary
}

export function ModuleOverviewCard({ summary }: ModuleOverviewCardProps) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-xl font-semibold tracking-tight text-stone-950">
          {summary.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          {summary.description}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {summary.items.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.4rem] border border-stone-200 bg-stone-50 p-4"
          >
            <p className="text-sm text-stone-500">{item.label}</p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-stone-950">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

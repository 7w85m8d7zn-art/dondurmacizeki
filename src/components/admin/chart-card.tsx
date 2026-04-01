import type { BranchTraffic } from "@/types/admin"

interface ChartCardProps {
  items: BranchTraffic[]
}

export function ChartCard({ items }: ChartCardProps) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            Sube Trafik Akisi
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-stone-950 sm:text-2xl">
            Subelere gore trafik dagilimi
          </h3>
        </div>
        <span className="w-fit rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          Son 24 Saat
        </span>
      </div>

      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <div key={item.branchName} className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-stone-900">{item.branchName}</p>
                <p className="text-sm text-stone-500">
                  {item.visits} goruntulenme • {item.scans} tarama
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-stone-700">
                %{item.progress}
              </p>
            </div>
            <div className="h-3 rounded-full bg-stone-100">
              <div
                className="h-3 rounded-full bg-[linear-gradient(90deg,#111827_0%,#d97706_100%)]"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

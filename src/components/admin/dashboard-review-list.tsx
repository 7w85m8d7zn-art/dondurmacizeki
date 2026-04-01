import type { ActivityItem } from "@/types/admin"

interface DashboardReviewListProps {
  items: ActivityItem[]
}

export function DashboardReviewList({ items }: DashboardReviewListProps) {
  return (
    <section className="rounded-[1.9rem] border border-stone-200 bg-white p-4 shadow-[0_12px_30px_rgba(28,25,23,0.04)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
            Son Guncellemeler
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-stone-950">
            Siteden cekilen anlik durum
          </h3>
        </div>
        <button className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-500 transition hover:text-red-600">
          Veri Ozeti
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <article
            key={item.id}
            className="rounded-[1.25rem] border border-stone-200 bg-stone-50 px-3 py-3.5"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-semibold text-stone-700 shadow-sm">
                {item.title.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-stone-950">
                    {item.title}
                  </p>
                  <span className="shrink-0 text-[11px] font-semibold text-amber-600">
                    {index < 3 ? "+5.0" : "+4.8"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">
                  {item.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

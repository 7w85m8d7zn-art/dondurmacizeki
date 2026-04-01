import { getActivityTone } from "@/data/admin-content"
import type { ActivityItem } from "@/types/admin"

interface ActivityFeedProps {
  title: string
  description: string
  items: ActivityItem[]
}

export function ActivityFeed({
  title,
  description,
  items,
}: ActivityFeedProps) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-stone-950 sm:text-xl">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getActivityTone(
                    item.type,
                  )}`}
                >
                  {item.type}
                </span>
                <div>
                  <p className="font-medium text-stone-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    {item.description}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                {item.time}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

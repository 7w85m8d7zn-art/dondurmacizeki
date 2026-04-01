import { cn } from "@/lib/utils"
import type { Category } from "@/types/menu"

interface CategoryTabsProps {
  categories: Category[]
  className?: string
}

export function CategoryTabs({ categories, className }: CategoryTabsProps) {
  return (
    <div
      className={cn(
        "scrollbar-hide flex snap-x gap-3 overflow-x-auto pb-2",
        className,
      )}
    >
      {categories.map((category) => (
        <a
          key={category.id}
          href={`#${category.id}`}
          className="min-w-max snap-start whitespace-nowrap rounded-full border border-stone-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:border-amber-300 hover:text-stone-950"
        >
          {category.name}
        </a>
      ))}
    </div>
  )
}

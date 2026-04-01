import { AppImage } from "@/components/ui/app-image"
import type { Product } from "@/types/menu"

function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price)
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex items-center gap-3 rounded-[1.35rem] border border-white/75 bg-white/90 p-3 shadow-[0_16px_42px_rgba(120,53,15,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(120,53,15,0.11)] sm:gap-4 sm:p-3.5">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-[1.15rem] sm:size-28">
        <AppImage
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 96px, 112px"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        {product.badges?.length ? (
          <div className="flex flex-wrap gap-2">
            {product.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800"
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <h3 className="text-base font-semibold tracking-tight text-stone-950 sm:text-lg">
              {product.name}
            </h3>
            <p className="line-clamp-2 text-sm leading-6 text-stone-600">
              {product.description}
            </p>
          </div>
          <span className="w-fit shrink-0 rounded-full bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white sm:text-sm">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </article>
  )
}

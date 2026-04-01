import { AppImage } from "@/components/ui/app-image"
import type { Product } from "@/types/menu"

function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price)
}

interface ProductSpotlightProps {
  product: Product
}

export function ProductSpotlight({ product }: ProductSpotlightProps) {
  return (
    <section className="grid gap-4 rounded-[1.6rem] border border-stone-200/80 bg-[linear-gradient(135deg,rgba(41,37,36,0.98),rgba(68,64,60,0.95))] p-4 text-stone-100 shadow-[0_20px_60px_rgba(28,25,23,0.18)] sm:rounded-[1.9rem] sm:p-5 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="min-w-0 space-y-3">
        <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
          One Cikan Lezzet
        </span>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{product.name}</h2>
          <p className="max-w-xl text-sm leading-6 text-stone-300">
            {product.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.badges?.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-stone-100"
            >
              {badge}
            </span>
          ))}
        </div>
        <div className="pt-1 text-xl font-semibold text-amber-300 sm:text-2xl">
          {formatPrice(product.price)}
        </div>
      </div>
      <div className="relative min-h-52 overflow-hidden rounded-[1.45rem] border border-white/10 sm:min-h-60">
        <AppImage
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  )
}

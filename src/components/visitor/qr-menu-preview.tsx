import { AppImage } from "@/components/ui/app-image"
import type { Branch } from "@/types/menu"

interface QrMenuPreviewProps {
  branch: Branch
}

export function QrMenuPreview({ branch }: QrMenuPreviewProps) {
  const topCategories = branch.menu.categories.slice(0, 3)

  return (
    <section className="rounded-[1.7rem] border border-white/70 bg-white/88 p-5 shadow-[0_22px_70px_rgba(120,53,15,0.10)] backdrop-blur sm:rounded-[2rem] sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="mx-auto w-full max-w-[280px] rounded-[1.9rem] border border-stone-200 bg-stone-950 p-2.5 shadow-[0_24px_70px_rgba(28,25,23,0.24)]">
          <div className="rounded-[1.7rem] bg-[radial-gradient(circle_at_top,#fef3c7,transparent_42%),linear-gradient(180deg,#fffaf2_0%,#fff7ed_100%)] p-4">
            <div className="mx-auto mb-4 h-1.5 w-20 rounded-full bg-stone-300" />
            <div className="space-y-1 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700">
                {branch.name}
              </p>
              <h3 className="text-lg font-semibold tracking-tight text-stone-900">
                {branch.menu.name}
              </h3>
              <p className="text-xs leading-5 text-stone-600">
                Hizli kategori gecisi ve kompakt urun listesi.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {topCategories.map((category) => (
                <span
                  key={category.id}
                  className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-stone-700 shadow-sm"
                >
                  {category.name}
                </span>
              ))}
            </div>

            <div className="mt-4 space-y-2.5">
              {topCategories[0]?.products.slice(0, 2).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-[1.2rem] bg-white p-2.5 shadow-sm"
                >
                  <AppImage
                    src={product.imageUrl}
                    alt={product.name}
                    width={52}
                    height={52}
                    className="size-[52px] rounded-[1rem] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-900">
                      {product.name}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs leading-5 text-stone-500">
                      {product.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
              QR Mobil Gorunum
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
              Telefonda acildiginda temiz ve hizli bir deneyim
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
              Kategoriye hizli gecis, net fiyat gosterimi ve gereksiz kalabalik
              olmadan urun inceleme akisi sunulur.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                Kategori
              </p>
              <p className="mt-2 text-sm font-semibold text-stone-900">
                Tek dokunusla gecis
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                Fiyat
              </p>
              <p className="mt-2 text-sm font-semibold text-stone-900">
                Her urunde net gorunum
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                Mobil
              </p>
              <p className="mt-2 text-sm font-semibold text-stone-900">
                Kompakt kart yapisi
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import type { ProductRow } from "@/types/admin"

interface ProductTableProps {
  rows: ProductRow[]
}

export function ProductTable({ rows }: ProductTableProps) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-tight text-stone-950 sm:text-xl">
            Son Eklenen Urunler
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Son eklenen ve guncellenen urunleri hizli gor.
          </p>
        </div>
        <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
          Guncel
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <article
            key={row.id}
            className="grid gap-3 rounded-[1.5rem] border border-stone-200 p-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_auto_auto]"
          >
            <div className="min-w-0">
              <p className="font-medium text-stone-950">{row.name}</p>
              <p className="mt-1 truncate text-sm text-stone-500">{row.category}</p>
            </div>
            <div className="text-sm text-stone-600">{row.branch}</div>
            <div className="text-sm font-medium text-stone-900">{row.price}</div>
            <div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  row.status === "Aktif"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {row.status}
              </span>
            </div>
            <button className="w-fit rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800">
              Duzenle
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

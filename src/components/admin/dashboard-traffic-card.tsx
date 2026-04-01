import type { BranchTraffic, DashboardTrendPoint } from "@/types/admin"

interface DashboardTrafficCardProps {
  points: DashboardTrendPoint[]
  branches: BranchTraffic[]
}

function buildAreaPath(points: DashboardTrendPoint[]) {
  if (points.length === 0) {
    return ""
  }

  const width = 100
  const height = 100
  const stepX = width / Math.max(points.length - 1, 1)
  const maxValue = Math.max(...points.map((point) => point.value), 1)

  const linePoints = points.map((point, index) => {
    const x = index * stepX
    const y = height - (point.value / maxValue) * 78 - 8
    return { x, y }
  })

  const line = linePoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")

  const area = `${line} L ${width} ${height} L 0 ${height} Z`

  return { line, area, linePoints }
}

export function DashboardTrafficCard({
  points,
  branches,
}: DashboardTrafficCardProps) {
  const chart = buildAreaPath(points)

  return (
    <section className="rounded-[1.9rem] border border-stone-200 bg-white p-4 shadow-[0_12px_30px_rgba(28,25,23,0.04)] sm:p-5">
      <div className="flex flex-col gap-3 border-b border-stone-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
            Canli Site Dagilimi
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-stone-950 sm:text-2xl">
            Konum, menu ve katalog ozeti
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600">
            Anlik
          </span>
          <span className="rounded-full bg-stone-950 px-3 py-1.5 text-xs font-semibold text-white">
            Site verisi
          </span>
        </div>
      </div>

      <div className="mt-5">
        <div className="relative h-[260px] w-full sm:h-[320px]">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id="traffic-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(239,28,36,0.32)" />
                <stop offset="100%" stopColor="rgba(239,28,36,0)" />
              </linearGradient>
            </defs>

            {[20, 40, 60, 80].map((value) => (
              <line
                key={value}
                x1="0"
                y1={value}
                x2="100"
                y2={value}
                stroke="rgba(231,229,228,0.9)"
                strokeDasharray="1.8 2.6"
                strokeWidth="0.35"
              />
            ))}

            {chart ? (
              <>
                <path d={chart.area} fill="url(#traffic-fill)" />
                <path
                  d={chart.line}
                  fill="none"
                  stroke="#ff2c2c"
                  strokeWidth="0.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            ) : null}
          </svg>

          <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
            {points.map((point) => (
              <span key={point.label}>{point.label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {branches.map((branch) => (
          <div
            key={branch.branchName}
            className="rounded-[1.3rem] border border-stone-200 bg-stone-50 px-4 py-3"
          >
            <p className="text-sm font-semibold text-stone-950">{branch.branchName}</p>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm text-stone-500">
              <span>{branch.visits} kategori</span>
              <span>{branch.scans} urun</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

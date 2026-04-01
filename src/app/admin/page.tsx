import { DashboardMetricCard } from "@/components/admin/dashboard-metric-card"
import { DashboardTrafficCard } from "@/components/admin/dashboard-traffic-card"
import { getAdminDashboardData } from "@/data/admin-dashboard-store"

export default async function AdminDashboardPage() {
  const dashboardData = await getAdminDashboardData()

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="size-2 rounded-full bg-emerald-500" />
            Canlı Admin Kontrol
          </div>
          <p className="max-w-3xl text-sm leading-7 text-stone-500">
            İşletmenin performansını ve ziyaretçi etkileşimlerini anlık olarak
            takip edin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-red-500 shadow-sm">
            {dashboardData.currentTimeLabel}
          </div>
          <div className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm">
            {dashboardData.currentDateLabel}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {dashboardData.stats.map((stat, index) => (
          <DashboardMetricCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            subtitle={stat.change}
            accent={index === 0 ? "primary" : index === 2 ? "soft" : "neutral"}
          />
        ))}
      </section>

      <section>
        <DashboardTrafficCard
          points={dashboardData.weeklyTraffic}
          branches={dashboardData.branchTraffic}
        />
      </section>
    </div>
  )
}

export const dynamic = "force-dynamic"

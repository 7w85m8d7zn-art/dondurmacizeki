export interface AdminNavItem {
  href: string
  label: string
  description: string
  badge?: string
}

export interface AdminStat {
  id: string
  label: string
  value: string
  change: string
  tone: "neutral" | "positive" | "accent"
}

export interface BranchTraffic {
  branchName: string
  visits: number
  scans: number
  progress: number
}

export interface DashboardTrendPoint {
  label: string
  value: number
}

export interface ActivityItem {
  id: string
  title: string
  description: string
  time: string
  type: "product" | "menu" | "review" | "system"
}

export interface ProductRow {
  id: string
  name: string
  category: string
  branch: string
  price: string
  status: "Aktif" | "Taslak"
}

export interface ModuleSummary {
  title: string
  description: string
  items: Array<{
    label: string
    value: string
  }>
}

export interface AdminDashboardData {
  brandName: string
  adminName: string
  stats: AdminStat[]
  branchTraffic: BranchTraffic[]
  weeklyTraffic: DashboardTrendPoint[]
  recentProducts: ProductRow[]
  activities: ActivityItem[]
  moduleSummaries: Record<string, ModuleSummary>
}

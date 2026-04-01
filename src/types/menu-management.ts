export type MenuStatus = "active" | "passive"

export interface BranchOption {
  id: string
  name: string
  shortAddress: string
}

export interface MenuCategoryItem {
  id: string
  name: string
  description: string
  productCount: number
  sortOrder: number
}

export interface MenuManagementItem {
  id: string
  name: string
  description: string
  coverImageUrl: string
  slug: string
  branchId: string
  branchName: string
  status: MenuStatus
  sortOrder: number
  categoryCount: number
  productCount: number
  updatedAt: string
}

export interface MenuDetail extends MenuManagementItem {
  categories: MenuCategoryItem[]
}

export interface MenuFormValues {
  name: string
  description: string
  coverImageUrl: string
  slug: string
  branchId: string
  status: MenuStatus
  sortOrder: number
}

export interface MenuManagementData {
  branches: BranchOption[]
  menus: MenuManagementItem[]
}

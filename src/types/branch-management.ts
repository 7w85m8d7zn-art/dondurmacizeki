export type BranchStatus = "active" | "passive"

export interface BranchManagementItem {
  id: string
  name: string
  slug: string
  shortAddress: string
  fullAddress: string
  mapUrl: string
  phone: string
  serviceNote: string
  status: BranchStatus
  sortOrder: number
  menuCount: number
}

export interface BranchFormValues {
  name: string
  slug: string
  shortAddress: string
  fullAddress: string
  mapUrl: string
  phone: string
  serviceNote: string
  status: BranchStatus
  sortOrder: number
}

export interface BranchManagementData {
  branches: BranchManagementItem[]
}

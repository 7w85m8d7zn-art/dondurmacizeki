export type EntityStatus = "active" | "passive"

export interface MenuOption {
  id: string
  name: string
  branchName: string
}

export interface CategoryOption {
  id: string
  name: string
  menuId: string
  menuName: string
}

export interface CategoryManagementItem {
  id: string
  name: string
  description: string
  sortOrder: number
  status: EntityStatus
  menuId: string
  menuName: string
  productCount: number
}

export interface ProductManagementItem {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  status: EntityStatus
  sortOrder: number
  categoryId: string
  categoryName: string
  menuId: string
  menuName: string
}

export interface CategoryFormValues {
  name: string
  description: string
  sortOrder: number
  status: EntityStatus
  menuId: string
}

export interface ProductFormValues {
  name: string
  description: string
  price: number
  imageUrl: string
  status: EntityStatus
  sortOrder: number
  categoryId: string
}

export interface CatalogManagementData {
  menus: MenuOption[]
  categories: CategoryManagementItem[]
  categoryOptions: CategoryOption[]
  products: ProductManagementItem[]
}

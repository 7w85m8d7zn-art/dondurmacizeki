export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  isActive: boolean
  badges?: string[]
}

export interface Category {
  id: string
  name: string
  description: string
  products: Product[]
}

export interface Menu {
  id: string
  name: string
  description: string
  categories: Category[]
}

export interface Branch {
  id: string
  slug: string
  name: string
  shortAddress: string
  fullAddress: string
  mapUrl: string
  phone: string
  serviceNote: string
  menu: Menu
}

export interface HomeContent {
  title: string
  slogan: string
  description: string
}

export interface VisitorData {
  brandName: string
  city: string
  home: HomeContent
  branches: Branch[]
}

export interface HomeBranchCardContent {
  branchId: string
  title: string
  shortAddress: string
  mapUrl: string
}

export interface HomeSocialLinks {
  phone: string
  instagram: string
  tiktok: string
  whatsapp: string
}

export interface HomeContentConfig {
  siteTitle: string
  slogan: string
  logoUrl: string
  backgroundImageUrl: string
  menuButtonText: string
  branchCards: HomeBranchCardContent[]
  socialLinks: HomeSocialLinks
}

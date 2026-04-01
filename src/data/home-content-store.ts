import "server-only"

import fallbackHomeContent from "@/data/home-content.json"
import { visitorData } from "@/data/visitor-data"
import {
  getSupabaseAdminClient,
  shouldUseSupabaseFallback,
  toNumberValue,
  throwIfSupabaseError,
} from "@/lib/supabase-data"
import type {
  HomeBranchCardContent,
  HomeContentConfig,
} from "@/types/home-content-management"
import type { Branch } from "@/types/menu"

export interface HomePageBranchView extends Branch {
  cardTitle: string
  cardShortAddress: string
  cardMapUrl: string
}

export interface HomePageContentView {
  content: HomeContentConfig
  branches: HomePageBranchView[]
  city: string
}

type SiteSettingRow = {
  id: string
  siteName: string
  slogan: string
  description: string
  logoUrl: string
  backgroundImageUrl: string
  menuButtonText: string
  phone: string | null
  instagramUrl: string | null
  tiktokUrl: string | null
  whatsappUrl: string | null
  updatedAt: string
}

type BranchRow = {
  id: string
  slug: string
  name: string
  shortAddress: string
  fullAddress: string
  mapUrl: string
  phone: string
  serviceNote: string
  sortOrder: number
}

type HomeCardRow = {
  id: string
  branchId: string
  title: string
  shortAddress: string
  mapUrl: string
  isActive: boolean
  sortOrder: number
}

type BranchMenuRow = {
  branchId: string
  menuId: string
  isActive: boolean
  sortOrder: number
}

type MenuRow = {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

type CategoryRow = {
  id: string
  menuId: string
  name: string
  description: string | null
  isActive: boolean
  sortOrder: number
}

type ProductRow = {
  id: string
  categoryId: string
  name: string
  description: string | null
  price: string | number
  imageUrl: string
  isActive: boolean
  sortOrder: number
}

type BranchRecordWithMenu = BranchRow & {
  branchMenus: Array<{
    menu: {
      id: string
      name: string
      description: string | null
      categories: Array<{
        id: string
        name: string
        description: string | null
        products: Array<{
          id: string
          name: string
          description: string | null
          price: string | number
          imageUrl: string
          isActive: boolean
        }>
      }>
    }
  }>
  homeCard: HomeCardRow | null
}

function getFallbackHomeContentConfig(): HomeContentConfig {
  return {
    siteTitle: fallbackHomeContent.siteTitle,
    slogan: fallbackHomeContent.slogan,
    logoUrl: fallbackHomeContent.logoUrl,
    backgroundImageUrl: fallbackHomeContent.backgroundImageUrl,
    menuButtonText: fallbackHomeContent.menuButtonText,
    branchCards: fallbackHomeContent.branchCards.map((card) => ({ ...card })),
    socialLinks: { ...fallbackHomeContent.socialLinks },
  }
}

function getFallbackHomePageContentView(): HomePageContentView {
  const content = getFallbackHomeContentConfig()
  const cardByBranchId = new Map(
    content.branchCards.map((card) => [card.branchId, card]),
  )

  return {
    content,
    city: visitorData.city,
    branches: visitorData.branches.map((branch) => {
      const card = cardByBranchId.get(branch.id)

      return {
        ...branch,
        cardTitle: card?.title ?? branch.name,
        cardShortAddress: card?.shortAddress ?? branch.shortAddress,
        cardMapUrl: card?.mapUrl ?? branch.mapUrl,
      }
    }),
  }
}

async function getSiteSettingRecord() {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("SiteSetting")
    .select("*")
    .order("updatedAt", { ascending: false })
    .limit(1)
    .maybeSingle()

  throwIfSupabaseError(error, "Site ayarlari alinamadi")

  return (data ?? null) as SiteSettingRow | null
}

async function getBranchRecordsWithMenus(): Promise<BranchRecordWithMenu[]> {
  const supabase = getSupabaseAdminClient()

  const { data: branches, error: branchError } = await supabase
    .from("Branch")
    .select("id,slug,name,shortAddress,fullAddress,mapUrl,phone,serviceNote,sortOrder")
    .order("sortOrder", { ascending: true })

  throwIfSupabaseError(branchError, "Sube listesi alinamadi")

  const branchRows = (branches ?? []) as BranchRow[]
  const branchIds = branchRows.map((branch) => branch.id)

  const [homeCardsResult, branchMenusResult] = await Promise.all([
    branchIds.length
      ? supabase
          .from("HomeBranchCard")
          .select("id,branchId,title,shortAddress,mapUrl,isActive,sortOrder")
          .in("branchId", branchIds)
      : Promise.resolve({ data: [], error: null }),
    branchIds.length
      ? supabase
          .from("BranchMenu")
          .select("branchId,menuId,isActive,sortOrder")
          .in("branchId", branchIds)
          .eq("isActive", true)
          .order("sortOrder", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ])

  throwIfSupabaseError(homeCardsResult.error, "Ana sayfa kartlari alinamadi")
  throwIfSupabaseError(branchMenusResult.error, "Sube-menu iliskileri alinamadi")

  const homeCards = (homeCardsResult.data ?? []) as HomeCardRow[]
  const branchMenus = (branchMenusResult.data ?? []) as BranchMenuRow[]

  const menuIds = [...new Set(branchMenus.map((item) => item.menuId))]

  const { data: menus, error: menuError } = menuIds.length
    ? await supabase
        .from("Menu")
        .select("id,name,description,isActive")
        .in("id", menuIds)
        .eq("isActive", true)
    : { data: [], error: null }

  throwIfSupabaseError(menuError, "Menu listesi alinamadi")

  const activeMenus = (menus ?? []) as MenuRow[]
  const activeMenuIds = new Set(activeMenus.map((menu) => menu.id))

  const activeBranchMenus = branchMenus.filter((relation) =>
    activeMenuIds.has(relation.menuId),
  )

  const [categoriesResult] = await Promise.all([
    activeMenus.length
      ? supabase
          .from("Category")
          .select("id,menuId,name,description,isActive,sortOrder")
          .in(
            "menuId",
            activeMenus.map((menu) => menu.id),
          )
          .eq("isActive", true)
          .order("sortOrder", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ])

  throwIfSupabaseError(categoriesResult.error, "Kategori listesi alinamadi")

  const categories = (categoriesResult.data ?? []) as CategoryRow[]
  const categoryIds = categories.map((category) => category.id)

  const { data: products, error: productError } = categoryIds.length
    ? await supabase
        .from("Product")
        .select("id,categoryId,name,description,price,imageUrl,isActive,sortOrder")
        .in("categoryId", categoryIds)
        .eq("isActive", true)
        .order("sortOrder", { ascending: true })
    : { data: [], error: null }

  throwIfSupabaseError(productError, "Urun listesi alinamadi")

  const productRows = (products ?? []) as ProductRow[]

  const homeCardByBranchId = new Map(homeCards.map((card) => [card.branchId, card]))
  const menuById = new Map(activeMenus.map((menu) => [menu.id, menu]))

  const categoriesByMenuId = new Map<string, CategoryRow[]>()

  for (const category of categories) {
    const current = categoriesByMenuId.get(category.menuId) ?? []
    current.push(category)
    categoriesByMenuId.set(category.menuId, current)
  }

  const productsByCategoryId = new Map<string, ProductRow[]>()

  for (const product of productRows) {
    const current = productsByCategoryId.get(product.categoryId) ?? []
    current.push(product)
    productsByCategoryId.set(product.categoryId, current)
  }

  return branchRows.map((branch) => {
    const branchRelations = activeBranchMenus
      .filter((relation) => relation.branchId === branch.id)
      .sort((first, second) => first.sortOrder - second.sortOrder)

    return {
      ...branch,
      homeCard: homeCardByBranchId.get(branch.id) ?? null,
      branchMenus: branchRelations
        .map((relation) => {
          const menu = menuById.get(relation.menuId)

          if (!menu) {
            return null
          }

          const menuCategories = (categoriesByMenuId.get(menu.id) ?? [])
            .sort((first, second) => first.sortOrder - second.sortOrder)
            .map((category) => ({
              id: category.id,
              name: category.name,
              description: category.description,
              products: (productsByCategoryId.get(category.id) ?? [])
                .sort((first, second) => first.sortOrder - second.sortOrder)
                .map((product) => ({
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  imageUrl: product.imageUrl,
                  isActive: product.isActive,
                })),
            }))

          return {
            menu: {
              id: menu.id,
              name: menu.name,
              description: menu.description,
              categories: menuCategories,
            },
          }
        })
        .filter((relation): relation is NonNullable<typeof relation> => Boolean(relation)),
    }
  })
}

function mapMenuBranch(branch: BranchRecordWithMenu): HomePageBranchView | null {
  const activeMenu = branch.branchMenus[0]?.menu

  if (!activeMenu) {
    return null
  }

  return {
    id: branch.id,
    slug: branch.slug,
    name: branch.name,
    shortAddress: branch.shortAddress,
    fullAddress: branch.fullAddress,
    mapUrl: branch.mapUrl,
    phone: branch.phone,
    serviceNote: branch.serviceNote,
    menu: {
      id: activeMenu.id,
      name: activeMenu.name,
      description: activeMenu.description ?? "",
      categories: activeMenu.categories.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description ?? "",
        products: category.products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description ?? "",
          price: toNumberValue(product.price),
          imageUrl: product.imageUrl,
          isActive: product.isActive,
        })),
      })),
    },
    cardTitle: branch.homeCard?.title ?? branch.name,
    cardShortAddress: branch.homeCard?.shortAddress ?? branch.shortAddress,
    cardMapUrl: branch.homeCard?.mapUrl ?? branch.mapUrl,
  }
}

export async function getHomeContentConfig(): Promise<HomeContentConfig> {
  try {
    const [siteSetting, branches, homeCards] = await Promise.all([
      getSiteSettingRecord(),
      getSupabaseAdminClient()
        .from("Branch")
        .select("id,name,shortAddress,mapUrl,phone,sortOrder")
        .order("sortOrder", { ascending: true }),
      getSupabaseAdminClient().from("HomeBranchCard").select("branchId,title,shortAddress,mapUrl"),
    ])

    throwIfSupabaseError(branches.error, "Sube listesi alinamadi")
    throwIfSupabaseError(homeCards.error, "Ana sayfa kartlari alinamadi")

    const branchRows =
      ((branches.data ?? []) as Array<{
        id: string
        name: string
        shortAddress: string
        mapUrl: string
        phone: string
      }>) ?? []

    const cardByBranchId = new Map(
      ((homeCards.data ?? []) as Array<{
        branchId: string
        title: string
        shortAddress: string
        mapUrl: string
      }>).map((card) => [card.branchId, card]),
    )

    return {
      siteTitle: siteSetting?.siteName ?? "Dondurmacı Zeki",
      slogan: siteSetting?.slogan ?? "",
      logoUrl: siteSetting?.logoUrl ?? "",
      backgroundImageUrl: siteSetting?.backgroundImageUrl ?? "",
      menuButtonText: siteSetting?.menuButtonText ?? "Menuyu Goruntule",
      branchCards: branchRows.map((branch) => ({
        branchId: branch.id,
        title: cardByBranchId.get(branch.id)?.title ?? branch.name,
        shortAddress: cardByBranchId.get(branch.id)?.shortAddress ?? branch.shortAddress,
        mapUrl: cardByBranchId.get(branch.id)?.mapUrl ?? branch.mapUrl,
      })),
      socialLinks: {
        phone: siteSetting?.phone ?? branchRows[0]?.phone ?? "",
        instagram: siteSetting?.instagramUrl ?? "",
        tiktok: siteSetting?.tiktokUrl ?? "",
        whatsapp: siteSetting?.whatsappUrl ?? "",
      },
    }
  } catch (error) {
    if (!shouldUseSupabaseFallback(error)) {
      throw error
    }

    return getFallbackHomeContentConfig()
  }
}

export async function getHomePageContentView(): Promise<HomePageContentView> {
  try {
    const [content, branches] = await Promise.all([
      getHomeContentConfig(),
      getBranchRecordsWithMenus(),
    ])

    return {
      content,
      city: "Sanliurfa",
      branches: branches
        .map(mapMenuBranch)
        .filter((branch): branch is HomePageBranchView => Boolean(branch)),
    }
  } catch (error) {
    if (!shouldUseSupabaseFallback(error)) {
      throw error
    }

    return getFallbackHomePageContentView()
  }
}

export async function getHomeContentEditorConfig(): Promise<HomeContentConfig> {
  return getHomeContentConfig()
}

export async function updateHomeContentConfig(values: HomeContentConfig) {
  const supabase = getSupabaseAdminClient()
  const existing = await getSiteSettingRecord()

  if (existing) {
    const { error } = await supabase
      .from("SiteSetting")
      .update({
        siteName: values.siteTitle,
        slogan: values.slogan,
        description: values.slogan,
        logoUrl: values.logoUrl,
        backgroundImageUrl: values.backgroundImageUrl,
        menuButtonText: values.menuButtonText,
        phone: values.socialLinks.phone,
        instagramUrl: values.socialLinks.instagram,
        tiktokUrl: values.socialLinks.tiktok,
        whatsappUrl: values.socialLinks.whatsapp,
      })
      .eq("id", existing.id)

    throwIfSupabaseError(error, "Site ayarlari guncellenemedi")
  } else {
    const { error } = await supabase.from("SiteSetting").insert({
      siteName: values.siteTitle,
      slogan: values.slogan,
      description: values.slogan,
      logoUrl: values.logoUrl,
      backgroundImageUrl: values.backgroundImageUrl,
      menuButtonText: values.menuButtonText,
      phone: values.socialLinks.phone,
      instagramUrl: values.socialLinks.instagram,
      tiktokUrl: values.socialLinks.tiktok,
      whatsappUrl: values.socialLinks.whatsapp,
    })

    throwIfSupabaseError(error, "Site ayarlari kaydedilemedi")
  }

  await Promise.all(values.branchCards.map((card) => upsertHomeBranchCard(card)))

  return getHomeContentConfig()
}

export async function upsertHomeBranchCard(values: HomeBranchCardContent) {
  const supabase = getSupabaseAdminClient()

  const { data: branch, error: branchError } = await supabase
    .from("Branch")
    .select("sortOrder")
    .eq("id", values.branchId)
    .maybeSingle()

  if (branchError || !branch) {
    return null
  }

  const payload = {
    branchId: values.branchId,
    title: values.title,
    shortAddress: values.shortAddress,
    mapUrl: values.mapUrl,
    sortOrder: branch.sortOrder,
    isActive: true,
  }

  const { data, error } = await supabase
    .from("HomeBranchCard")
    .upsert(payload, {
      onConflict: "branchId",
    })
    .select("*")
    .maybeSingle()

  if (error) {
    return null
  }

  return data
}

export async function removeHomeBranchCard(branchId: string) {
  const supabase = getSupabaseAdminClient()
  await supabase.from("HomeBranchCard").delete().eq("branchId", branchId)
}

import "server-only"

import { getBranchRecords } from "@/data/branches-store"
import { getCatalogManagementData } from "@/data/catalog-store"
import {
  getHomeContentConfig,
  getHomePageContentView,
} from "@/data/home-content-store"
import { getMenuManagementData } from "@/data/menu-management-store"
import type { ActivityItem, AdminDashboardData } from "@/types/admin"

function getLocationLabel(_count: number) {
  return "konum"
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
  }).format(date)
}

function formatShortTime(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function getRelativeTimeLabel(input: string) {
  const date = new Date(input)
  const diffMs = Date.now() - date.getTime()

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return "Şimdi"
  }

  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) {
    return "Şimdi"
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} dk önce`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours} saat önce`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} gün önce`
}

async function buildActivities(): Promise<ActivityItem[]> {
  const [homeContent, homePage, menuData, catalogData, branches] = await Promise.all([
    getHomeContentConfig(),
    getHomePageContentView(),
    getMenuManagementData(),
    getCatalogManagementData(),
    getBranchRecords(),
  ])

  const latestMenu = menuData.menus
    .slice()
    .sort(
      (first, second) =>
        new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime(),
    )[0]

  const densestCategory = catalogData.categories
    .slice()
    .sort((first, second) => second.productCount - first.productCount)[0]

  const visibleLocationCount = homePage.branches.length

  return [
    {
      id: "home-content",
      title: "Ana sayfa yayında",
      description: `${homeContent.siteTitle} ve ${homeContent.socialLinks.phone} ziyaretçilere gösteriliyor.`,
      time: "Şimdi",
      type: "system",
    },
    {
      id: "branch-status",
      title: "Konum durumu güncel",
      description: `${visibleLocationCount} aktif ${getLocationLabel(visibleLocationCount)} yayında görünüyor.`,
      time: "Şimdi",
      type: "system",
    },
    {
      id: "menu-update",
      title: latestMenu ? `${latestMenu.name} menüsü yayında` : "Menü verisi hazır",
      description: latestMenu
        ? `${latestMenu.branchName} için ${latestMenu.categoryCount} kategori ve ${latestMenu.productCount} ürün listeleniyor.`
        : "Henüz menü kaydı bulunmuyor.",
      time: latestMenu ? getRelativeTimeLabel(latestMenu.updatedAt) : "Şimdi",
      type: "menu",
    },
    {
      id: "catalog-status",
      title: densestCategory
        ? `${densestCategory.name} kategori öne çıkıyor`
        : "Katalog özeti hazır",
      description: densestCategory
        ? `${densestCategory.productCount} ürün ile en yoğun kategori olarak görünüyor.`
        : "Kategori ve ürün dağılımı bu bölümde listelenecek.",
      time: "Şimdi",
      type: "product",
    },
  ]
}

function createDashboardFallback(now: Date): AdminDashboardData & {
  currentDateLabel: string
  currentTimeLabel: string
} {
  return {
    brandName: "Dondurmacı Zeki",
    adminName: "Admin",
    currentDateLabel: formatShortDate(now),
    currentTimeLabel: formatShortTime(now),
    stats: [
      {
        id: "active-branches",
        label: "Aktif Konum",
        value: "0",
        change: "Veri bağlantısı bekleniyor",
        tone: "positive",
      },
      {
        id: "active-menus",
        label: "Yayındaki Menü",
        value: "0",
        change: "Veri bağlantısı bekleniyor",
        tone: "accent",
      },
      {
        id: "catalog-coverage",
        label: "Kategori / Ürün",
        value: "0 / 0",
        change: "Veri bağlantısı bekleniyor",
        tone: "neutral",
      },
    ],
    branchTraffic: [],
    weeklyTraffic: [
      { label: "Konum", value: 0 },
      { label: "Aktif", value: 0 },
      { label: "Menü", value: 0 },
      { label: "Kat", value: 0 },
      { label: "Ürün", value: 0 },
      { label: "Logo", value: 0 },
      { label: "Link", value: 0 },
    ],
    recentProducts: [],
    activities: [
      {
        id: "db-waiting",
        title: "Veritabanı bağlantısı bekleniyor",
        description:
          "Dashboard güvenli yedek veri ile açıldı. Bağlantı düzelince canlı veriler geri gelir.",
        time: "Şimdi",
        type: "system",
      },
    ],
    moduleSummaries: {
      menus: {
        title: "Menü Yönetimi",
        description: "Canlı veri geçici olarak okunamadı.",
        items: [{ label: "Durum", value: "Bekleniyor" }],
      },
      qr: {
        title: "QR Menü Oluşturucu",
        description: "Canlı veri geçici olarak okunamadı.",
        items: [{ label: "Durum", value: "Bekleniyor" }],
      },
      home: {
        title: "Ana Sayfa İçerik",
        description: "Canlı veri geçici olarak okunamadı.",
        items: [{ label: "Durum", value: "Bekleniyor" }],
      },
    },
  }
}

export async function getAdminDashboardData(): Promise<AdminDashboardData & {
  currentDateLabel: string
  currentTimeLabel: string
}> {
  const now = new Date()

  try {
    const [homeContent, homePage, branchRecords, menuData, catalogData, activities] =
      await Promise.all([
        getHomeContentConfig(),
        getHomePageContentView(),
        getBranchRecords(),
        getMenuManagementData(),
        getCatalogManagementData(),
        buildActivities(),
      ])

    const visibleBranchIds = new Set(homePage.branches.map((branch) => branch.id))
    const activeBranches = branchRecords.filter((branch) => visibleBranchIds.has(branch.id))
    const activeMenus = menuData.menus.filter((menu) => menu.status === "active")
    const activeProducts = catalogData.products.filter((product) => product.status === "active")

    const branchTraffic = activeBranches.map((branch) => {
      const branchMenu = menuData.menus.find((menu) => menu.branchId === branch.id)
      const branchCategories = catalogData.categories.filter(
        (category) => category.menuId === branchMenu?.id,
      )
      const branchProducts = catalogData.products.filter(
        (product) => product.menuId === branchMenu?.id,
      )

      return {
        branchName: branch.name,
        visits: branchCategories.length,
        scans: branchProducts.length,
        progress: branchProducts.length,
      }
    })

    return {
      brandName: homeContent.siteTitle,
      adminName: "Admin",
      currentDateLabel: formatShortDate(now),
      currentTimeLabel: formatShortTime(now),
      stats: [
        {
          id: "active-branches",
          label: "Aktif Konum",
          value: `${activeBranches.length}`,
          change: `${homePage.branches.length} yayında görünen konum`,
          tone: "positive",
        },
        {
          id: "active-menus",
          label: "Yayındaki Menü",
          value: `${activeMenus.length}`,
          change: `${menuData.menus.length} toplam menü`,
          tone: "accent",
        },
        {
          id: "catalog-coverage",
          label: "Kategori / Ürün",
          value: `${catalogData.categories.length} / ${catalogData.products.length}`,
          change: `${activeProducts.length} aktif ürün`,
          tone: "neutral",
        },
      ],
      branchTraffic,
      weeklyTraffic: [
        { label: "Konum", value: homePage.branches.length || 0 },
        { label: "Aktif", value: activeBranches.length || 0 },
        { label: "Menü", value: menuData.menus.length || 0 },
        { label: "Kat", value: catalogData.categories.length || 0 },
        { label: "Ürün", value: catalogData.products.length || 0 },
        { label: "Logo", value: homeContent.logoUrl ? 1 : 0 },
        { label: "Link", value: 4 },
      ],
      recentProducts: catalogData.products.slice(0, 3).map((product) => ({
        id: product.id,
        name: product.name,
        category: product.categoryName,
        branch: product.menuName,
        price: `${product.price} TL`,
        status: product.status === "active" ? "Aktif" : "Taslak",
      })),
      activities,
      moduleSummaries: {
        menus: {
          title: "Menü Yönetimi",
          description: "Yayındaki menüler ve kategori dağılımı anlık olarak listelenir.",
          items: [
            { label: "Toplam menü", value: `${menuData.menus.length}` },
            { label: "Yayında", value: `${activeMenus.length} menü` },
            { label: "Kategori", value: `${catalogData.categories.length} adet` },
          ],
        },
        qr: {
          title: "QR Menü Oluşturucu",
          description: "QR stüdyosu durumunu takip etmek için canlı özet alanı.",
          items: [
            { label: "Marka başlığı", value: homeContent.siteTitle },
            { label: "Telefon", value: homeContent.socialLinks.phone },
            { label: "TikTok", value: homeContent.socialLinks.tiktok },
          ],
        },
        home: {
          title: "Ana Sayfa İçerik",
          description: "Hero alanı ve sosyal bağlantılar yayındaki veriyle eşleşir.",
          items: [
            { label: "Buton", value: homeContent.menuButtonText },
            { label: "Instagram", value: homeContent.socialLinks.instagram },
            { label: "Kapak", value: homeContent.backgroundImageUrl ? "Hazır" : "Eksik" },
          ],
        },
      },
    }
  } catch {
    return createDashboardFallback(now)
  }
}

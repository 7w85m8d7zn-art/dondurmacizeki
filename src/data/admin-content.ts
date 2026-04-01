import type {
  ActivityItem,
  AdminDashboardData,
  AdminNavItem,
} from "@/types/admin"

export const adminNavigation: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Genel Bakış",
    description: "Genel performans ve akış",
  },
  {
    href: "/admin/menuler",
    label: "Menü Yönetimi",
    description: "Menü atama ve yayın kontrolü",
  },
  {
    href: "/admin/qr-menu-olusturucu",
    label: "QR Kod Stüdyosu",
    description: "Şablon, renk ve çıktı yönetimi",
  },
  {
    href: "/admin/anasayfa-icerik",
    label: "Ana Sayfa İçerik",
    description: "Hero, duyuru ve vitrin alanları",
  },
]

export const adminDashboardData: AdminDashboardData = {
  brandName: "Dondurmacı Zeki",
  adminName: "Zeki Yönetim",
  stats: [
    {
      id: "daily-views",
      label: "Günlük Görüntülenme",
      value: "1.284",
      change: "+12%",
      tone: "positive",
    },
    {
      id: "qr-scans",
      label: "Toplam QR Tarama",
      value: "9.420",
      change: "+18%",
      tone: "accent",
    },
    {
      id: "active-menus",
      label: "Aktif Menü",
      value: "1",
      change: "Karaköprü konumunda yayında",
      tone: "neutral",
    },
    {
      id: "new-comments",
      label: "Son Yorumlar",
      value: "27",
      change: "Bugün 5 yeni yorum",
      tone: "neutral",
    },
  ],
  branchTraffic: [
    {
      branchName: "Karaköprü",
      visits: 1284,
      scans: 885,
      progress: 84,
    },
  ],
  weeklyTraffic: [
    { label: "Pzt", value: 46 },
    { label: "Sal", value: 27 },
    { label: "Çar", value: 22 },
    { label: "Per", value: 25 },
    { label: "Cum", value: 31 },
    { label: "Cmt", value: 48 },
    { label: "Paz", value: 6 },
  ],
  recentProducts: [
    {
      id: "prd-1",
      name: "Badem Krokan Kup",
      category: "Kup Serileri",
      branch: "Karaköprü",
      price: "165 TL",
      status: "Aktif",
    },
    {
      id: "prd-2",
      name: "Özel Künefe Tabağı",
      category: "Künefe Çeşitleri",
      branch: "Karaköprü",
      price: "150 TL",
      status: "Aktif",
    },
    {
      id: "prd-3",
      name: "Soğuk Sahlep",
      category: "Ferah İçecekler",
      branch: "Karaköprü",
      price: "85 TL",
      status: "Taslak",
    },
  ],
  activities: [
    {
      id: "act-1",
      title: "Yeni ürün eklendi",
      description: "Badem Krokan Kup, Karaköprü menüsüne eklendi.",
      time: "8 dk önce",
      type: "product",
    },
    {
      id: "act-2",
      title: "QR şablonu güncellendi",
      description: "Karaköprü için amber tema kenarlık kalınlığı artırıldı.",
      time: "26 dk önce",
      type: "menu",
    },
    {
      id: "act-3",
      title: "Yeni yorum geldi",
      description: "Misafir, menünün hızlı açıldığını ve ürünlerin net göründüğünü belirtti.",
      time: "1 saat önce",
      type: "review",
    },
    {
      id: "act-4",
      title: "Ana sayfa duyurusu değişti",
      description: "Günlük üretim vurgusu hero alanda güncellendi.",
      time: "Bugün",
      type: "system",
    },
  ],
  moduleSummaries: {
    menus: {
      title: "Menü Yönetimi",
      description: "Yayında olan menüleri ve taslak akışlarını kontrol et.",
      items: [
        { label: "Toplam menü", value: "1" },
        { label: "Yayında", value: "1 menü" },
        { label: "Taslak", value: "0 menü" },
      ],
    },
    qr: {
      title: "QR Menü Oluşturucu",
      description: "Şablonları, marka rengini ve çıktı formatlarını yönet.",
      items: [
        { label: "Şablon", value: "5 adet" },
        { label: "Son çıktı", value: "Bugün PNG" },
        { label: "Bekleyen", value: "PDF şablonu" },
      ],
    },
    home: {
      title: "Ana Sayfa İçerik",
      description: "Hero alanını, sloganı ve kart metinlerini düzenle.",
      items: [
        { label: "Yayında", value: "1 hero seti" },
        { label: "Duyuru", value: "2 aktif blok" },
        { label: "Güncelleme", value: "Yarın planlı" },
      ],
    },
  },
}

export function getActivityTone(type: ActivityItem["type"]) {
  switch (type) {
    case "product":
      return "bg-emerald-50 text-emerald-700"
    case "menu":
      return "bg-amber-50 text-amber-700"
    case "review":
      return "bg-sky-50 text-sky-700"
    case "system":
      return "bg-stone-100 text-stone-700"
    default:
      return "bg-stone-100 text-stone-700"
  }
}

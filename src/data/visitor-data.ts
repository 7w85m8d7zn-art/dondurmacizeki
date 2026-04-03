import { buildDondurmaciMenu } from "@/data/dondurmaci-menu"
import type { VisitorData } from "@/types/menu"

export const visitorData: VisitorData = {
  brandName: "Dondurmacı Zeki",
  city: "Şanlıurfa",
  home: {
    title: "Dondurmacı Zeki",
    slogan: "Maraş usulü dondurma ve tatlı servisini sade bir QR deneyimiyle sunuyoruz.",
    description:
      "Şubeni seç, konumu gör ve dondurma, künefe, sütlü tatlı ve içecek menülerini tek dokunuşla incele.",
  },
  branches: [
    {
      id: "branch-karakopru",
      slug: "menu-listesi",
      name: "Karaköprü Şubesi",
      shortAddress: "Diyarbakır Yolu Cad. No:45, Karaköprü",
      fullAddress: "Diyarbakır Yolu Cad. No:45, Karaköprü / Şanlıurfa",
      mapUrl: "https://maps.google.com/?q=Sanliurfa+Karakopru+Diyarbakir+Yolu+45",
      phone: "+90 414 000 00 02",
      serviceNote: "Aile boyu servisler ve ferah kup seçenekleri",
      menu: buildDondurmaciMenu(),
    },
  ],
}

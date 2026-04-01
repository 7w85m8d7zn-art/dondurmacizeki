import { buildDondurmaciMenu } from "@/data/dondurmaci-menu"
import type { VisitorData } from "@/types/menu"

export const visitorData: VisitorData = {
  brandName: "Dondurmacı Zeki",
  city: "Sanliurfa",
  home: {
    title: "Dondurmacı Zeki",
    slogan: "Maras usulu dondurma ve tatli servisini sade bir QR deneyimiyle sunuyoruz.",
    description:
      "Subeni sec, konumu gor ve dondurma, kunefe, sutlu tatli ve icecek menulerini tek dokunusla incele.",
  },
  branches: [
    {
      id: "branch-karakopru",
      slug: "menu-listesi",
      name: "Karakopru Subesi",
      shortAddress: "Diyarbakir Yolu Cad. No:45, Karakopru",
      fullAddress: "Diyarbakir Yolu Cad. No:45, Karakopru / Sanliurfa",
      mapUrl: "https://maps.google.com/?q=Sanliurfa+Karakopru+Diyarbakir+Yolu+45",
      phone: "+90 414 000 00 02",
      serviceNote: "Aile boyu servisler ve ferah kup secenekleri",
      menu: buildDondurmaciMenu(),
    },
  ],
}

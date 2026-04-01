import type { Menu } from "@/types/menu"

const karakopruMenu: Menu = {
  id: "menu-karakopru",
  name: "Karakopru Menusu",
  description:
    "Aile boyu servisler, kup dondurmalar ve tatli eslikleriyle hazirlanan sube menusu.",
  categories: [
    {
      id: "karakopru-dondurmalar",
      name: "Dondurmalar",
      description: "Kaymakli ve meyveli dondurma secenekleri.",
      products: [
        {
          id: "karakopru-kaymakli-dondurma",
          name: "Kaymakli Dondurma",
          description: "Kaymak aromasi belirgin, yumusak dokulu secim.",
          price: 105,
          imageUrl:
            "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=1200&q=80",
          isActive: true,
        },
        {
          id: "karakopru-meyveli-kup",
          name: "Meyveli Kup Dondurma",
          description: "Cilek, muz ve cikolata sosla katmanli sunum.",
          price: 145,
          imageUrl:
            "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=1200&q=80",
          isActive: true,
        },
      ],
    },
    {
      id: "karakopru-kunefeler",
      name: "Kunefeler",
      description: "Paylasima uygun sicak tatli secenekleri.",
      products: [
        {
          id: "karakopru-ozel-kunefe",
          name: "Ozel Kunefe Tabagi",
          description: "Bol fistikli ve dondurma eslikli premium tabak.",
          price: 150,
          imageUrl:
            "https://images.unsplash.com/photo-1617196039897-fc7dcad7d0b9?auto=format&fit=crop&w=1200&q=80",
          isActive: true,
        },
        {
          id: "karakopru-cifte-peynirli-kunefe",
          name: "Cifte Peynirli Kunefe",
          description: "Daha yogun peynir dokulu sicak servis.",
          price: 160,
          imageUrl:
            "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=1200&q=80",
          isActive: true,
        },
      ],
    },
    {
      id: "karakopru-sutlu-tatlilar",
      name: "Sutlu Tatlilar",
      description: "Serin servis edilen hafif tatlilar.",
      products: [
        {
          id: "karakopru-supangle",
          name: "Supangle",
          description: "Yogun kakao dokulu serin sutlu tatli.",
          price: 92,
          imageUrl:
            "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=1200&q=80",
          isActive: true,
        },
        {
          id: "karakopru-profiterol",
          name: "Profiterol Kase",
          description: "Mini hamur toplari ve akiskan cikolata sos ile servis.",
          price: 98,
          imageUrl:
            "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
          isActive: true,
        },
      ],
    },
    {
      id: "karakopru-icecekler",
      name: "Icecekler",
      description: "Serinletici ve menuyu tamamlayan icecek secenekleri.",
      products: [
        {
          id: "karakopru-naneli-ayran",
          name: "Naneli Ayran",
          description: "Ferahlatici nane dokunusuyla geleneksel ayran.",
          price: 55,
          imageUrl:
            "https://images.unsplash.com/photo-1553531889-56cc480ac5cb?auto=format&fit=crop&w=1200&q=80",
          isActive: true,
        },
        {
          id: "karakopru-soda-limon",
          name: "Soda Limon",
          description: "Hafif ve ferah bir eslikci secenek.",
          price: 45,
          imageUrl:
            "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80",
          isActive: true,
        },
      ],
    },
  ],
}

export function buildDondurmaciMenu(): Menu {
  return karakopruMenu
}

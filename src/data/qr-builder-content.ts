import { visitorData } from "@/data/visitor-content"
import type { QrBuilderData } from "@/types/qr-builder"

export const qrBuilderData: QrBuilderData = {
  brandName: visitorData.brandName,
  branches: visitorData.branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    slug: branch.slug,
    menuId: branch.menu.id,
    menuName: branch.menu.name,
  })),
  templates: [
    {
      id: "amber-premium",
      name: "Amber Premium",
      backgroundColor: "#fff8ef",
      qrBackgroundColor: "#ffffff",
      textColor: "#1c1917",
      accentColor: "#d97706",
      frameThickness: 10,
      cornerRadius: 32,
    },
    {
      id: "stone-classic",
      name: "Stone Classic",
      backgroundColor: "#f5f5f4",
      qrBackgroundColor: "#ffffff",
      textColor: "#0c0a09",
      accentColor: "#44403c",
      frameThickness: 8,
      cornerRadius: 26,
    },
    {
      id: "cream-delight",
      name: "Cream Delight",
      backgroundColor: "#fffaf5",
      qrBackgroundColor: "#fff7ed",
      textColor: "#292524",
      accentColor: "#ea580c",
      frameThickness: 12,
      cornerRadius: 36,
    },
  ],
}

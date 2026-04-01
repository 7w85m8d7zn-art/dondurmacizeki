import { z } from "zod"

export const homeBranchCardSchema = z.object({
  branchId: z.string().min(1),
  title: z.string().min(2, "Sube basligi en az 2 karakter olmali."),
  shortAddress: z.string().min(5, "Kisa adres en az 5 karakter olmali."),
  mapUrl: z.url("Konum linki gecerli bir URL olmali."),
})

export const homeContentSchema = z.object({
  siteTitle: z.string().min(2, "Site basligi en az 2 karakter olmali."),
  slogan: z.string().min(4, "Slogan en az 4 karakter olmali."),
  logoUrl: z.url("Logo icin gecerli bir URL girin."),
  backgroundImageUrl: z.url("Arka plan gorseli icin gecerli bir URL girin."),
  menuButtonText: z.string().min(2, "Buton metni en az 2 karakter olmali."),
  branchCards: z.array(homeBranchCardSchema).min(1),
  socialLinks: z.object({
    phone: z.string().min(7, "Telefon en az 7 karakter olmali.").max(32),
    instagram: z.url("Instagram linki gecerli olmali."),
    tiktok: z.url("TikTok linki gecerli olmali."),
    whatsapp: z.url("WhatsApp linki gecerli olmali."),
  }),
})

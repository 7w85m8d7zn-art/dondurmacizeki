import { z } from "zod"

export const entityStatusSchema = z.enum(["active", "passive"])

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, "Kategori adi en az 2 karakter olmali.")
    .max(80, "Kategori adi en fazla 80 karakter olabilir."),
  description: z
    .string()
    .min(8, "Aciklama en az 8 karakter olmali.")
    .max(220, "Aciklama en fazla 220 karakter olabilir."),
  sortOrder: z
    .number()
    .int("Siralama tam sayi olmalidir.")
    .min(0, "Siralama 0 veya daha buyuk olmali.")
    .max(999, "Siralama en fazla 999 olabilir."),
  status: entityStatusSchema,
  menuId: z.string().min(1, "Lutfen bir menu secin."),
})

export const productFormSchema = z.object({
  name: z
    .string()
    .min(2, "Urun adi en az 2 karakter olmali.")
    .max(90, "Urun adi en fazla 90 karakter olabilir."),
  description: z
    .string()
    .min(10, "Aciklama en az 10 karakter olmali.")
    .max(260, "Aciklama en fazla 260 karakter olabilir."),
  price: z
    .number()
    .min(0, "Fiyat 0 veya daha buyuk olmali.")
    .max(9999, "Fiyat en fazla 9999 olabilir."),
  imageUrl: z.url("Lutfen gecerli bir gorsel linki girin."),
  sortOrder: z
    .number()
    .int("Siralama tam sayi olmalidir.")
    .min(0, "Siralama 0 veya daha buyuk olmali.")
    .max(999, "Siralama en fazla 999 olabilir."),
  status: entityStatusSchema,
  categoryId: z.string().min(1, "Lutfen bir kategori secin."),
})

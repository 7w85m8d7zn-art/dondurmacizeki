import { z } from "zod"

import { slugify } from "@/lib/slugify"

export const menuStatusSchema = z.enum(["active", "passive"])

export const menuFormSchema = z.object({
  name: z
    .string()
    .min(3, "Menu adi en az 3 karakter olmali.")
    .max(80, "Menu adi en fazla 80 karakter olabilir."),
  description: z
    .string()
    .min(10, "Aciklama en az 10 karakter olmali.")
    .max(240, "Aciklama en fazla 240 karakter olabilir."),
  coverImageUrl: z
    .string()
    .min(1, "Kapak gorseli gereklidir."),
  slug: z
    .string()
    .min(3, "Slug en az 3 karakter olmali.")
    .max(100, "Slug en fazla 100 karakter olabilir.")
    .transform((value) => slugify(value))
    .refine((value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), {
      message: "Slug sadece kucuk harf, rakam ve tire icermelidir.",
    }),
  branchId: z.string().min(1, "Lutfen bir sube secin."),
  status: menuStatusSchema,
  sortOrder: z
    .number()
    .int("Siralama tam sayi olmalidir.")
    .min(0, "Siralama 0 veya daha buyuk olmali.")
    .max(999, "Siralama en fazla 999 olabilir."),
})

export const menuCreateSchema = menuFormSchema

export const menuUpdateSchema = menuFormSchema.partial().extend({
  name: menuFormSchema.shape.name,
  description: menuFormSchema.shape.description,
  coverImageUrl: menuFormSchema.shape.coverImageUrl,
  slug: menuFormSchema.shape.slug,
  branchId: menuFormSchema.shape.branchId,
  status: menuFormSchema.shape.status,
  sortOrder: menuFormSchema.shape.sortOrder,
})

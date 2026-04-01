import { z } from "zod"

import { slugify } from "@/lib/slugify"

export const branchStatusSchema = z.enum(["active", "passive"])

export const branchFormSchema = z.object({
  name: z.string().min(3, "Sube adi en az 3 karakter olmali.").max(80),
  slug: z
    .string()
    .min(3, "Slug en az 3 karakter olmali.")
    .max(100)
    .transform((value) => slugify(value))
    .refine((value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), {
      message: "Slug sadece kucuk harf, rakam ve tire icermelidir.",
    }),
  shortAddress: z.string().min(5, "Kisa adres en az 5 karakter olmali.").max(140),
  fullAddress: z.string().min(10, "Tam adres en az 10 karakter olmali.").max(220),
  mapUrl: z.url("Konum baglantisi gecerli bir URL olmali."),
  phone: z.string().min(7, "Telefon en az 7 karakter olmali.").max(32),
  serviceNote: z.string().min(4, "Servis notu en az 4 karakter olmali.").max(180),
  status: branchStatusSchema,
  sortOrder: z.number().int().min(0).max(999),
})

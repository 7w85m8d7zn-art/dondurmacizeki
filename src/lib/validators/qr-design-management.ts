import { z } from "zod"

export const qrDesignSchema = z.object({
  branchId: z.string().min(1, "Sube secimi zorunludur."),
  menuId: z.string().min(1, "Menu secimi zorunludur."),
  generatedUrl: z.url("QR URL gecerli bir adres olmali."),
  title: z.string().min(2).max(80),
  subtitle: z.string().min(2).max(160),
  showLogo: z.boolean(),
  showIcon: z.boolean(),
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  qrBackgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  frameThickness: z.number().int().min(0).max(32),
  cornerRadius: z.number().int().min(0).max(64),
  templateId: z.string().min(1),
  logoUrl: z.url("Logo URL gecerli olmali."),
  isActive: z.boolean(),
})

import { revalidatePath } from "next/cache"

import { badRequest, handleApiRequest, successResponse } from "@/lib/api-response"
import { categoryFormSchema } from "@/lib/validators/catalog-management"
import {
  deleteCategoryRecord,
  updateCategoryRecord,
} from "@/server/services/catalog-service"

interface CategoryRouteContext {
  params: Promise<{
    categoryId: string
  }>
}

export async function PATCH(request: Request, context: CategoryRouteContext) {
  return handleApiRequest(async () => {
    const { categoryId } = await context.params
    const payload = await request.json()
    const parsed = categoryFormSchema.safeParse(payload)

    if (!parsed.success) {
      throw badRequest("Kategori formu gecersiz.", parsed.error.flatten())
    }

    const updated = await updateCategoryRecord(categoryId, parsed.data)
    revalidatePath("/menu-listesi")
    revalidatePath("/admin/menuler")

    return successResponse(updated, {
      message: "Kategori guncellendi.",
    })
  })
}

export async function DELETE(_: Request, context: CategoryRouteContext) {
  return handleApiRequest(async () => {
    const { categoryId } = await context.params
    const deleted = await deleteCategoryRecord(categoryId)
    revalidatePath("/menu-listesi")
    revalidatePath("/admin/menuler")

    return successResponse(deleted, {
      message: "Kategori ve bagli urunler silindi.",
    })
  })
}

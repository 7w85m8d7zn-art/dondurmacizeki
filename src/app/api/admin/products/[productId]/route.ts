import { revalidatePath } from "next/cache"

import { badRequest, handleApiRequest, successResponse } from "@/lib/api-response"
import { productFormSchema } from "@/lib/validators/catalog-management"
import {
  deleteProductRecord,
  updateProductRecord,
} from "@/server/services/catalog-service"

interface ProductRouteContext {
  params: Promise<{
    productId: string
  }>
}

export async function PATCH(request: Request, context: ProductRouteContext) {
  return handleApiRequest(async () => {
    const { productId } = await context.params
    const payload = await request.json()
    const parsed = productFormSchema.safeParse(payload)

    if (!parsed.success) {
      throw badRequest("Urun formu gecersiz.", parsed.error.flatten())
    }

    const updated = await updateProductRecord(productId, parsed.data)
    revalidatePath("/menu-listesi")
    revalidatePath("/admin/menuler")

    return successResponse(updated, {
      message: "Urun guncellendi.",
    })
  })
}

export async function DELETE(_: Request, context: ProductRouteContext) {
  return handleApiRequest(async () => {
    const { productId } = await context.params
    const deleted = await deleteProductRecord(productId)
    revalidatePath("/menu-listesi")
    revalidatePath("/admin/menuler")

    return successResponse(deleted, {
      message: "Urun silindi.",
    })
  })
}

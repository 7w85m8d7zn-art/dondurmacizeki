import { revalidatePath } from "next/cache"

import { badRequest, handleApiRequest, successResponse } from "@/lib/api-response"
import { menuUpdateSchema } from "@/lib/validators/menu-management"
import {
  deleteMenuCascade,
  getMenuRecord,
  updateMenuRecord,
} from "@/server/services/menu-service"

interface RouteContext {
  params: Promise<{
    menuId: string
  }>
}

export async function GET(_: Request, context: RouteContext) {
  return handleApiRequest(async () => {
    const { menuId } = await context.params
    return successResponse(await getMenuRecord(menuId))
  })
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleApiRequest(async () => {
    const { menuId } = await context.params
    const payload = await request.json()
    const parsed = menuUpdateSchema.safeParse(payload)

    if (!parsed.success) {
      throw badRequest(
        parsed.error.issues[0]?.message ?? "Form verileri geçersiz.",
        parsed.error.flatten(),
      )
    }

    const updated = await updateMenuRecord(menuId, parsed.data)
    revalidatePath("/menu-listesi")
    revalidatePath("/admin/menuler")

    return successResponse(updated, {
      message: "Menü güncellendi.",
    })
  })
}

export async function DELETE(_: Request, context: RouteContext) {
  return handleApiRequest(async () => {
    const { menuId } = await context.params
    const deleted = await deleteMenuCascade(menuId)
    revalidatePath("/menu-listesi")
    revalidatePath("/admin/menuler")

    return successResponse(deleted, {
      message: "Menü ve bağlı veriler silindi.",
    })
  })
}

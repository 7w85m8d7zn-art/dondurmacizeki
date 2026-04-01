import { revalidatePath } from "next/cache"

import { handleApiRequest, successResponse } from "@/lib/api-response"
import { toggleMenuRecord } from "@/server/services/menu-service"

interface ToggleRouteContext {
  params: Promise<{
    menuId: string
  }>
}

export async function POST(_: Request, context: ToggleRouteContext) {
  return handleApiRequest(async () => {
    const { menuId } = await context.params
    const updated = await toggleMenuRecord(menuId)
    revalidatePath("/menu-listesi")
    revalidatePath("/admin/menuler")

    return successResponse(updated, {
      message: "Menu durumu guncellendi.",
    })
  })
}

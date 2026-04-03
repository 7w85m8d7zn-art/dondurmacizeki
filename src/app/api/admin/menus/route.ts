import { revalidatePath } from "next/cache"

import { badRequest, handleApiRequest, successResponse } from "@/lib/api-response"
import { menuCreateSchema } from "@/lib/validators/menu-management"
import { createMenuRecord, listMenus } from "@/server/services/menu-service"

export async function GET() {
  return handleApiRequest(async () => successResponse(await listMenus()))
}

export async function POST(request: Request) {
  return handleApiRequest(async () => {
    const payload = await request.json()
    const parsed = menuCreateSchema.safeParse(payload)

    if (!parsed.success) {
      throw badRequest(
        parsed.error.issues[0]?.message ?? "Form verileri geçersiz.",
        parsed.error.flatten(),
      )
    }

    const created = await createMenuRecord(parsed.data)
    revalidatePath("/menu-listesi")
    revalidatePath("/admin/menuler")

    return successResponse(created, {
      status: 201,
      message: "Menü oluşturuldu.",
    })
  })
}

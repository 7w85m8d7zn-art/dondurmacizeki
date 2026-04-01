import { revalidatePath } from "next/cache"

import { badRequest, handleApiRequest, successResponse } from "@/lib/api-response"
import { productFormSchema } from "@/lib/validators/catalog-management"
import {
  createProductRecord,
  listCatalog,
} from "@/server/services/catalog-service"

export async function GET() {
  return handleApiRequest(async () => successResponse(await listCatalog()))
}

export async function POST(request: Request) {
  return handleApiRequest(async () => {
    const payload = await request.json()
    const parsed = productFormSchema.safeParse(payload)

    if (!parsed.success) {
      throw badRequest("Urun formu gecersiz.", parsed.error.flatten())
    }

    const created = await createProductRecord(parsed.data)
    revalidatePath("/menu-listesi")
    revalidatePath("/admin/menuler")

    return successResponse(created, {
      status: 201,
      message: "Urun olusturuldu.",
    })
  })
}

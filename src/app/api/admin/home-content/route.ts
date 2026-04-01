import { badRequest, handleApiRequest, successResponse } from "@/lib/api-response"
import { homeContentSchema } from "@/lib/validators/home-content-management"
import { revalidatePath } from "next/cache"
import {
  getHomeContentRecord,
  updateHomeContentRecord,
} from "@/server/services/home-content-service"

export async function GET() {
  return handleApiRequest(async () => successResponse(await getHomeContentRecord()))
}

export async function PATCH(request: Request) {
  return handleApiRequest(async () => {
    const payload = await request.json()
    const parsed = homeContentSchema.safeParse(payload)

    if (!parsed.success) {
      throw badRequest("Ana sayfa formu gecersiz.", parsed.error.flatten())
    }

    const updatedRecord = await updateHomeContentRecord(parsed.data)

    revalidatePath("/")
    revalidatePath("/admin/anasayfa-icerik")

    return successResponse(updatedRecord, {
      message: "Ana sayfa icerigi guncellendi.",
    })
  })
}

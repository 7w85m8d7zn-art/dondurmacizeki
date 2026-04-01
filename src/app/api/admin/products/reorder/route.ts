import { z } from "zod"

import { badRequest, handleApiRequest, successResponse } from "@/lib/api-response"
import { reorderProductRecords } from "@/server/services/catalog-service"

const reorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
})

export async function POST(request: Request) {
  return handleApiRequest(async () => {
    const payload = await request.json()
    const parsed = reorderSchema.safeParse(payload)

    if (!parsed.success) {
      throw badRequest("Siralama verisi gecersiz.", parsed.error.flatten())
    }

    return successResponse(await reorderProductRecords(parsed.data.orderedIds), {
      message: "Urun siralamasi guncellendi.",
    })
  })
}

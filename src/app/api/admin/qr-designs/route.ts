import { badRequest, handleApiRequest, successResponse } from "@/lib/api-response"
import { qrDesignSchema } from "@/lib/validators/qr-design-management"
import {
  createQrDesignRecord,
  listQrDesigns,
} from "@/server/services/qr-design-service"

export async function GET() {
  return handleApiRequest(async () => successResponse(await listQrDesigns()))
}

export async function POST(request: Request) {
  return handleApiRequest(async () => {
    const payload = await request.json()
    const parsed = qrDesignSchema.safeParse(payload)

    if (!parsed.success) {
      throw badRequest("QR tasarim formu gecersiz.", parsed.error.flatten())
    }

    return successResponse(await createQrDesignRecord(parsed.data), {
      status: 201,
      message: "QR tasarimi olusturuldu.",
    })
  })
}

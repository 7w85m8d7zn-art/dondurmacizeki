import { badRequest, handleApiRequest, successResponse } from "@/lib/api-response"
import { qrDesignSchema } from "@/lib/validators/qr-design-management"
import {
  deleteQrDesignRecord,
  getQrDesignRecord,
  updateQrDesignRecord,
} from "@/server/services/qr-design-service"

interface QrDesignRouteContext {
  params: Promise<{
    designId: string
  }>
}

export async function GET(_: Request, context: QrDesignRouteContext) {
  return handleApiRequest(async () => {
    const { designId } = await context.params
    return successResponse(await getQrDesignRecord(designId))
  })
}

export async function PATCH(request: Request, context: QrDesignRouteContext) {
  return handleApiRequest(async () => {
    const { designId } = await context.params
    const payload = await request.json()
    const parsed = qrDesignSchema.safeParse(payload)

    if (!parsed.success) {
      throw badRequest("QR tasarım formu geçersiz.", parsed.error.flatten())
    }

    return successResponse(await updateQrDesignRecord(designId, parsed.data), {
      message: "QR tasarımı güncellendi.",
    })
  })
}

export async function DELETE(_: Request, context: QrDesignRouteContext) {
  return handleApiRequest(async () => {
    const { designId } = await context.params
    return successResponse(await deleteQrDesignRecord(designId), {
      message: "QR tasarımı silindi.",
    })
  })
}

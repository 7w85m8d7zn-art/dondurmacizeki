import { handleApiRequest, successResponse, unauthorized } from "@/lib/api-response"
import { getAdminSession } from "@/lib/auth"

export async function GET() {
  return handleApiRequest(async () => {
    const session = await getAdminSession()

    if (!session) {
      throw unauthorized("Aktif admin oturumu bulunamadi.")
    }

    return successResponse(session)
  })
}

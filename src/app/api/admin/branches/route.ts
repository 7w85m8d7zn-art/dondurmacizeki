import { badRequest, handleApiRequest, successResponse } from "@/lib/api-response"
import { branchFormSchema } from "@/lib/validators/branch-management"
import {
  createBranchRecord,
  listBranches,
} from "@/server/services/branch-service"

export async function GET() {
  return handleApiRequest(async () => successResponse(await listBranches()))
}

export async function POST(request: Request) {
  return handleApiRequest(async () => {
    const payload = await request.json()
    const parsed = branchFormSchema.safeParse(payload)

    if (!parsed.success) {
      throw badRequest("Sube formu gecersiz.", parsed.error.flatten())
    }

    return successResponse(await createBranchRecord(parsed.data), {
      status: 201,
      message: "Sube olusturuldu.",
    })
  })
}

import { badRequest, handleApiRequest, successResponse } from "@/lib/api-response"
import { branchFormSchema } from "@/lib/validators/branch-management"
import {
  deleteBranchCascade,
  getBranchDetail,
  updateBranchRecord,
} from "@/server/services/branch-service"

interface BranchRouteContext {
  params: Promise<{
    branchId: string
  }>
}

export async function GET(_: Request, context: BranchRouteContext) {
  return handleApiRequest(async () => {
    const { branchId } = await context.params
    return successResponse(await getBranchDetail(branchId))
  })
}

export async function PATCH(request: Request, context: BranchRouteContext) {
  return handleApiRequest(async () => {
    const { branchId } = await context.params
    const payload = await request.json()
    const parsed = branchFormSchema.safeParse(payload)

    if (!parsed.success) {
      throw badRequest("Sube formu gecersiz.", parsed.error.flatten())
    }

    return successResponse(await updateBranchRecord(branchId, parsed.data), {
      message: "Sube guncellendi.",
    })
  })
}

export async function DELETE(_: Request, context: BranchRouteContext) {
  return handleApiRequest(async () => {
    const { branchId } = await context.params
    return successResponse(await deleteBranchCascade(branchId), {
      message: "Sube ve bagli veriler silindi.",
    })
  })
}

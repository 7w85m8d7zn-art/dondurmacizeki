import { NextResponse } from "next/server"

import { ApiError, isApiError } from "@/lib/api-error"

export interface ApiSuccessResponse<T> {
  success: true
  message?: string
  data: T
}

export interface ApiErrorResponse {
  success: false
  message: string
  code?: string
  errors?: unknown
}

export function successResponse<T>(
  data: T,
  options?: {
    status?: number
    message?: string
  },
) {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(options?.message ? { message: options.message } : {}),
  }

  return NextResponse.json(payload, { status: options?.status ?? 200 })
}

export function errorResponse(error: unknown) {
  if (isApiError(error)) {
    const payload: ApiErrorResponse = {
      success: false,
      message: error.message,
      code: error.code,
      ...(error.details ? { errors: error.details } : {}),
    }

    return NextResponse.json(payload, { status: error.statusCode })
  }

  const fallback = new ApiError("Beklenmeyen bir hata olustu.", {
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
  })

  return NextResponse.json(
    {
      success: false,
      message: fallback.message,
      code: fallback.code,
    } satisfies ApiErrorResponse,
    { status: fallback.statusCode },
  )
}

export async function handleApiRequest<T>(handler: () => Promise<T> | T) {
  try {
    return await handler()
  } catch (error) {
    return errorResponse(error)
  }
}

export function notFound(message: string) {
  return new ApiError(message, {
    statusCode: 404,
    code: "NOT_FOUND",
  })
}

export function badRequest(message: string, details?: unknown) {
  return new ApiError(message, {
    statusCode: 400,
    code: "BAD_REQUEST",
    details,
  })
}

export function conflict(message: string, details?: unknown) {
  return new ApiError(message, {
    statusCode: 409,
    code: "CONFLICT",
    details,
  })
}

export function unauthorized(message: string, details?: unknown) {
  return new ApiError(message, {
    statusCode: 401,
    code: "UNAUTHORIZED",
    details,
  })
}

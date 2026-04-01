export class ApiError extends Error {
  statusCode: number
  code: string
  details?: unknown

  constructor(
    message: string,
    options?: {
      statusCode?: number
      code?: string
      details?: unknown
    },
  ) {
    super(message)
    this.name = "ApiError"
    this.statusCode = options?.statusCode ?? 500
    this.code = options?.code ?? "INTERNAL_SERVER_ERROR"
    this.details = options?.details
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

import { NextResponse } from "next/server"
import { z } from "zod"

import { badRequest, unauthorized } from "@/lib/api-response"
import { authenticateAdmin } from "@/lib/auth-admin"
import {
  createSessionToken,
  getSessionCookieName,
  getSessionDurationSeconds,
} from "@/lib/auth"

const loginSchema = z.object({
  email: z.email("Gecerli bir email girin."),
  password: z
    .string()
    .min(8, "Sifre en az 8 karakter olmali.")
    .max(128, "Sifre en fazla 128 karakter olabilir."),
})

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = loginSchema.safeParse(payload)

    if (!parsed.success) {
      throw badRequest("Giris bilgileri gecersiz.", parsed.error.flatten())
    }

    const user = await authenticateAdmin(parsed.data.email, parsed.data.password)

    if (!user) {
      throw unauthorized("Email veya sifre hatali.")
    }

    const token = await createSessionToken(user)
    const response = NextResponse.json({
      success: true,
      message: "Giris basarili.",
      data: user,
    })

    response.cookies.set({
      name: getSessionCookieName(),
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: getSessionDurationSeconds(),
    })

    return response
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      const apiError = error as Error & {
        statusCode: number
        code?: string
        details?: unknown
      }

      return NextResponse.json(
        {
          success: false,
          message: apiError.message,
          code: apiError.code,
          ...(apiError.details ? { errors: apiError.details } : {}),
        },
        { status: apiError.statusCode },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Beklenmeyen bir hata olustu.",
      },
      { status: 500 },
    )
  }
}

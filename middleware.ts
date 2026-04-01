import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { AUTH_HOME_PATH, AUTH_LOGIN_PATH } from "@/lib/auth-constants"
import { getSessionCookieName, verifySessionToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const sessionToken = request.cookies.get(getSessionCookieName())?.value
  const session = sessionToken ? await verifySessionToken(sessionToken) : null

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL(AUTH_LOGIN_PATH, request.url)
      loginUrl.searchParams.set("redirect", `${pathname}${search}`)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (pathname.startsWith("/api/admin")) {
    if (!session) {
      return NextResponse.json({ message: "Yetkisiz erisim." }, { status: 401 })
    }
  }

  if (pathname === AUTH_LOGIN_PATH && session) {
    return NextResponse.redirect(new URL(AUTH_HOME_PATH, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/giris"],
}

import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"

import type { AdminSessionUser } from "@/types/auth"

const SESSION_COOKIE_NAME = "dz_admin_session"
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7

function getAuthSecret() {
  const configuredSecret = process.env.AUTH_SECRET?.trim()

  if (configuredSecret) {
    return new TextEncoder().encode(configuredSecret)
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET production ortaminda zorunludur.")
  }

  return new TextEncoder().encode("dondurmaci-zeki-dev-secret-change-me")
}

export async function createSessionToken(user: AdminSessionUser) {
  const now = Math.floor(Date.now() / 1000)

  return new SignJWT({ role: user.role, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.email)
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_DURATION_SECONDS)
    .sign(getAuthSecret())
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret())

    if (
      typeof payload.sub !== "string" ||
      typeof payload.name !== "string" ||
      payload.role !== "admin"
    ) {
      return null
    }

    return {
      email: payload.sub,
      name: payload.name,
      role: "admin" as const,
    }
  } catch {
    return null
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return verifySessionToken(token)
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME
}

export function getSessionDurationSeconds() {
  return SESSION_DURATION_SECONDS
}

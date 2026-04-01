import "server-only"

import type { PostgrestError } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export function getSupabaseAdminClient() {
  return createSupabaseServerClient()
}

export function throwIfSupabaseError(
  error: PostgrestError | null,
  context: string,
) {
  if (!error) {
    return
  }

  const message = error.message.toLowerCase()

  if (message.includes("could not find the table") || message.includes("schema cache")) {
    throw new Error(
      `${context}: Supabase tablolari Data API tarafinda gorunmuyor. SQL Editor'de once supabase/schema.sql calistirin ve Settings > API > Exposed schemas icinde public secili oldugunu kontrol edin. seed.sql sadece ornek veri icindir (tekrar calisirsa urunler geri gelebilir). Orijinal hata: ${error.message}`,
    )
  }

  throw new Error(`${context}: ${error.message}`)
}

export function isSupabaseConnectionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }

  const message = error.message.toLowerCase()

  return (
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("econnreset") ||
    message.includes("econnrefused") ||
    message.includes("enotfound") ||
    message.includes("timed out") ||
    message.includes("can't reach database server")
  )
}

function isContentFallbackEnabled() {
  const value = process.env.ENABLE_CONTENT_FALLBACK?.trim().toLowerCase()
  return value === "true" || value === "1"
}

export function shouldUseSupabaseFallback(error: unknown) {
  return isContentFallbackEnabled() && isSupabaseConnectionError(error)
}

export function toNumberValue(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  return 0
}

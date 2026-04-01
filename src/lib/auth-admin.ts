import { scryptSync, timingSafeEqual } from "node:crypto"

const DEFAULT_ADMIN_EMAIL = "admin@dondurmacizeki.com"
const DEFAULT_ADMIN_NAME = "Zeki Admin"
const DEFAULT_ADMIN_PASSWORD_HASH =
  "scrypt:d036312dfd7bed6c1cb7513ead8ff976:c98669d86c2d7e1229ff7c66aa2aa6787c434382a6fcdeba67dba998995c684bf61283f14aa342b8961c39d260bcc54d5239e73382ded8c13f8c925b29359926"

function getAdminCredentials() {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim()
  const configuredPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim()

  if (process.env.NODE_ENV === "production") {
    if (!configuredEmail || !configuredPasswordHash) {
      throw new Error(
        "Production icin ADMIN_EMAIL ve ADMIN_PASSWORD_HASH degiskenleri zorunludur.",
      )
    }
  }

  return {
    email: configuredEmail ?? DEFAULT_ADMIN_EMAIL,
    name: process.env.ADMIN_NAME ?? DEFAULT_ADMIN_NAME,
    passwordHash: configuredPasswordHash ?? DEFAULT_ADMIN_PASSWORD_HASH,
  }
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(":")

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false
  }

  const derivedKey = scryptSync(password, salt, 64)
  const hashBuffer = Buffer.from(hash, "hex")

  if (derivedKey.length !== hashBuffer.length) {
    return false
  }

  return timingSafeEqual(derivedKey, hashBuffer)
}

export async function authenticateAdmin(email: string, password: string) {
  const admin = getAdminCredentials()

  if (email.toLowerCase().trim() !== admin.email.toLowerCase()) {
    return null
  }

  const isValid = verifyPassword(password, admin.passwordHash)

  if (!isValid) {
    return null
  }

  return {
    email: admin.email,
    name: admin.name,
    role: "admin" as const,
  }
}

export function getDefaultAdminInfo() {
  const admin = getAdminCredentials()

  return {
    email: admin.email,
    passwordHint: "ZekiAdmin123!",
  }
}

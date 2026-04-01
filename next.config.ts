import type { NextConfig } from "next"

function resolveAllowedDevOrigins() {
  const values = process.env.ALLOWED_DEV_ORIGINS?.split(",") ?? []

  return values.map((value) => value.trim()).filter(Boolean)
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: resolveAllowedDevOrigins(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig

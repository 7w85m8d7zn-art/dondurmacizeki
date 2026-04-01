import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Dondurmacı Zeki",
  description: "Dondurmacı Zeki icin modern, premium ve mobil odakli QR menu deneyimi.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="tr"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full bg-[var(--page-background)] text-stone-950">
        <div className="relative flex min-h-screen flex-col overflow-x-clip">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.22),transparent_45%)]" />
          <div className="pointer-events-none absolute inset-y-0 right-[-8rem] w-[22rem] bg-[radial-gradient(circle,rgba(251,191,36,0.08),transparent_65%)] blur-3xl" />
          {children}
        </div>
      </body>
    </html>
  )
}

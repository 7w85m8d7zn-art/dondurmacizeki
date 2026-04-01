"use client"

import { usePathname } from "next/navigation"

import { AdminShell } from "@/components/admin/admin-shell"

const pageMeta: Record<string, { title: string; description: string }> = {
  "/admin": {
    title: "Dashboard",
    description:
      "Günlük performansı, QR hareketlerini ve operasyon akışını tek ekranda takip et.",
  },
  "/admin/menuler": {
    title: "Menü Yönetimi",
    description:
      "Konum bazlı menülerin yayın durumunu ve kategori yapısını kontrol et.",
  },
  "/admin/qr-menu-olusturucu": {
    title: "QR Menü Oluşturucu",
    description:
      "QR tasarımlarını marka kimliğine uygun şekilde oluştur ve dağıt.",
  },
  "/admin/anasayfa-icerik": {
    title: "Ana Sayfa İçerik Yönetimi",
    description:
      "Hero metinlerini, sloganları ve kart alanlarını düzenlemeye uygun şekilde yönet.",
  },
}

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const meta =
    Object.entries(pageMeta).find(([key]) =>
      key === "/admin" ? pathname === key : pathname.startsWith(key),
    )?.[1] ?? pageMeta["/admin"]

  return (
    <AdminShell
      pathname={pathname}
      title={meta.title}
      description={meta.description}
    >
      {children}
    </AdminShell>
  )
}

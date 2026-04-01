"use client"

import { LogOut } from "lucide-react"
import { useTransition } from "react"

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await fetch("/api/auth/logout", { method: "POST" })
          window.location.href = "/giris"
        })
      }
      className={[
        "flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-100",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isPending}
    >
      <LogOut className="size-4" />
      {isPending ? "Cikiliyor..." : "Sistemi Kapat"}
    </button>
  )
}

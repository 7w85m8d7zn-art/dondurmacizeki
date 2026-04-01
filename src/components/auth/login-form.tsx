"use client"

import { ArrowRight, LockKeyhole, Mail } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

interface LoginFormProps {
  redirectTo?: string
}

export function LoginForm({ redirectTo = "/admin" }: LoginFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [email, setEmail] = useState("admin@dondurmacizeki.com")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setIsError(false)
    setIsPending(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const payload = (await response.json()) as { message?: string }

      if (!response.ok) {
        setMessage(payload.message ?? "Giriş yapılamadı.")
        setIsError(true)
        return
      }

      window.location.assign(redirectTo)
    } catch {
      setMessage("Giriş sırasında beklenmeyen bir hata oluştu.")
      setIsError(true)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <label className="grid gap-2.5 text-left">
        <span className="pl-1 text-[0.74rem] font-semibold uppercase tracking-[0.28em] text-[#7f96bf]">
          Admin E-Posta
        </span>
        <div className="group flex items-center gap-3 rounded-[1.45rem] border border-white/10 bg-[#edf3ff] px-4 py-4 text-stone-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition focus-within:border-amber-300/50 focus-within:shadow-[0_0_0_4px_rgba(245,158,11,0.08)]">
          <div className="flex size-10 items-center justify-center rounded-[1rem] bg-white/65 text-[#5f6d84]">
            <Mail className="size-4.5" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-stone-500/75"
            placeholder="admin@dondurmacizeki.com"
            autoComplete="email"
          />
        </div>
      </label>

      <label className="grid gap-2.5 text-left">
        <span className="pl-1 text-[0.74rem] font-semibold uppercase tracking-[0.28em] text-[#7f96bf]">
          Şifre
        </span>
        <div className="group flex items-center gap-3 rounded-[1.45rem] border border-white/10 bg-[#edf3ff] px-4 py-4 text-stone-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition focus-within:border-amber-300/50 focus-within:shadow-[0_0_0_4px_rgba(245,158,11,0.08)]">
          <div className="flex size-10 items-center justify-center rounded-[1rem] bg-white/65 text-[#5f6d84]">
            <LockKeyhole className="size-4.5" />
          </div>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-stone-500/75"
            placeholder="Şifrenizi girin"
            autoComplete="current-password"
          />
        </div>
      </label>

      {message ? (
        <div
          className={`rounded-[1.2rem] border px-4 py-3 text-sm leading-6 ${
            isError
              ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {message}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="mt-3 h-14 rounded-[1.45rem] border-0 bg-[linear-gradient(135deg,#f97316,#ef4444)] text-base font-black tracking-[0.01em] text-white shadow-[0_18px_38px_rgba(239,68,68,0.3)] hover:brightness-105"
        disabled={isPending}
      >
        {isPending ? "Giriş doğrulanıyor..." : "Panele devam et"}
        <ArrowRight className="size-5" />
      </Button>

      <div className="pt-2 text-center">
        <p className="text-sm text-stone-400">Yalnızca yetkili personel erişebilir.</p>
      </div>
    </form>
  )
}

import { redirect } from "next/navigation"

import { LoginForm } from "../../components/auth/login-form"
import { getAdminSession } from "@/lib/auth"

interface LoginPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getAdminSession()

  if (session) {
    redirect("/admin")
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const redirectValue = resolvedSearchParams?.redirect
  const redirectTo =
    typeof redirectValue === "string" && redirectValue.startsWith("/")
      ? redirectValue
      : "/admin"

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f1012] px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(220,38,38,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(234,179,8,0.1),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:24px_24px]" />

      <section className="relative w-full max-w-[920px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(145deg,rgba(22,23,26,0.94),rgba(14,15,18,0.98))] shadow-[0_40px_120px_rgba(0,0,0,0.46)]">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative hidden min-h-[680px] overflow-hidden border-r border-white/8 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.18),transparent_30%),radial-gradient(circle_at_75%_25%,rgba(239,68,68,0.14),transparent_32%),linear-gradient(180deg,#17181b,#101114)]" />
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.85)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.85)_1px,transparent_1px)] [background-size:22px_22px]" />
            <div className="relative flex h-full flex-col justify-between px-10 py-12">
              <div className="space-y-5">
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-amber-200/90">
                  Yönetim Girişi
                </div>
                <div className="space-y-4">
                  <h1 className="max-w-xs text-5xl font-black leading-none tracking-tight text-white">
                    Dondurmacı
                    <span className="block text-amber-300">Zeki</span>
                  </h1>
                  <p className="max-w-sm text-base leading-8 text-stone-300">
                    Menü, QR ve ana sayfa içeriklerini tek panelden güvenle yönet.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(145deg,#f97316,#ef4444)] text-xl font-black text-white shadow-[0_10px_24px_rgba(239,68,68,0.28)]">
                      DZ
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Yönetim Paneli</p>
                      <p className="mt-1 text-sm text-stone-400">
                        Sadece yetkili ekip erişebilir.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Erişim
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">Güvenli oturum</p>
                  </div>
                  <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Sistem
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">Canlı yönetim</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <div className="mx-auto max-w-md">
              <div className="mb-8 flex items-center justify-center lg:hidden">
                <div className="flex size-20 items-center justify-center rounded-[1.75rem] bg-[linear-gradient(145deg,#f97316,#ef4444)] text-2xl font-black text-white shadow-[0_12px_30px_rgba(239,68,68,0.28)]">
                  DZ
                </div>
              </div>

              <div className="space-y-3 text-center lg:text-left">
                <p className="text-[0.74rem] font-semibold uppercase tracking-[0.34em] text-[#8fb3f1]">
                  Panel Erişimi
                </p>
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-[2.35rem]">
                  Yetkili giriş yapın
                </h2>
                <p className="text-sm leading-7 text-stone-400">
                  Yönetim araçlarına erişmek için kayıtlı e-posta ve şifrenizi girin.
                </p>
              </div>

              <div className="mt-8 rounded-[2rem] border border-white/8 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6">
                <LoginForm redirectTo={redirectTo} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

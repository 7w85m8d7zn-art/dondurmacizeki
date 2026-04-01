import Link from "next/link"
import { Clock3, MapPin, Phone } from "lucide-react"

import { AppImage } from "@/components/ui/app-image"
import { HomeContentChangeListener } from "@/components/visitor/home-content-change-listener"
import { getHomePageContentView } from "@/data/home-content-store"
import { cn } from "@/lib/utils"

export default async function Home() {
  const homePage = await getHomePageContentView()
  const homeContent = homePage.content
  const hasSingleBranch = homePage.branches.length === 1

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <HomeContentChangeListener />
      <div className="absolute inset-0">
        <AppImage
          src={homeContent.backgroundImageUrl}
          alt={homeContent.siteTitle}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/72" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.28)_42%,rgba(0,0,0,0.74)_100%)]" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <div className="w-full max-w-3xl rounded-[2.4rem] border border-white/10 bg-white/[0.05] px-5 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.2)] backdrop-blur-[10px] sm:px-8 sm:py-10">
            <div className="mx-auto mb-5 size-24 overflow-hidden rounded-full border-4 border-white/90 bg-black shadow-[0_18px_60px_rgba(0,0,0,0.38)] sm:size-28">
              <AppImage
                src={homeContent.logoUrl}
                alt={homeContent.siteTitle}
                width={112}
                height={112}
                className="size-full rounded-full object-cover"
              />
            </div>

            <h1 className="mt-5 text-balance font-heading text-4xl leading-none tracking-tight text-white sm:text-6xl lg:text-[4.75rem]">
              {homeContent.siteTitle}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/88 sm:text-lg">
              {homeContent.slogan}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <InfoPill icon={<Clock3 className="size-4" />} text="Açık: 10:00 - 00:30" />
              <InfoPill icon={<Phone className="size-4" />} text={homeContent.socialLinks.phone} />
            </div>

            <div className="mt-7 flex items-center justify-center gap-3">
              <SocialIconButton
                href={homeContent.socialLinks.instagram}
                label="Instagram"
                icon={<InstagramIcon className="size-5" />}
              />
              <SocialIconButton
                href={homeContent.socialLinks.tiktok}
                label="TikTok"
                icon={<TikTokIcon className="size-5" />}
              />
            </div>

            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f0b521]">
              Powered by Ajjans Medya 
            </p>
          </div>

          <div
            className={cn(
              "mt-6 grid w-full gap-3",
              hasSingleBranch
                ? "max-w-[30rem]"
                : "sm:max-w-4xl sm:grid-cols-2",
            )}
          >
            {homePage.branches.map((branch) => {
              return (
                <article
                  key={branch.id}
                  className="rounded-[1.9rem] border border-white/14 bg-white/[0.1] px-5 py-5 text-left text-white shadow-[0_16px_50px_rgba(0,0,0,0.28)] backdrop-blur sm:px-6 sm:py-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[1.12rem] font-semibold leading-tight tracking-tight sm:text-[1.18rem]">
                        {branch.cardTitle}
                      </p>
                      <p className="mt-2 max-w-[28ch] text-[0.98rem] leading-7 text-white/62">
                        {branch.cardShortAddress}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/14 bg-white/[0.08] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72">
                      Konum
                    </span>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <a
                      href={branch.cardMapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 text-[0.98rem] font-semibold text-white transition hover:bg-white/15"
                    >
                      <MapPin className="size-4" />
                      Konumu Gör
                    </a>
                    <Link
                      href="/menu-listesi"
                      className="inline-flex min-h-[48px] min-w-[172px] flex-[1.12] items-center justify-center rounded-full bg-[#ff2424] px-5 text-[0.98rem] font-semibold leading-5 text-white shadow-[0_14px_30px_rgba(239,36,36,0.28)] transition hover:bg-[#ff3535]"
                    >
                      {homeContent.menuButtonText}
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}

function InfoPill({
  icon,
  text,
}: {
  icon: React.ReactNode
  text: string
}) {
  return (
    <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 text-sm text-white/82 backdrop-blur">
      <span className="text-white/65">{icon}</span>
      <span>{text}</span>
    </div>
  )
}

function SocialIconButton({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex size-14 items-center justify-center rounded-[1.2rem] border border-[#f0b000] bg-black/22 text-white shadow-[0_10px_24px_rgba(0,0,0,0.24)] backdrop-blur transition hover:bg-black/30"
    >
      {icon}
    </a>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5.25" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M14.95 3c.35 1.94 1.57 3.7 3.39 4.73.9.52 1.89.8 2.66.87v3.18a8.71 8.71 0 0 1-3.55-1.05v5.22c0 3.16-2.34 5.92-5.64 6.04A5.98 5.98 0 0 1 5.58 16a5.99 5.99 0 0 1 8.28-5.56v3.38a2.7 2.7 0 0 0-1.77-.16A2.75 2.75 0 0 0 10 16.35c.12 1.3 1.18 2.36 2.48 2.48A2.75 2.75 0 0 0 15.5 16V3h-.55Z" />
    </svg>
  )
}

export const dynamic = "force-dynamic"

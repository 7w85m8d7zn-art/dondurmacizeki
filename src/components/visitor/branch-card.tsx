import Link from "next/link"
import { ArrowUpRight, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Branch } from "@/types/menu"

interface BranchCardProps {
  branch: Branch
  titleOverride?: string
  addressOverride?: string
  menuButtonText?: string
  mapUrlOverride?: string
}

export function BranchCard({
  branch,
  titleOverride,
  addressOverride,
  menuButtonText = "Menüyü Görüntüle",
  mapUrlOverride,
}: BranchCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(120,53,15,0.10)] backdrop-blur sm:rounded-[2rem] sm:p-6">
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">
              Sube
            </span>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
                {titleOverride ?? branch.name}
              </h3>
              <p className="max-w-xs text-sm leading-6 text-stone-600">
                {addressOverride ?? branch.shortAddress}
              </p>
            </div>
          </div>
          <div className="shrink-0 rounded-full border border-amber-200 bg-amber-50 p-3 text-amber-700 transition-transform duration-300 group-hover:scale-110">
            <MapPin className="size-5" />
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-stone-900 px-4 py-4 text-stone-100">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-300">
            Sube Notu
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-300">{branch.serviceNote}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            asChild
            size="lg"
            className="h-[52px] rounded-2xl bg-white text-stone-900 shadow-none ring-1 ring-stone-200 hover:bg-stone-50"
          >
            <a href={mapUrlOverride ?? branch.mapUrl} target="_blank" rel="noreferrer">
              Konumu Gor
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            className="h-[52px] rounded-2xl bg-stone-900 text-white hover:bg-stone-800"
          >
            <Link href="/menu-listesi">{menuButtonText}</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

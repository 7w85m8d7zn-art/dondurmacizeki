import { Sparkles } from "lucide-react"

import { AppImage } from "@/components/ui/app-image"
import type { QrBuilderState } from "@/types/qr-builder"

interface QrPreviewCardProps {
  state: QrBuilderState
  qrDataUrl: string | null
  isGenerating: boolean
}

export function QrPreviewCard({
  state,
  qrDataUrl,
  isGenerating,
}: QrPreviewCardProps) {
  return (
    <section className="flex w-full justify-center">
      <div
        className="relative w-[188px] overflow-hidden shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:w-[212px]"
        style={{
          backgroundColor: state.backgroundColor,
          borderRadius: `${state.cornerRadius}px`,
          border: `${state.frameThickness}px solid ${state.accentColor}`,
        }}
      >
        <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_72%)]" />
        <div className="relative px-4 pb-5 pt-5 text-center sm:px-5 sm:pb-6">
          <div className="flex justify-center">
            {state.showIcon ? (
              <div
                className="grid size-8 place-items-center rounded-xl"
                style={{
                  backgroundColor: "#111111",
                  color: state.backgroundColor,
                }}
              >
                <Sparkles className="size-3.5" />
              </div>
            ) : null}
          </div>

          <div className="mt-5">
            <h4
              className="text-[1.05rem] font-black uppercase leading-tight tracking-[-0.03em] sm:text-[1.2rem]"
              style={{ color: state.textColor }}
            >
              {state.title}
            </h4>
          </div>

          <div
            className="mx-auto mt-5 rounded-[1rem] p-2.5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
            style={{ backgroundColor: state.qrBackgroundColor }}
          >
            {state.showLogo ? (
              <div className="absolute left-1/2 top-[128px] z-10 -translate-x-1/2 rounded-full border border-stone-200 bg-white p-1 shadow-sm">
                <div className="grid size-5 place-items-center rounded-full bg-[#fff3e8] text-[9px] font-black text-[#d9480f]">
                  DZ
                </div>
              </div>
            ) : null}

            {isGenerating ? (
              <div className="grid aspect-square place-items-center rounded-[0.9rem] bg-stone-100 text-xs text-stone-500">
                QR üretiliyor...
              </div>
            ) : qrDataUrl ? (
              <AppImage
                src={qrDataUrl}
                alt="QR kod ön izlemesi"
                width={260}
                height={260}
                className="aspect-square w-full rounded-[0.9rem] object-cover"
              />
            ) : (
              <div className="grid aspect-square place-items-center rounded-[0.9rem] bg-stone-100 text-xs text-stone-500">
                QR görünümü
              </div>
            )}
          </div>

          <div className="mt-5 space-y-2">
            <div className="mx-auto h-px w-24 bg-black/60" />
            <p
              className="text-[9px] font-black uppercase tracking-[0.26em]"
              style={{ color: state.textColor }}
            >
              {qrDataUrl ? "QR Menü" : "Hazırlanıyor"}
            </p>
            <p
              className="px-3 text-[8px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: `${state.textColor}bb` }}
            >
              {state.subtitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

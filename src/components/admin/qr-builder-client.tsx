"use client"

import { useEffect, useReducer, useState } from "react"
import { CheckCircle2, Download, MonitorSmartphone, Sparkles } from "lucide-react"

import { AdminFeedback } from "@/components/admin/admin-feedback"
import { QrEditorPanel } from "@/components/admin/qr-editor-panel"
import { QrPreviewCard } from "@/components/admin/qr-preview-card"
import { qrBuilderData } from "@/data/qr-builder-content"
import {
  createQrCardSvg,
  downloadQrAsPdf,
  downloadQrAsPng,
  generateQrDataUrl,
} from "@/lib/qr-builder"
import type { QrBuilderState, QrTemplatePreset } from "@/types/qr-builder"

type Action =
  | { type: "title"; value: string }
  | { type: "subtitle"; value: string }
  | { type: "showLogo"; value: boolean }
  | { type: "showIcon"; value: boolean }
  | { type: "backgroundColor"; value: string }
  | { type: "qrBackgroundColor"; value: string }
  | { type: "textColor"; value: string }
  | { type: "accentColor"; value: string }
  | { type: "frameThickness"; value: number }
  | { type: "cornerRadius"; value: number }
  | { type: "template"; value: QrTemplatePreset }
  | { type: "generatedUrl"; value: string }

function createInitialState(): QrBuilderState {
  const branch = qrBuilderData.branches[0]
  const template = qrBuilderData.templates[0]

  return {
    branchId: branch.id,
    menuId: branch.menuId,
    generatedUrl: `/menu-listesi?menu=${branch.menuId}`,
    title: "Menümüzü Görüntüleyin",
    subtitle: "QR kodu taratarak mobil menüye ulaşın.",
    showLogo: true,
    showIcon: true,
    backgroundColor: template.backgroundColor,
    qrBackgroundColor: template.qrBackgroundColor,
    textColor: template.textColor,
    accentColor: template.accentColor,
    frameThickness: template.frameThickness,
    cornerRadius: template.cornerRadius,
    templateId: template.id,
  }
}

function reducer(state: QrBuilderState, action: Action): QrBuilderState {
  switch (action.type) {
    case "title":
      return { ...state, title: action.value }
    case "subtitle":
      return { ...state, subtitle: action.value }
    case "showLogo":
      return { ...state, showLogo: action.value }
    case "showIcon":
      return { ...state, showIcon: action.value }
    case "backgroundColor":
      return { ...state, backgroundColor: action.value }
    case "qrBackgroundColor":
      return { ...state, qrBackgroundColor: action.value }
    case "textColor":
      return { ...state, textColor: action.value }
    case "accentColor":
      return { ...state, accentColor: action.value }
    case "frameThickness":
      return { ...state, frameThickness: action.value }
    case "cornerRadius":
      return { ...state, cornerRadius: action.value }
    case "generatedUrl":
      return { ...state, generatedUrl: action.value }
    case "template":
      return {
        ...state,
        backgroundColor: action.value.backgroundColor,
        qrBackgroundColor: action.value.qrBackgroundColor,
        textColor: action.value.textColor,
        accentColor: action.value.accentColor,
        frameThickness: action.value.frameThickness,
        cornerRadius: action.value.cornerRadius,
        templateId: action.value.id,
      }
    default:
      return state
  }
}

export function QrBuilderClient() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [feedback, setFeedback] = useState<{
    message: string
    tone: "success" | "error"
  } | null>(null)

  useEffect(() => {
    const branch = qrBuilderData.branches.find((item) => item.id === state.branchId)
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://example.com"
    if (branch) {
      dispatch({
        type: "generatedUrl",
        value: `${origin}/menu-listesi?menu=${state.menuId}`,
      })
    }
  }, [state.branchId, state.menuId])

  useEffect(() => {
    let ignore = false
    setIsGenerating(true)

    generateQrDataUrl(state.generatedUrl, state.accentColor, state.qrBackgroundColor)
      .then((dataUrl) => {
        if (!ignore) {
          setQrDataUrl(dataUrl)
        }
      })
      .catch(() => {
        if (!ignore) {
          setFeedback({
            message: "QR kodu oluşturulamadı.",
            tone: "error",
          })
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsGenerating(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [state])

  async function handleExportPng() {
    if (!qrDataUrl) return
    setIsExporting(true)
    setFeedback(null)
    try {
      const svgMarkup = createQrCardSvg(state, qrDataUrl)
      await downloadQrAsPng(svgMarkup, `qr-${state.menuId}`)
      setFeedback({ message: "PNG çıktısı hazırlandı.", tone: "success" })
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "PNG dışa aktarımı başarısız.",
        tone: "error",
      })
    } finally {
      setIsExporting(false)
    }
  }

  async function handleExportPdf() {
    if (!qrDataUrl) return
    setIsExporting(true)
    setFeedback(null)
    try {
      await downloadQrAsPdf(state, qrDataUrl, `qr-${state.menuId}`)
      setFeedback({ message: "PDF çıktısı hazırlandı.", tone: "success" })
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "PDF dışa aktarımı başarısız.",
        tone: "error",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-[#eef2f6] shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-7 place-items-center rounded-full bg-[#ffefe3] text-[#e85d04]">
            <Sparkles className="size-3.5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-stone-900">
              Tasarim Editoru
            </p>
            <p className="text-xs text-stone-500">
              Mobil odaklı QR kartını daha rahat bir akışla şekillendirin.
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="size-3.5" />
            Varsayılan Hedef Hazır
          </span>
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold text-stone-600">
            <MonitorSmartphone className="size-3.5" />
            Canlı Tasarım Modu
          </div>
        </div>
      </div>

      {feedback ? (
        <div className="border-b border-stone-200 bg-white px-5 py-3">
          <AdminFeedback {...feedback} />
        </div>
      ) : null}

      <div className="grid min-h-[760px] gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
        <QrEditorPanel
          state={state}
          dispatch={dispatch}
          onExportPng={handleExportPng}
          onExportPdf={handleExportPdf}
          isExporting={isExporting}
        />

        <div className="relative order-1 flex items-start justify-center px-5 py-6 sm:px-8 lg:px-12 xl:order-2 xl:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.75),transparent_46%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(238,242,246,0.92))]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:36px_36px] opacity-50" />
          <div className="relative flex w-full max-w-[980px] flex-col items-center gap-5">
            <div className="flex w-full max-w-[720px] items-center justify-between rounded-[1.2rem] border border-white/80 bg-white/75 px-4 py-2.5 shadow-sm backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                Canlı Tasarım Alanı
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-3 py-1 text-[11px] font-semibold text-white">
                <Download className="size-3.5" />
                PNG / PDF Hazır
              </div>
            </div>

            <div className="grid w-full items-center gap-6 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
              <div className="hidden gap-4 lg:grid">
                <InfoCard
                  eyebrow="Mobil Deneyim"
                  title="Kısa ve hızlı akış"
                  description="QR kartı tek ekranda kolayca okunacak şekilde dengelenir."
                  tone="warm"
                />
                <InfoCard
                  eyebrow="Kart Hissi"
                  title="Daha premium görünüm"
                  description="Kontrast, boşluk ve radius ayarları ön izlemede anında hissedilir."
                  tone="light"
                />
              </div>

              <div className="relative flex justify-center">
                <div className="absolute inset-x-10 top-10 h-56 rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.22),transparent_68%)] blur-3xl" />
                <div className="relative w-full rounded-[2rem] border border-white/70 bg-white/40 px-6 py-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                  <QrPreviewCard
                    state={state}
                    qrDataUrl={qrDataUrl}
                    isGenerating={isGenerating}
                  />
                </div>
              </div>

              <div className="hidden gap-4 lg:grid">
                <InfoCard
                  eyebrow="Hazır Çıktı"
                  title="Baskı ve masaüstü uyumu"
                  description="Kart oranları hem telefonda hem de fiziksel baskıda rahat kullanılır."
                  tone="light"
                />
                <InfoCard
                  eyebrow="Editör Notu"
                  title="Sekmeli düzen"
                  description="Şablon, içerik ve stil ayarları farklı bloklarda toplandığı için yorgunluk azalır."
                  tone="warm"
                />
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3">
              <BottomStat
                label="Daha Az Yorgunluk"
                value="Sekmeli editör"
              />
              <BottomStat
                label="Canlı Ön İzleme"
                value="Anında güncel"
              />
              <BottomStat
                label="Çıktı Formatı"
                value="PNG ve PDF"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({
  eyebrow,
  title,
  description,
  tone,
}: {
  eyebrow: string
  title: string
  description: string
  tone: "warm" | "light"
}) {
  const toneClass =
    tone === "warm"
      ? "border-[#ffd9c4] bg-[#fff7f1]"
      : "border-white/80 bg-white/72"

  return (
    <div className={`rounded-[1.4rem] border p-4 shadow-sm backdrop-blur ${toneClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-400">
        {eyebrow}
      </p>
      <p className="mt-2 text-base font-semibold text-stone-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
    </div>
  )
}

function BottomStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.3rem] border border-white/80 bg-white/72 px-4 py-4 shadow-sm backdrop-blur">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-stone-900">{value}</p>
    </div>
  )
}

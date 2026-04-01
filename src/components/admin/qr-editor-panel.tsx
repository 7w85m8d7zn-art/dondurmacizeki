"use client"

import { useState, type Dispatch, type ReactNode } from "react"
import {
  AppWindow,
  Check,
  Palette,
  ScanLine,
  Sparkles,
  Type,
} from "lucide-react"

import { qrBuilderData } from "@/data/qr-builder-content"
import type { QrBuilderState, QrTemplatePreset } from "@/types/qr-builder"

type QrEditorAction =
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

interface QrEditorPanelProps {
  state: QrBuilderState
  dispatch: Dispatch<QrEditorAction>
  onExportPng: () => Promise<void>
  onExportPdf: () => Promise<void>
  isExporting: boolean
}

const templateIcons = [Sparkles, ScanLine, AppWindow]
const editorTabs = [
  { id: "templates", label: "Şablon", icon: Sparkles },
  { id: "content", label: "İçerik", icon: Type },
  { id: "style", label: "Stil", icon: Palette },
] as const

export function QrEditorPanel({
  state,
  dispatch,
  onExportPng,
  onExportPdf,
  isExporting,
}: QrEditorPanelProps) {
  const [activeTab, setActiveTab] =
    useState<(typeof editorTabs)[number]["id"]>("templates")

  const activeTemplate = qrBuilderData.templates.find(
    (template) => template.id === state.templateId,
  )

  return (
    <aside className="order-2 border-t border-stone-200 bg-white xl:order-1 xl:border-r xl:border-t-0">
      <div className="flex h-full flex-col">
        <div className="border-b border-stone-200 px-4 py-4 sm:px-5">
          <PanelTitle
            icon={Sparkles}
            eyebrow="QR Stüdyosu"
            title="Daha Rahat Düzenleme"
            description="Ayarlar sekmelere bölündü. Böylece hem masaüstünde hem mobilde daha kolay ilerlenir."
          />

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-[1.2rem] bg-stone-100 p-1.5">
            {editorTabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`inline-flex items-center justify-center gap-2 rounded-[0.95rem] px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-stone-950 text-white shadow-sm"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {activeTab === "templates" ? (
            <div className="space-y-5">
              <div className="rounded-[1.35rem] border border-[#ffe1d6] bg-[#fff7f3] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#e85d04]">
                  Seçili Şablon
                </p>
                <p className="mt-2 text-base font-semibold text-stone-900">
                  {activeTemplate?.name ?? "Şablon seçin"}
                </p>
                <p className="mt-1 text-sm leading-6 text-stone-500">
                  Kısa kart, temiz kontrast ve mobil odaklı QR hissi bu alandan yönetilir.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {qrBuilderData.templates.map((template, index) => {
                  const Icon = templateIcons[index % templateIcons.length]
                  const isActive = state.templateId === template.id

                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => dispatch({ type: "template", value: template })}
                      className={`rounded-[1.1rem] border p-3 text-left transition ${
                        isActive
                          ? "border-[#ff4d3d] bg-[#fff7f3] shadow-[0_10px_22px_rgba(255,77,61,0.12)]"
                          : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="grid size-9 place-items-center rounded-xl"
                          style={{
                            backgroundColor: template.accentColor,
                            color: template.qrBackgroundColor,
                          }}
                        >
                          <Icon className="size-4" />
                        </div>
                        {isActive ? (
                          <div className="grid size-6 place-items-center rounded-full bg-stone-950 text-white">
                            <Check className="size-3.5" />
                          </div>
                        ) : null}
                      </div>

                      <p className="mt-3 text-sm font-semibold text-stone-900">
                        {template.name}
                      </p>

                      <div className="mt-3 flex gap-1.5">
                        {[template.backgroundColor, template.qrBackgroundColor, template.accentColor].map(
                          (color) => (
                            <span
                              key={color}
                              className="size-2.5 rounded-full border border-black/5"
                              style={{ backgroundColor: color }}
                            />
                          ),
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {activeTab === "content" ? (
            <div className="space-y-4">
              <Field label="Yönlendirilen URL">
                <div className="truncate rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-500">
                  {state.generatedUrl}
                </div>
              </Field>

              <div className="rounded-[1.2rem] border border-stone-200 bg-stone-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
                  Sabit Hedef
                </p>
                <p className="mt-2 text-sm font-semibold text-stone-900">
                  QR kod varsayılan menü listesine yönleniyor.
                </p>
                <p className="mt-1 text-xs leading-5 text-stone-500">
                  Şube ve menü seçimleri bu akıştan kaldırıldı. Kart içeriği sadece metin ve stil üzerinden yönetilir.
                </p>
              </div>

              <Field label="Başlık Metni">
                <input
                  value={state.title}
                  onChange={(event) =>
                    dispatch({ type: "title", value: event.target.value })
                  }
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none"
                />
              </Field>

              <Field label="Alt Metin">
                <textarea
                  value={state.subtitle}
                  rows={3}
                  onChange={(event) =>
                    dispatch({ type: "subtitle", value: event.target.value })
                  }
                  className="resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none"
                />
              </Field>
            </div>
          ) : null}

          {activeTab === "style" ? (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <MiniColorCard
                  label="Arka Plan"
                  value={state.backgroundColor}
                  onChange={(value) => dispatch({ type: "backgroundColor", value })}
                />
                <MiniColorCard
                  label="QR Alanı"
                  value={state.qrBackgroundColor}
                  onChange={(value) => dispatch({ type: "qrBackgroundColor", value })}
                />
                <MiniColorCard
                  label="Vurgu"
                  value={state.accentColor}
                  onChange={(value) => dispatch({ type: "accentColor", value })}
                />
              </div>

              <div className="space-y-4">
                <RangeField
                  label="Köşe Yuvarlaklığı"
                  value={state.cornerRadius}
                  min={12}
                  max={48}
                  onChange={(value) => dispatch({ type: "cornerRadius", value })}
                />
                <RangeField
                  label="Çerçeve Kalınlığı"
                  value={state.frameThickness}
                  min={2}
                  max={18}
                  onChange={(value) => dispatch({ type: "frameThickness", value })}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-stone-200 bg-white px-4 py-4 sm:px-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onExportPng}
              className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              disabled={isExporting}
            >
              {isExporting ? "Hazırlanıyor..." : "PNG"}
            </button>
            <button
              type="button"
              onClick={onExportPdf}
              className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              disabled={isExporting}
            >
              {isExporting ? "Hazırlanıyor..." : "PDF"}
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

function PanelTitle({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof Sparkles
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-stone-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">
          {eyebrow}
        </p>
      </div>
      <p className="mt-2 text-sm font-semibold text-stone-900">{title}</p>
      <p className="mt-1 text-xs leading-5 text-stone-500">{description}</p>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
        {label}
      </span>
      {children}
    </label>
  )
}

function MiniColorCard({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-3 rounded-[1.35rem] border border-stone-200 bg-[linear-gradient(180deg,#ffffff,#faf7f2)] p-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">
        {label}
      </span>
      <div
        className="h-11 rounded-[1rem] border border-black/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
        style={{ backgroundColor: value }}
      />
      <div className="rounded-xl border border-stone-200 bg-white px-2 py-1.5">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-7 w-full cursor-pointer rounded-lg border-0 bg-transparent"
        />
      </div>
    </label>
  )
}

function RangeField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-stone-700">{label}</span>
        <span className="text-xs font-semibold text-stone-400">{value}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-[#ff4d3d]"
      />
    </div>
  )
}

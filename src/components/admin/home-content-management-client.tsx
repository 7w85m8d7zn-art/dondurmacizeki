"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  AtSign,
  ImagePlus,
  Link as LinkIcon,
  MapPin,
  Phone,
  Save,
} from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { AdminFeedback } from "@/components/admin/admin-feedback"
import { AppImage } from "@/components/ui/app-image"
import { Button } from "@/components/ui/button"
import { visitorData } from "@/data/visitor-content"
import { homeContentSchema } from "@/lib/validators/home-content-management"
import type { HomeContentConfig } from "@/types/home-content-management"

interface HomeContentManagementClientProps {
  initialData: HomeContentConfig
}

export function HomeContentManagementClient({
  initialData,
}: HomeContentManagementClientProps) {
  const router = useRouter()
  const [feedback, setFeedback] = useState<{
    message: string
    tone: "success" | "error"
  } | null>(null)
  const [logoUploadPreview, setLogoUploadPreview] = useState<string | null>(null)
  const [backgroundUploadPreview, setBackgroundUploadPreview] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<HomeContentConfig>({
    resolver: zodResolver(homeContentSchema),
    defaultValues: initialData,
  })

  useEffect(() => {
    form.reset(initialData)
  }, [form, initialData])

  const watchedValues = form.watch()

  const previewBranchCard = watchedValues.branchCards?.[0] ?? null

  const previewBranch = visitorData.branches[0]
  const previewAddress =
    previewBranchCard?.shortAddress ?? previewBranch?.shortAddress ?? ""
  const previewPhone = watchedValues.socialLinks?.phone ?? previewBranch?.phone ?? ""

  const logoPreview = logoUploadPreview ?? watchedValues.logoUrl ?? ""
  const backgroundPreview =
    backgroundUploadPreview ?? watchedValues.backgroundImageUrl ?? ""
  const instagramHandle = simplifyHandle(watchedValues.socialLinks?.instagram)
  const websiteLabel = simplifyDomain(watchedValues.socialLinks?.tiktok)

  async function onSubmit(values: HomeContentConfig) {
    setFeedback(null)

    const response = await fetch("/api/admin/home-content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    const payload = (await response.json()) as { message?: string }

    if (!response.ok) {
      setFeedback({
        message: payload.message ?? "Ana sayfa icerigi guncellenemedi.",
        tone: "error",
      })
      return
    }

    form.reset(values)
    window.localStorage.setItem("home-content-updated-at", Date.now().toString())

    setFeedback({
      message: "Ana sayfa icerigi basariyla kaydedildi.",
      tone: "success",
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 border-b border-stone-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
            Uygulama Ayarlari
          </p>
          <p className="mt-3 text-sm text-stone-500">
            Marka gorsellerini, iletisim alanlarini ve uygulama deneyimini
            ozellestirin.
          </p>
        </div>

        <Button
          type="submit"
          form="home-content-form"
          size="lg"
          className="h-11 rounded-full bg-[#ef1c24] px-5 text-white shadow-[0_14px_32px_rgba(239,28,36,0.18)] hover:bg-[#d9151d]"
          disabled={isPending}
        >
          <Save className="size-4" />
          {isPending ? "Ayarlar Kaydediliyor..." : "Ayarlari Yayimla"}
        </Button>
      </section>

      {feedback ? <AdminFeedback {...feedback} /> : null}

      <form
        id="home-content-form"
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
        onSubmit={form.handleSubmit((values) => {
          startTransition(async () => {
            await onSubmit(values)
          })
        })}
      >
        <div className="space-y-4">
          <SettingsCard
            icon="T"
            title="Temel Marka Bilgileri"
            description="Ust alanda gosterilecek ana metinler ve buton ifadesi."
          >
            <div className="grid gap-4">
              <Field
                label="Restoran Ismi"
                error={form.formState.errors.siteTitle?.message}
              >
                <input
                  {...form.register("siteTitle")}
                  className={inputClassName}
                />
              </Field>

              <Field
                label="Marka Slogani"
                error={form.formState.errors.slogan?.message}
              >
                <input {...form.register("slogan")} className={inputClassName} />
              </Field>

              <div className="grid gap-4 lg:grid-cols-2">
                <Field
                  label="Buton Etiketi"
                  error={form.formState.errors.menuButtonText?.message}
                >
                  <input
                    {...form.register("menuButtonText")}
                    className={inputClassName}
                  />
                </Field>

                <Field label="Servis Saatleri">
                  <input
                    value="12.00 - 24.00"
                    readOnly
                    className={`${inputClassName} text-stone-400`}
                  />
                </Field>
              </div>

            </div>
          </SettingsCard>

          <SettingsCard
            icon="G"
            title="Gorsel Materyaller"
            description="Telefon simulasyonunda aninda guncellenen marka gorselleri."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <MediaField
                title="Kurumsal Logo"
                preview={logoPreview}
                onPick={(value) => {
                  setLogoUploadPreview(value)
                  form.setValue("logoUrl", value, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }}
                error={form.formState.errors.logoUrl?.message}
              >
                <input {...form.register("logoUrl")} className={inputClassName} />
              </MediaField>

              <MediaField
                title="Kapak Fotografi"
                preview={backgroundPreview}
                onPick={(value) => {
                  setBackgroundUploadPreview(value)
                  form.setValue("backgroundImageUrl", value, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }}
                error={form.formState.errors.backgroundImageUrl?.message}
              >
                <input
                  {...form.register("backgroundImageUrl")}
                  className={inputClassName}
                />
              </MediaField>
            </div>
          </SettingsCard>

          <SettingsCard
            icon="I"
            title="Iletisim & Sosyal Medya"
            description="Baglanti alanlarindaki degisiklikler telefon simulasyonuna aninda yansir."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <Field
                label="Instagram"
                error={form.formState.errors.socialLinks?.instagram?.message}
              >
                <input
                  {...form.register("socialLinks.instagram")}
                  className={inputClassName}
                />
              </Field>

              <Field
                label="Telefon"
                error={form.formState.errors.socialLinks?.phone?.message}
              >
                <input
                  {...form.register("socialLinks.phone")}
                  className={inputClassName}
                />
              </Field>

              <Field
                label="WhatsApp"
                error={form.formState.errors.socialLinks?.whatsapp?.message}
              >
                <input
                  {...form.register("socialLinks.whatsapp")}
                  className={inputClassName}
                />
              </Field>

              <Field
                label="Adres"
              >
                <input
                  value={previewAddress}
                  readOnly
                  className={`${inputClassName} text-stone-400`}
                />
              </Field>

              <Field
                label="Kisa Web Adresi"
                error={form.formState.errors.socialLinks?.tiktok?.message}
              >
                <input
                  {...form.register("socialLinks.tiktok")}
                  className={inputClassName}
                />
              </Field>
            </div>
          </SettingsCard>

        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="px-2">
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-stone-400">
              Telefon Simulasyonu
            </p>
          </div>

          <div className="mt-3 flex justify-center">
            <div className="relative w-[248px] rounded-[2.4rem] bg-[#0c0c0d] p-[7px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] ring-1 ring-black/5">
              <div className="absolute top-3 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
              <div className="relative min-h-[510px] overflow-hidden rounded-[2rem] bg-[#0f0f10]">
                <div className="absolute inset-0">
                  {backgroundPreview ? (
                    <AppImage
                      src={backgroundPreview}
                      alt={watchedValues.siteTitle ?? "Kapak"}
                      fill
                      sizes="248px"
                      className="object-cover opacity-40"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,197,36,0.22),transparent_28%),linear-gradient(180deg,rgba(8,8,9,0.1)_0%,rgba(8,8,9,0.72)_52%,rgba(8,8,9,0.98)_100%)]" />
                </div>

                <div className="relative flex min-h-[510px] flex-col items-center px-5 pt-12 pb-5 text-center text-white">
                  <div className="overflow-hidden rounded-full border-4 border-white/90 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
                    <AppImage
                      src={logoPreview}
                      alt={watchedValues.siteTitle ?? "Logo"}
                      width={64}
                      height={64}
                      className="size-14 object-cover"
                    />
                  </div>

                  <h3 className="mt-4 text-[1.65rem] font-black uppercase leading-none tracking-tight">
                    {watchedValues.siteTitle}
                  </h3>
                  <p className="mt-2 text-xs text-white/72">{instagramHandle}</p>

                  <div className="mt-5 flex items-center gap-2">
                    <PhonePill icon={<AtSign className="size-3.5" />} />
                    <PhonePill icon={<Phone className="size-3.5" />} />
                    <PhonePill icon={<MapPin className="size-3.5" />} />
                    <PhonePill icon={<LinkIcon className="size-3.5" />} />
                  </div>

                  <p className="mt-5 max-w-[18ch] text-sm leading-6 text-white/88">
                    {watchedValues.slogan}
                  </p>

                  <button
                    type="button"
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#ef1c24] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(239,28,36,0.28)]"
                  >
                    {watchedValues.menuButtonText || "MENUYU INCELE"}
                  </button>

                  <div className="mt-auto w-full border-t border-white/10 pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f0b521]">
                      Powered by Ajjans Medya
                    </p>
                    <div className="mt-3 space-y-2 text-[10px] leading-4 text-white/52">
                      <p>{previewAddress}</p>
                      <p>{previewPhone}</p>
                      <p>{websiteLabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  )
}

const inputClassName =
  "w-full rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400"

function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[1.8rem] border border-stone-200 bg-white p-5 shadow-[0_10px_30px_rgba(28,25,23,0.03)]">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-rose-50 text-[11px] font-bold text-[#ef1c24]">
          {icon}
        </span>
        <h3 className="text-sm font-black uppercase tracking-tight text-stone-950">
          {title}
        </h3>
      </div>
      <p className="mt-2 text-sm text-stone-500">{description}</p>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  )
}

function MediaField({
  title,
  preview,
  onPick,
  error,
  children,
}: {
  title: string
  preview: string
  onPick: (value: string) => void
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-stone-800">{title}</span>
      {children}
      <div className="flex items-center gap-3 rounded-[1rem] border border-dashed border-stone-300 bg-[#f8fbff] px-4 py-3">
        <div className="overflow-hidden rounded-[0.8rem] border border-stone-200 bg-white">
          {preview ? (
            <AppImage
              src={preview}
              alt={title}
              width={64}
              height={64}
              className="size-14 object-cover"
            />
          ) : (
            <div className="grid size-14 place-items-center bg-stone-50 text-stone-400">
              <ImagePlus className="size-4" />
            </div>
          )}
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-[0.9rem] border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50">
          <ImagePlus className="size-4" />
          Resmi Degistir
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) return

              const dataUrl = await fileToDataUrl(file)
              onPick(dataUrl)
              event.target.value = ""
            }}
          />
        </label>

        <p className="text-xs text-stone-400">PNG, JPG veya WEBP. Max 2MB.</p>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-stone-800">{label}</span>
      {children}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  )
}

function PhonePill({ icon }: { icon: React.ReactNode }) {
  return (
    <span className="inline-flex size-8 items-center justify-center rounded-full border border-[#f0b521]/35 bg-black/28 text-[#f0b521] shadow-[0_6px_18px_rgba(0,0,0,0.28)]">
      {icon}
    </span>
  )
}

function simplifyHandle(url?: string) {
  if (!url) return "@marka"
  const cleaned = url.replace(/^https?:\/\//, "").replace(/^www\./, "")
  return `@${cleaned.split("/").filter(Boolean).at(-1) ?? "marka"}`
}

function simplifyDomain(url?: string) {
  if (!url) return "www.ornekmarka.com"
  const cleaned = url.replace(/^https?:\/\//, "").replace(/^www\./, "")
  return cleaned.split("/")[0] ?? cleaned
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
        return
      }

      reject(new Error("Gorsel verisi okunamadi."))
    }

    reader.onerror = () => {
      reject(new Error("Gorsel verisi okunamadi."))
    }

    reader.readAsDataURL(file)
  })
}

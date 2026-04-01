"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ImagePlus, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"

import { AppImage } from "@/components/ui/app-image"
import { Button } from "@/components/ui/button"
import { slugify } from "@/lib/slugify"
import { menuFormSchema } from "@/lib/validators/menu-management"
import type {
  BranchOption,
  MenuManagementItem,
  MenuFormValues,
} from "@/types/menu-management"

interface MenuFormPanelProps {
  branches: BranchOption[]
  mode: "create" | "edit"
  initialValues?: MenuManagementItem | null
  onSubmit: (values: MenuFormValues) => Promise<void>
  onCancel?: () => void
  errorMessage?: string | null
  onClearError?: () => void
  submitLabel: string
}

const defaultValues: MenuFormValues = {
  name: "",
  description: "",
  coverImageUrl: "",
  slug: "",
  branchId: "",
  status: "active",
  sortOrder: 0,
}

export function MenuFormPanel({
  branches,
  mode,
  initialValues,
  onSubmit,
  onCancel,
  errorMessage,
  onClearError,
  submitLabel,
}: MenuFormPanelProps) {
  const [isPending, setIsPending] = useState(false)
  const [coverUploadPreview, setCoverUploadPreview] = useState<string | null>(null)
  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (initialValues) {
      setCoverUploadPreview(null)
      form.reset({
        name: initialValues.name,
        description: initialValues.description,
        coverImageUrl: initialValues.coverImageUrl,
        slug: initialValues.slug,
        branchId: initialValues.branchId,
        status: initialValues.status,
        sortOrder: initialValues.sortOrder,
      })
      return
    }

    setCoverUploadPreview(null)
    form.reset(defaultValues)
  }, [form, initialValues])

  const nameValue = useWatch({
    control: form.control,
    name: "name",
  })
  const coverImageValue = useWatch({
    control: form.control,
    name: "coverImageUrl",
  })
  const coverPreview = coverUploadPreview ?? coverImageValue

  useEffect(() => {
    if (!errorMessage || !onClearError) {
      return
    }

    const subscription = form.watch((_value, info) => {
      if (info.name === "name" || info.name === "slug") {
        onClearError()
      }
    })

    return () => subscription.unsubscribe()
  }, [errorMessage, form, onClearError])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.25rem] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.38)]">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-5 right-5 inline-flex size-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-50 hover:text-stone-900"
            aria-label="Pencereyi kapat"
          >
            <X className="size-4" />
          </button>
        ) : null}

        <div className="px-8 pt-9 pb-8 sm:px-9">
          <div className="min-w-0">
            <p className="text-[2rem] font-black uppercase leading-none tracking-tight text-stone-950">
              {mode === "create" ? "Yeni: Menu" : "Duzenle: Menu"}
            </p>
          </div>

          <form
            className="mt-8 grid gap-5"
            onSubmit={form.handleSubmit(async (values) => {
              setIsPending(true)

              try {
                await onSubmit(values)
              } finally {
                setIsPending(false)
              }
            })}
          >
            {errorMessage ? (
              <div className="rounded-[1.1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[#8fa1ba]">Isim / Baslik</span>
              <input
                {...form.register("name")}
                className="rounded-[1.1rem] border border-stone-200 bg-stone-50 px-5 py-4 text-sm font-semibold uppercase text-stone-950 outline-none transition focus:border-stone-400"
                placeholder="KARAKOPRU MENUSU"
              />
              <FieldError message={form.formState.errors.name?.message} />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[#8fa1ba]">Menu Kisa Adi</span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  {...form.register("slug")}
                  className="flex-1 rounded-[1.1rem] border border-stone-200 bg-stone-50 px-5 py-4 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                  placeholder="karakopru-menusu"
                />
                <button
                  type="button"
                  onClick={() =>
                    form.setValue("slug", slugify(nameValue ?? ""), {
                      shouldValidate: true,
                    })
                  }
                  className="rounded-[1.1rem] border border-stone-200 px-4 py-4 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  Uret
                </button>
              </div>
              <FieldError message={form.formState.errors.slug?.message} />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[#8fa1ba]">Kapak Gorseli</span>
              <input
                {...form.register("coverImageUrl")}
                className="rounded-[1.1rem] border border-stone-200 bg-stone-50 px-5 py-4 text-sm text-stone-900 outline-none transition focus:border-stone-400"
                placeholder="https://... veya yukaridan gorsel sec"
              />
              <div className="rounded-[1.2rem] border border-dashed border-stone-200 bg-[#fafcff] p-4">
                <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
                  <div className="overflow-hidden rounded-[1rem] border border-stone-200 bg-white">
                    {coverPreview ? (
                      <AppImage
                        src={coverPreview}
                        alt="Menu kapak gorseli"
                        width={320}
                        height={180}
                        className="h-[120px] w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-[120px] items-center justify-center bg-stone-50 text-stone-400">
                        <ImagePlus className="size-5" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm leading-6 text-stone-500">
                      Menu kartinin ust kapak goruntusu burada kullanilir.
                      Onerilen oran yatay 16:9.
                    </p>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-[0.9rem] border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50">
                      <ImagePlus className="size-4" />
                      Resim Sec
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (event) => {
                          const file = event.target.files?.[0]
                          if (!file) return

                          const dataUrl = await fileToDataUrl(file)
                          setCoverUploadPreview(dataUrl)
                          form.setValue("coverImageUrl", dataUrl, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          })
                          event.target.value = ""
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <FieldError message={form.formState.errors.coverImageUrl?.message} />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[#8fa1ba]">Aciklama</span>
              <textarea
                {...form.register("description")}
                rows={3}
                className="rounded-[1.1rem] border border-stone-200 bg-stone-50 px-5 py-4 text-sm text-stone-900 outline-none transition focus:border-stone-400"
                placeholder="Bu menu hangi sube icin hangi urun gruplarini vitrine tasiyor?"
              />
              <FieldError message={form.formState.errors.description?.message} />
            </label>

            <input type="hidden" {...form.register("branchId")} />
            <input type="hidden" {...form.register("sortOrder", { valueAsNumber: true })} />

            <label className="grid gap-2 sm:max-w-[220px]">
              <span className="text-sm font-semibold text-[#8fa1ba]">Durum</span>
              <select
                {...form.register("status")}
                className="rounded-[1.1rem] border border-stone-200 bg-stone-50 px-4 py-4 text-sm outline-none transition focus:border-stone-400"
              >
                <option value="active">Aktif</option>
                <option value="passive">Pasif</option>
              </select>
              <FieldError message={form.formState.errors.status?.message} />
            </label>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              {onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-full px-6 py-3 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
                >
                  Iptal
                </button>
              ) : <div />}

              <Button
                type="submit"
                size="lg"
                className="h-12 min-w-[260px] rounded-full bg-[#ef1c24] text-white shadow-[0_16px_34px_rgba(239,28,36,0.22)] hover:bg-[#db171f]"
                disabled={isPending}
              >
                {isPending ? "Kaydediliyor..." : submitLabel}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-rose-600">{message}</p>
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

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { categoryFormSchema } from "@/lib/validators/catalog-management"
import type {
  CategoryFormValues,
  CategoryManagementItem,
  MenuOption,
} from "@/types/catalog-management"

interface CategoryFormPanelProps {
  menus: MenuOption[]
  initialValues?: CategoryManagementItem | null
  onSubmit: (values: CategoryFormValues) => Promise<void>
  onCancel: () => void
}

const defaultValues: CategoryFormValues = {
  name: "",
  description: "",
  sortOrder: 0,
  status: "active",
  menuId: "",
}

export function CategoryFormPanel({
  menus,
  initialValues,
  onSubmit,
  onCancel,
}: CategoryFormPanelProps) {
  const [isPending, setIsPending] = useState(false)
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (initialValues) {
      form.reset({
        name: initialValues.name,
        description: initialValues.description,
        sortOrder: initialValues.sortOrder,
        status: initialValues.status,
        menuId: initialValues.menuId,
      })
      return
    }

    form.reset({
      ...defaultValues,
      menuId: menus[0]?.id ?? "",
      sortOrder: menus.length ? 1 : 0,
    })
  }, [form, initialValues, menus])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.25rem] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.38)]">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-5 right-5 inline-flex size-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-50 hover:text-stone-900"
          aria-label="Pencereyi kapat"
        >
          <X className="size-4" />
        </button>

        <div className="px-8 pt-9 pb-8 sm:px-9">
          <div className="min-w-0">
            <p className="text-[2rem] font-black uppercase leading-none tracking-tight text-stone-950">
              {initialValues ? "Düzenle: Kategori" : "Yeni Kategori"}
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
            <Field label="İsim / Başlık" error={form.formState.errors.name?.message}>
              <input
                {...form.register("name")}
                className="rounded-[1.1rem] border border-stone-200 bg-stone-50 px-5 py-4 text-sm font-semibold uppercase text-stone-950 outline-none transition focus:border-stone-400"
                placeholder="COMBO MENULER"
              />
            </Field>

            <Field
              label="Menü Kısa Açıklaması"
              error={form.formState.errors.description?.message}
            >
              <textarea
                {...form.register("description")}
                rows={3}
                className="rounded-[1.1rem] border border-stone-200 bg-stone-50 px-5 py-4 text-sm text-stone-900 outline-none transition focus:border-stone-400"
                placeholder="Kategoriyi menüde ayırt edecek kısa açıklamayı girin."
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Bağlı Menü" error={form.formState.errors.menuId?.message}>
                <select
                  {...form.register("menuId")}
                  className="rounded-[1.1rem] border border-stone-200 bg-stone-50 px-4 py-4 text-sm outline-none transition focus:border-stone-400"
                >
                  <option value="">Menü seçin</option>
                  {menus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Durum" error={form.formState.errors.status?.message}>
                <select
                  {...form.register("status")}
                  className="rounded-[1.1rem] border border-stone-200 bg-stone-50 px-4 py-4 text-sm outline-none transition focus:border-stone-400"
                >
                  <option value="active">Aktif</option>
                  <option value="passive">Pasif</option>
                </select>
              </Field>

              <Field
                label="Sıralama"
                error={form.formState.errors.sortOrder?.message}
              >
                <input
                  type="number"
                  {...form.register("sortOrder", { valueAsNumber: true })}
                  className="rounded-[1.1rem] border border-stone-200 bg-stone-50 px-4 py-4 text-sm outline-none transition focus:border-stone-400"
                />
              </Field>
            </div>

            <div className="rounded-[1.2rem] border border-dashed border-stone-200 bg-[#fafcff] px-4 py-5">
              <p className="text-sm font-semibold text-stone-800">Kapak Görseli</p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Bu projede kategori kapak görseli alanı henüz veri modelinde yok.
                İstersen bir sonraki adımda bunu da ekleyip tam olarak görseldeki
                akışla çalışacak hale getirebilirim.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full px-6 py-3 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
              >
                İptal
              </button>

              <Button
                type="submit"
                size="lg"
                className="h-12 min-w-[260px] rounded-full bg-[#ef1c24] text-white shadow-[0_16px_34px_rgba(239,28,36,0.22)] hover:bg-[#db171f]"
                disabled={isPending}
              >
                {isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
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
      <span className="text-sm font-semibold text-[#8fa1ba]">{label}</span>
      {children}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  )
}

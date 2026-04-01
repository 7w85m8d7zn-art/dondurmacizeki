"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ImagePlus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import { AppImage } from "@/components/ui/app-image"
import { Button } from "@/components/ui/button"
import { productFormSchema } from "@/lib/validators/catalog-management"
import type {
  CategoryOption,
  MenuOption,
  ProductFormValues,
  ProductManagementItem,
} from "@/types/catalog-management"

interface ProductFormPanelProps {
  menus: MenuOption[]
  categories: CategoryOption[]
  preferredMenuId?: string | null
  initialValues?: ProductManagementItem | null
  onSubmit: (values: ProductFormValues) => Promise<void>
  onCancel: () => void
}

const defaultValues: ProductFormValues = {
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  status: "active",
  sortOrder: 0,
  categoryId: "",
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
        return
      }

      reject(new Error("Görsel okunamadı."))
    }

    reader.onerror = () => reject(new Error("Görsel okunamadı."))
    reader.readAsDataURL(file)
  })
}

export function ProductFormPanel({
  menus,
  categories,
  preferredMenuId,
  initialValues,
  onSubmit,
  onCancel,
}: ProductFormPanelProps) {
  const [isPending, setIsPending] = useState(false)
  const [localPreview, setLocalPreview] = useState<{
    productKey: string
    url: string
  } | null>(null)
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  })
  const currentProductKey = initialValues?.id ?? "new"
  const [selectedMenuId, setSelectedMenuId] = useState<string>("")

  const availableMenus = useMemo(() => menus, [menus])

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        selectedMenuId ? category.menuId === selectedMenuId : true,
      ),
    [categories, selectedMenuId],
  )

  useEffect(() => {
    if (initialValues) {
      const currentCategory = categories.find(
        (category) => category.id === initialValues.categoryId,
      )

      setLocalPreview(null)
      setSelectedMenuId(currentCategory?.menuId ?? preferredMenuId ?? "")
      form.reset({
        name: initialValues.name,
        description: initialValues.description,
        price: initialValues.price,
        imageUrl: initialValues.imageUrl,
        status: initialValues.status,
        sortOrder: initialValues.sortOrder,
        categoryId: initialValues.categoryId,
      })
      return
    }

    const nextMenuId =
      preferredMenuId ??
      availableMenus[0]?.id ??
      categories[0]?.menuId ??
      ""
    const nextCategoryId =
      categories.find((category) => category.menuId === nextMenuId)?.id ??
      categories[0]?.id ??
      ""

    setLocalPreview(null)
    setSelectedMenuId(nextMenuId)
    form.reset({
      ...defaultValues,
      categoryId: nextCategoryId,
      sortOrder: 1,
    })
  }, [availableMenus, categories, form, initialValues, preferredMenuId])

  useEffect(() => {
    const currentCategoryId = form.getValues("categoryId")
    const stillValid = filteredCategories.some(
      (category) => category.id === currentCategoryId,
    )

    if (!stillValid) {
      form.setValue("categoryId", filteredCategories[0]?.id ?? "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }
  }, [filteredCategories, form])

  const watchedName = form.watch("name")
  const watchedDescription = form.watch("description")
  const watchedPrice = form.watch("price")
  const watchedImageUrl = form.watch("imageUrl")
  const previewImageUrl =
    localPreview?.productKey === currentProductKey
      ? localPreview.url
      : watchedImageUrl

  return (
    <section className="rounded-[1.8rem] border border-stone-200 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-tight text-stone-950 sm:text-xl">
            {initialValues ? "Ürünü Düzenle" : "Yeni Ürün"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Fiyat, görsel, aktiflik ve ön izleme kartı ile ürünleri hızla yönet.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="w-fit rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
        >
          Temizle
        </button>
      </div>

      <form
        className="mt-6 grid gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          setIsPending(true)

          try {
            await onSubmit(values)
          } finally {
            setIsPending(false)
          }
        })}
      >
        <Field label="Ürün Adı" error={form.formState.errors.name?.message}>
          <input
            {...form.register("name")}
            className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-400"
          />
        </Field>

        <Field label="Açıklama" error={form.formState.errors.description?.message}>
          <textarea
            {...form.register("description")}
            rows={4}
            className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-400"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Bağlı Olduğu Menü">
            <select
              value={selectedMenuId}
              onChange={(event) => {
                const nextMenuId = event.target.value
                setSelectedMenuId(nextMenuId)
              }}
              className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-400"
            >
              <option value="">Menü seçin</option>
              {availableMenus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Bağlı Kategori" error={form.formState.errors.categoryId?.message}>
            <select
              {...form.register("categoryId")}
              className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-400"
            >
              <option value="">Kategori seçin</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Fiyat" error={form.formState.errors.price?.message}>
            <input
              type="number"
              step="0.01"
              {...form.register("price", { valueAsNumber: true })}
              className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-400"
            />
          </Field>

          <Field label="Sıralama" error={form.formState.errors.sortOrder?.message}>
            <input
              type="number"
              {...form.register("sortOrder", { valueAsNumber: true })}
              className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-400"
            />
          </Field>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <Field label="Görsel URL" error={form.formState.errors.imageUrl?.message}>
              <input
                {...form.register("imageUrl")}
                className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-400"
                placeholder="https://..."
              />
            </Field>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-800">
                Görsel Yükleme Alanı
              </span>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.4rem] border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center">
                <ImagePlus className="size-8 text-stone-400" />
                <div>
                  <p className="font-medium text-stone-900">Görsel seç veya bırak</p>
                  <p className="mt-1 text-sm text-stone-500">
                    Yüklediğiniz görsel ön izleme kartına anında yansır.
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file) return

                    try {
                      const preview = await fileToDataUrl(file)
                      form.setValue("imageUrl", preview, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                      setLocalPreview({
                        productKey: currentProductKey,
                        url: preview,
                      })
                    } catch {
                      setLocalPreview(null)
                    } finally {
                      event.target.value = ""
                    }
                  }}
                />
              </label>
            </label>
          </div>

          <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm font-medium text-stone-900">Ön İzleme Kartı</p>
            <div className="mt-4 overflow-hidden rounded-[1.2rem] border border-stone-200 bg-white">
              {previewImageUrl ? (
                <AppImage
                  src={previewImageUrl}
                  alt={watchedName || "Ürün ön izlemesi"}
                  width={520}
                  height={390}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="grid aspect-[4/3] place-items-center bg-stone-100 text-sm text-stone-500">
                  Görsel ön izlemesi
                </div>
              )}
              <div className="space-y-2 p-4">
                <p className="font-medium text-stone-900">
                  {watchedName || "Ürün adı"}
                </p>
                <p className="line-clamp-3 text-sm leading-6 text-stone-500">
                  {watchedDescription || "Kısa açıklama burada görünür."}
                </p>
                <p className="text-lg font-semibold text-stone-950">
                  {new Intl.NumberFormat("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                    maximumFractionDigits: 2,
                  }).format(Number.isFinite(watchedPrice) ? watchedPrice : 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Field label="Durum" error={form.formState.errors.status?.message}>
            <select
              {...form.register("status")}
              className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-400"
            >
              <option value="active">Aktif</option>
              <option value="passive">Pasif</option>
            </select>
          </Field>

          <Button
            type="submit"
            size="lg"
            className="mt-auto h-12 rounded-full bg-stone-950 px-6 text-white hover:bg-stone-800"
            disabled={isPending}
          >
            {isPending
              ? "Kaydediliyor..."
              : initialValues
                ? "Ürünü Güncelle"
                : "Ürün Ekle"}
          </Button>
        </div>
      </form>
    </section>
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

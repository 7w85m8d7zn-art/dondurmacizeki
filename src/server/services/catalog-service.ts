import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  getCatalogManagementData,
  isProductNameTaken,
  isValidCategoryId,
  isValidMenuId,
  reorderCategories,
  reorderProducts,
  updateCategory,
  updateProduct,
} from "@/data/catalog-store"
import { badRequest, notFound } from "@/lib/api-response"
import { conflict } from "@/lib/api-response"
import type {
  CategoryFormValues,
  ProductFormValues,
} from "@/types/catalog-management"

export async function listCatalog() {
  return getCatalogManagementData()
}

export async function createCategoryRecord(values: CategoryFormValues) {
  if (!(await isValidMenuId(values.menuId))) {
    throw badRequest("Bağlı menü bulunamadı.")
  }

  return createCategory(values)
}

export async function updateCategoryRecord(categoryId: string, values: CategoryFormValues) {
  if (!(await isValidMenuId(values.menuId))) {
    throw badRequest("Bağlı menü bulunamadı.")
  }

  const category = await updateCategory(categoryId, values)

  if (!category) {
    throw notFound("Kategori bulunamadı.")
  }

  return category
}

export async function deleteCategoryRecord(categoryId: string) {
  const deleted = await deleteCategory(categoryId)

  if (!deleted) {
    throw notFound("Kategori bulunamadı.")
  }

  return { id: categoryId }
}

export async function reorderCategoryRecords(orderedIds: string[]) {
  return reorderCategories(orderedIds)
}

export async function createProductRecord(values: ProductFormValues) {
  if (!(await isValidCategoryId(values.categoryId))) {
    throw badRequest("Bağlı kategori bulunamadı.")
  }

  if (await isProductNameTaken(values.name, values.categoryId)) {
    throw conflict("Bu isimde bir ürün zaten bulunuyor.")
  }

  return createProduct(values)
}

export async function updateProductRecord(productId: string, values: ProductFormValues) {
  if (!(await isValidCategoryId(values.categoryId))) {
    throw badRequest("Bağlı kategori bulunamadı.")
  }

  if (await isProductNameTaken(values.name, values.categoryId, productId)) {
    throw conflict("Bu isimde bir ürün zaten bulunuyor.")
  }

  const product = await updateProduct(productId, values)

  if (!product) {
    throw notFound("Ürün bulunamadı.")
  }

  return product
}

export async function deleteProductRecord(productId: string) {
  const deleted = await deleteProduct(productId)

  if (!deleted) {
    throw notFound("Ürün bulunamadı.")
  }

  return { id: productId }
}

export async function reorderProductRecords(orderedIds: string[]) {
  return reorderProducts(orderedIds)
}

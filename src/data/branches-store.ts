import "server-only"

import { visitorData } from "@/data/visitor-data"
import { slugify } from "@/lib/slugify"
import {
  getSupabaseAdminClient,
  shouldUseSupabaseFallback,
  throwIfSupabaseError,
} from "@/lib/supabase-data"
import type {
  BranchFormValues,
  BranchManagementData,
  BranchManagementItem,
  BranchStatus,
} from "@/types/branch-management"

type BranchRecord = {
  id: string
  name: string
  slug: string
  shortAddress: string
  fullAddress: string
  mapUrl: string
  phone: string
  serviceNote: string
  isActive: boolean
  sortOrder: number
}

function mapBranch(
  branch: BranchRecord,
  menuCount = 0,
): BranchManagementItem {
  return {
    id: branch.id,
    name: branch.name,
    slug: branch.slug,
    shortAddress: branch.shortAddress,
    fullAddress: branch.fullAddress,
    mapUrl: branch.mapUrl,
    phone: branch.phone,
    serviceNote: branch.serviceNote,
    status: branch.isActive ? "active" : "passive",
    sortOrder: branch.sortOrder,
    menuCount,
  }
}

function getFallbackBranchRecords(): BranchRecord[] {
  return visitorData.branches.map((branch, index) => ({
    id: branch.id,
    name: branch.name,
    slug: branch.slug,
    shortAddress: branch.shortAddress,
    fullAddress: branch.fullAddress,
    mapUrl: branch.mapUrl,
    phone: branch.phone,
    serviceNote: branch.serviceNote,
    isActive: true,
    sortOrder: index + 1,
  }))
}

async function fetchBranches() {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("Branch")
    .select("*")
    .order("sortOrder", { ascending: true })

  throwIfSupabaseError(error, "Şube listesi alınamadı")
  return (data ?? []) as BranchRecord[]
}

export async function getBranchOptions() {
  try {
    const branches = await fetchBranches()

    return branches
      .filter((branch) => branch.isActive)
      .map((branch) => ({
        id: branch.id,
        name: branch.name,
        shortAddress: branch.shortAddress,
      }))
  } catch (error) {
    if (!shouldUseSupabaseFallback(error)) {
      throw error
    }

    return getFallbackBranchRecords()
      .filter((branch) => branch.isActive)
      .sort((first, second) => first.sortOrder - second.sortOrder)
      .map((branch) => ({
        id: branch.id,
        name: branch.name,
        shortAddress: branch.shortAddress,
      }))
  }
}

export async function getBranchRecords() {
  try {
    const branches = await fetchBranches()
    return branches.map((branch) => mapBranch(branch))
  } catch (error) {
    if (!shouldUseSupabaseFallback(error)) {
      throw error
    }

    return getFallbackBranchRecords().map((branch) => mapBranch(branch, 1))
  }
}

export async function getBranchManagementData(
  getMenuCount: (branchId: string) => Promise<number>,
): Promise<BranchManagementData> {
  try {
    const branches = await fetchBranches()

    const items = await Promise.all(
      branches.map(async (branch) =>
        mapBranch(branch, await getMenuCount(branch.id)),
      ),
    )

    return { branches: items }
  } catch (error) {
    if (!shouldUseSupabaseFallback(error)) {
      throw error
    }

    return {
      branches: getFallbackBranchRecords().map((branch) => mapBranch(branch, 1)),
    }
  }
}

export async function getBranchById(branchId: string) {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from("Branch")
      .select("*")
      .eq("id", branchId)
      .maybeSingle()

    throwIfSupabaseError(error, "Şube detayı alınamadı")

    return data ? mapBranch(data as BranchRecord) : null
  } catch (error) {
    if (!shouldUseSupabaseFallback(error)) {
      throw error
    }

    const fallbackBranch = getFallbackBranchRecords().find(
      (branch) => branch.id === branchId,
    )

    return fallbackBranch ? mapBranch(fallbackBranch, 1) : null
  }
}

export async function createBranch(values: BranchFormValues) {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from("Branch")
    .insert({
      name: values.name,
      slug: slugify(values.slug),
      shortAddress: values.shortAddress,
      fullAddress: values.fullAddress,
      mapUrl: values.mapUrl,
      phone: values.phone,
      serviceNote: values.serviceNote,
      isActive: values.status === "active",
      sortOrder: values.sortOrder,
    })
    .select("*")
    .single()

  throwIfSupabaseError(error, "Şube oluşturulamadı")

  return mapBranch(data as BranchRecord)
}

export async function updateBranch(branchId: string, values: BranchFormValues) {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from("Branch")
    .update({
      name: values.name,
      slug: slugify(values.slug),
      shortAddress: values.shortAddress,
      fullAddress: values.fullAddress,
      mapUrl: values.mapUrl,
      phone: values.phone,
      serviceNote: values.serviceNote,
      isActive: values.status === "active",
      sortOrder: values.sortOrder,
    })
    .eq("id", branchId)
    .select("*")
    .maybeSingle()

  if (error) {
    return null
  }

  return data ? mapBranch(data as BranchRecord) : null
}

export async function deleteBranch(branchId: string) {
  const supabase = getSupabaseAdminClient()

  const { data: existing, error: findError } = await supabase
    .from("Branch")
    .select("id")
    .eq("id", branchId)
    .maybeSingle()

  if (findError || !existing) {
    return false
  }

  const { error } = await supabase.from("Branch").delete().eq("id", branchId)
  return !error
}

export async function toggleBranchStatus(branchId: string) {
  const supabase = getSupabaseAdminClient()

  const { data: branch, error: findError } = await supabase
    .from("Branch")
    .select("*")
    .eq("id", branchId)
    .maybeSingle()

  if (findError || !branch) {
    return null
  }

  const { data, error } = await supabase
    .from("Branch")
    .update({
      isActive: !branch.isActive,
    })
    .eq("id", branchId)
    .select("*")
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return mapBranch(data as BranchRecord)
}

export async function isBranchSlugTaken(
  slug: string,
  excludedBranchId?: string,
) {
  try {
    const supabase = getSupabaseAdminClient()
    let query = supabase
      .from("Branch")
      .select("id")
      .eq("slug", slugify(slug))

    if (excludedBranchId) {
      query = query.neq("id", excludedBranchId)
    }

    const { data, error } = await query.limit(1).maybeSingle()

    throwIfSupabaseError(error, "Şube slug kontrolü başarısız")

    return Boolean(data)
  } catch (error) {
    if (!shouldUseSupabaseFallback(error)) {
      throw error
    }

    return getFallbackBranchRecords().some(
      (branch) =>
        slugify(branch.slug) === slugify(slug) &&
        (!excludedBranchId || branch.id !== excludedBranchId),
    )
  }
}

export async function hasBranch(branchId: string, status?: BranchStatus) {
  try {
    const supabase = getSupabaseAdminClient()

    let query = supabase.from("Branch").select("id,isActive").eq("id", branchId)

    if (status) {
      query = query.eq("isActive", status === "active")
    }

    const { data, error } = await query.limit(1).maybeSingle()

    throwIfSupabaseError(error, "Şube varlık kontrolü başarısız")

    return Boolean(data)
  } catch (error) {
    if (!shouldUseSupabaseFallback(error)) {
      throw error
    }

    const fallbackBranch = getFallbackBranchRecords().find(
      (branch) => branch.id === branchId,
    )

    if (!fallbackBranch) {
      return false
    }

    return status ? fallbackBranch.isActive === (status === "active") : true
  }
}

export async function getBranchNameById(branchId: string) {
  try {
    const supabase = getSupabaseAdminClient()

    const { data, error } = await supabase
      .from("Branch")
      .select("name")
      .eq("id", branchId)
      .maybeSingle()

    throwIfSupabaseError(error, "Şube adı alınamadı")

    return data?.name ?? "Şube bulunamadı"
  } catch (error) {
    if (!shouldUseSupabaseFallback(error)) {
      throw error
    }

    return (
      getFallbackBranchRecords().find((branch) => branch.id === branchId)?.name ??
      "Şube bulunamadı"
    )
  }
}

import {
  getHomeContentConfig,
  updateHomeContentConfig,
} from "@/data/home-content-store"
import type { HomeContentConfig } from "@/types/home-content-management"

export async function getHomeContentRecord() {
  return getHomeContentConfig()
}

export async function updateHomeContentRecord(values: HomeContentConfig) {
  return updateHomeContentConfig(values)
}

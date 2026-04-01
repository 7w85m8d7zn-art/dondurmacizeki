"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

const HOME_CONTENT_STORAGE_KEY = "home-content-updated-at"

export function HomeContentChangeListener() {
  const router = useRouter()

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== HOME_CONTENT_STORAGE_KEY) {
        return
      }

      router.refresh()
    }

    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("storage", handleStorage)
    }
  }, [router])

  return null
}

"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import { useFinanceStore } from "@/store/finance"
import { useSettingsStore } from "@/store/settings"
import { useFeaturesStore } from "@/store/features"

const PUBLIC_ROUTES = ["/login", "/register"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, initialized, init } = useAuthStore()
  const { setUseAPI, syncAll } = useFinanceStore()
  const { setUseAPI: setSettingsAPI, syncSettings } = useSettingsStore()
  const { setUseAPI: setFeaturesAPI, syncFeatures } = useFeaturesStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => { init() }, [init])

  useEffect(() => {
    if (!initialized) return
    const isPublic = PUBLIC_ROUTES.includes(pathname)
    if (user) {
      setUseAPI(true)
      setSettingsAPI(true)
      setFeaturesAPI(true)
      syncAll()
      syncSettings()
      syncFeatures()
      if (isPublic) router.replace("/")
    } else {
      setUseAPI(false)
      setSettingsAPI(false)
      setFeaturesAPI(false)
      if (!isPublic) router.replace("/login")
    }
  }, [initialized, user, pathname]) // eslint-disable-line

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

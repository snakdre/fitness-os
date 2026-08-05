"use client"

import { useEffect } from "react"

export function CapacitorInit() {
  useEffect(() => {
    async function init() {
      try {
        const { Capacitor } = await import("@capacitor/core")
        if (!Capacitor.isNativePlatform()) return
        const { hideSplashScreen } = await import("@/lib/capacitor/splash-screen")
        // Give the app a moment to render before hiding splash
        setTimeout(() => hideSplashScreen(), 300)
      } catch {
        // Not running in Capacitor
      }
    }
    init()
  }, [])

  return null
}

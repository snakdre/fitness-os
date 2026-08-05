"use client"

import * as React from "react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import type { Session } from "next-auth"
import { useTheme } from "next-themes"
import { useEffect } from "react"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"

if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_POSTHOG_KEY
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false,
  })
}

interface ProvidersProps {
  children: React.ReactNode
  session?: Session | null
}

function StatusBarSync() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    async function sync() {
      try {
        const { Capacitor } = await import("@capacitor/core")
        if (!Capacitor.isNativePlatform()) return
        const { setStatusBarStyle } = await import("@/lib/capacitor/status-bar")
        await setStatusBarStyle(resolvedTheme === "dark")
      } catch {
        // Not running in Capacitor
      }
    }
    sync()
  }, [resolvedTheme])

  return null
}

function AppProviders({ children, session }: ProvidersProps) {
  const content = (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        storageKey="vyrox-theme"
        disableTransitionOnChange
      >
        <StatusBarSync />
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )

  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <PostHogProvider client={posthog}>{content}</PostHogProvider>
  }

  return content
}

export { AppProviders as Providers }

"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-surface-2 rounded-full p-1">
      <label className="relative cursor-pointer">
        <input
          type="radio"
          name="theme"
          value="light"
          checked={theme === "light"}
          onChange={() => setTheme("light")}
          className="sr-only"
        />
        <span
          className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
            theme === "light"
              ? "bg-white dark:bg-zinc-700 shadow text-orange-500"
              : "text-muted-foreground hover:text-muted-foreground dark:hover:text-foreground"
          }`}
        >
          <Sun className="w-4 h-4" />
        </span>
      </label>

      <label className="relative cursor-pointer">
        <input
          type="radio"
          name="theme"
          value="dark"
          checked={theme === "dark"}
          onChange={() => setTheme("dark")}
          className="sr-only"
        />
        <span
          className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
            theme === "dark"
              ? "bg-zinc-700 shadow text-orange-400"
              : "text-muted-foreground hover:text-muted-foreground dark:hover:text-foreground"
          }`}
        >
          <Moon className="w-4 h-4" />
        </span>
      </label>
    </div>
  )
}

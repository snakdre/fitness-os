"use client"

import Link from "next/link"
import { Dumbbell, Utensils, Bot, Activity, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const actions = [
  {
    href: "/workouts/new",
    label: "Log Workout",
    icon: Dumbbell,
    color: "text-blue-400",
    bg: "bg-blue-500/10 hover:bg-blue-500/20",
    border: "border-blue-500/20",
  },
  {
    href: "/nutrition/log",
    label: "Log Meal",
    icon: Utensils,
    color: "text-green-400",
    bg: "bg-green-500/10 hover:bg-green-500/20",
    border: "border-green-500/20",
  },
  {
    href: "/ai-coach",
    label: "Ask AI Coach",
    icon: Bot,
    color: "text-orange-400",
    bg: "bg-orange-500/10 hover:bg-orange-500/20",
    border: "border-orange-500/20",
  },
  {
    href: "/body",
    label: "Log Weight",
    icon: Activity,
    color: "text-purple-400",
    bg: "bg-purple-500/10 hover:bg-purple-500/20",
    border: "border-purple-500/20",
  },
]

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors",
              action.bg,
              action.border
            )}
          >
            <div className={cn("p-2 rounded-lg bg-surface", action.color)}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={cn("text-sm font-medium", action.color)}>{action.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

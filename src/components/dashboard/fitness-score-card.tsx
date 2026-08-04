"use client"

import { getFitnessScoreLabel, getFitnessScoreRingColor } from "@/lib/fitness-score"
import { cn } from "@/lib/utils"

interface FitnessScoreCardProps {
  score: number
  className?: string
}

export function FitnessScoreCard({ score, className }: FitnessScoreCardProps) {
  const label = getFitnessScoreLabel(score)
  const ringColor = getFitnessScoreRingColor(score)

  // SVG ring parameters
  const size = 120
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(100, Math.max(0, score))
  const dashOffset = circumference - (progress / 100) * circumference

  const textColor =
    score >= 90
      ? "text-purple-400"
      : score >= 75
        ? "text-blue-400"
        : score >= 60
          ? "text-green-400"
          : score >= 40
            ? "text-yellow-400"
            : "text-muted-foreground"

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#27272a"
            strokeWidth={10}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={ringColor}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold", textColor)}>{score}</span>
          <span className="text-xs text-muted-foreground font-medium">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className={cn("text-sm font-semibold", textColor)}>{label}</p>
        <p className="text-xs text-muted-foreground">Fitness Score</p>
      </div>
    </div>
  )
}

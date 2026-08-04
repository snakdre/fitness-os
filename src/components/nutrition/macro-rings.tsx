"use client"

import { cn } from "@/lib/utils"

interface MacroRingProps {
  label: string
  value: number
  goal: number
  unit?: string
  color: string
  size?: number
  strokeWidth?: number
}

function MacroRing({
  label,
  value,
  goal,
  unit = "g",
  color,
  size = 96,
  strokeWidth = 8,
}: MacroRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const center = size / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-100 dark:text-gray-800"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none">
            {Math.round(value)}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">{unit}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <p className="text-[10px] text-gray-400">
          {Math.round(percentage)}% of {goal}
          {unit}
        </p>
      </div>
    </div>
  )
}

interface MacroRingsProps {
  calories: number
  protein: number
  carbs: number
  fat: number
  goalCalories: number
  goalProtein: number
  goalCarbs: number
  goalFat: number
  className?: string
}

export function MacroRings({
  calories,
  protein,
  carbs,
  fat,
  goalCalories,
  goalProtein,
  goalCarbs,
  goalFat,
  className,
}: MacroRingsProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-6", className)}>
      <MacroRing
        label="Calories"
        value={calories}
        goal={goalCalories}
        unit="kcal"
        color="#f97316"
        size={100}
        strokeWidth={9}
      />
      <MacroRing
        label="Protein"
        value={protein}
        goal={goalProtein}
        unit="g"
        color="#3b82f6"
        size={100}
        strokeWidth={9}
      />
      <MacroRing
        label="Carbs"
        value={carbs}
        goal={goalCarbs}
        unit="g"
        color="#22c55e"
        size={100}
        strokeWidth={9}
      />
      <MacroRing
        label="Fat"
        value={fat}
        goal={goalFat}
        unit="g"
        color="#eab308"
        size={100}
        strokeWidth={9}
      />
    </div>
  )
}

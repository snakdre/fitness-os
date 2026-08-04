"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { cn } from "@/lib/utils"

interface DayData {
  date: string
  label: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
}

interface CalorieChartProps {
  data: DayData[]
  goalCalories?: number
  className?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{Math.round(entry.value)}</span>{" "}
          {entry.name === "calories" ? "kcal" : "g " + entry.name}
        </p>
      ))}
    </div>
  )
}

export function CalorieChart({ data, goalCalories, className }: CalorieChartProps) {
  return (
    <div className={cn("bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5", className)}>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Weekly Calories
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(249, 115, 22, 0.05)" }} />
          {goalCalories && (
            <ReferenceLine
              y={goalCalories}
              stroke="#f97316"
              strokeDasharray="4 4"
              label={{ value: "Goal", fill: "#f97316", fontSize: 11, position: "right" }}
            />
          )}
          <Bar
            dataKey="calories"
            fill="#f97316"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

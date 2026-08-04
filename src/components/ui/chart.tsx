"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import { cn } from "@/lib/utils"

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: Record<string, { label: string; color?: string }>
  children: React.ReactElement
}

function ChartContainer({
  className,
  children,
  config = {},
  ...props
}: ChartContainerProps) {
  // Inject CSS variables for chart colors
  const style = Object.entries(config).reduce(
    (acc, [key, value]) => {
      if (value.color) {
        acc[`--color-${key}`] = value.color
      }
      return acc
    },
    {} as Record<string, string>
  )

  return (
    <div
      className={cn("h-full w-full", className)}
      style={style}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

interface TooltipPayloadEntry {
  value?: number | string
  name?: string
  color?: string
  dataKey?: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
  formatter?: (value: number | string, name: string) => [string, string]
  labelFormatter?: (label: string) => string
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-md">
      {label && (
        <p className="mb-2 text-xs font-medium text-zinc-400">
          {labelFormatter ? labelFormatter(String(label)) : label}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, index) => {
          const rawValue = entry.value ?? ""
          const rawName = entry.name ?? entry.dataKey ?? ""
          const [formattedValue, formattedName] = formatter
            ? formatter(rawValue as number | string, rawName)
            : [String(rawValue), rawName]

          return (
            <div key={index} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-zinc-400">{formattedName}:</span>
              <span className="text-xs font-medium text-zinc-100">
                {formattedValue}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChartTooltipContent({
  active,
  payload,
  label,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-md">
      {label && (
        <p className="mb-2 text-xs font-medium text-zinc-400">{label}</p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-zinc-400">{entry.name}:</span>
            <span className="text-xs font-medium text-zinc-100">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, Tooltip as RechartsTooltip }

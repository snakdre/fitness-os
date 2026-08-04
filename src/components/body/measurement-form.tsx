"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { bodyMeasurementSchema } from "@/lib/validations/body"
import type { BodyMeasurementInput } from "@/lib/validations/body"
import { Loader2, Plus } from "lucide-react"
import { useState } from "react"

interface MeasurementFormProps {
  onAdded: (measurement: BodyMeasurementInput & { id: string; date: string }) => void
  onCancel: () => void
}

const fields = [
  { name: "weight" as const, label: "Weight (kg)", step: "0.1" },
  { name: "bodyFat" as const, label: "Body Fat (%)", step: "0.1" },
  { name: "chest" as const, label: "Chest (cm)", step: "0.1" },
  { name: "waist" as const, label: "Waist (cm)", step: "0.1" },
  { name: "hips" as const, label: "Hips (cm)", step: "0.1" },
  { name: "biceps" as const, label: "Biceps (cm)", step: "0.1" },
  { name: "thighs" as const, label: "Thighs (cm)", step: "0.1" },
  { name: "calves" as const, label: "Calves (cm)", step: "0.1" },
  { name: "shoulders" as const, label: "Shoulders (cm)", step: "0.1" },
  { name: "neck" as const, label: "Neck (cm)", step: "0.1" },
]

export function MeasurementForm({ onAdded, onCancel }: MeasurementFormProps) {
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BodyMeasurementInput>({
    resolver: zodResolver(bodyMeasurementSchema),
  })

  async function onSubmit(data: BodyMeasurementInput) {
    setSubmitting(true)
    try {
      const res = await fetch("/api/body", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        onAdded(json.data)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-surface-2 rounded-xl border border-border-strong p-4 space-y-4"
    >
      <h3 className="text-sm font-semibold text-foreground">Add Measurement</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {field.label}
            </label>
            <input
              type="number"
              step={field.step}
              {...register(field.name, { valueAsNumber: true })}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
              placeholder="—"
            />
            {errors[field.name] && (
              <p className="text-xs text-red-400 mt-0.5">{errors[field.name]?.message}</p>
            )}
          </div>
        ))}
        <div className="col-span-2 sm:col-span-3">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
          <input
            type="text"
            {...register("notes")}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
            placeholder="Optional notes"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-surface-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Save
        </button>
      </div>
    </form>
  )
}

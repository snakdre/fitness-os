"use client"

import { Trash2 } from "lucide-react"
import { format } from "date-fns"

interface Measurement {
  id: string
  date: string | Date
  weight?: number | null
  bodyFat?: number | null
  chest?: number | null
  waist?: number | null
  hips?: number | null
  biceps?: number | null
  thighs?: number | null
}

interface MeasurementsTableProps {
  measurements: Measurement[]
  onDelete: (id: string) => void
}

export function MeasurementsTable({ measurements, onDelete }: MeasurementsTableProps) {
  if (measurements.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No measurements recorded yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Date</th>
            <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Weight</th>
            <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">BF%</th>
            <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Waist</th>
            <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Chest</th>
            <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Hips</th>
            <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Biceps</th>
            <th className="py-2 px-3"></th>
          </tr>
        </thead>
        <tbody>
          {measurements.map((m) => (
            <tr key={m.id} className="border-b border-border/50 hover:bg-surface-2/30 transition-colors">
              <td className="py-2.5 px-3 text-foreground">
                {format(new Date(m.date), "MMM d, yyyy")}
              </td>
              <td className="py-2.5 px-3 text-right text-foreground">
                {m.weight != null ? `${m.weight} kg` : "—"}
              </td>
              <td className="py-2.5 px-3 text-right text-foreground">
                {m.bodyFat != null ? `${m.bodyFat}%` : "—"}
              </td>
              <td className="py-2.5 px-3 text-right text-foreground hidden sm:table-cell">
                {m.waist != null ? `${m.waist} cm` : "—"}
              </td>
              <td className="py-2.5 px-3 text-right text-foreground hidden md:table-cell">
                {m.chest != null ? `${m.chest} cm` : "—"}
              </td>
              <td className="py-2.5 px-3 text-right text-foreground hidden lg:table-cell">
                {m.hips != null ? `${m.hips} cm` : "—"}
              </td>
              <td className="py-2.5 px-3 text-right text-foreground hidden lg:table-cell">
                {m.biceps != null ? `${m.biceps} cm` : "—"}
              </td>
              <td className="py-2.5 px-3">
                <button
                  onClick={() => onDelete(m.id)}
                  className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                  aria-label="Delete measurement"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

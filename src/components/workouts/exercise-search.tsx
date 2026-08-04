"use client"

import { useState, useCallback } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"

type ExerciseCategory = "STRENGTH" | "CARDIO" | "FLEXIBILITY" | "BALANCE" | "SPORTS" | "OTHER"

const CATEGORIES: { value: ExerciseCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "STRENGTH", label: "Strength" },
  { value: "CARDIO", label: "Cardio" },
  { value: "FLEXIBILITY", label: "Flexibility" },
  { value: "BALANCE", label: "Balance" },
  { value: "SPORTS", label: "Sports" },
  { value: "OTHER", label: "Other" },
]

const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "legs",
  "glutes",
  "hamstrings",
  "quadriceps",
  "calves",
  "core",
  "abs",
]

interface ExerciseSearchProps {
  onSearch: (query: string) => void
  onCategoryChange: (category: ExerciseCategory | undefined) => void
  onMuscleGroupChange?: (muscleGroup: string | undefined) => void
  initialSearch?: string
  initialCategory?: ExerciseCategory | "ALL"
}

export function ExerciseSearch({
  onSearch,
  onCategoryChange,
  onMuscleGroupChange,
  initialSearch = "",
  initialCategory = "ALL",
}: ExerciseSearchProps) {
  const [query, setQuery] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | "ALL">(
    initialCategory
  )
  const [selectedMuscle, setSelectedMuscle] = useState<string | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value)
      onSearch(value)
    },
    [onSearch]
  )

  const handleCategoryChange = useCallback(
    (cat: ExerciseCategory | "ALL") => {
      setSelectedCategory(cat)
      onCategoryChange(cat === "ALL" ? undefined : cat)
    },
    [onCategoryChange]
  )

  const handleMuscleChange = useCallback(
    (muscle: string | undefined) => {
      setSelectedMuscle(muscle)
      onMuscleGroupChange?.(muscle)
    },
    [onMuscleGroupChange]
  )

  const clearSearch = () => handleSearch("")

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`px-3 py-2.5 rounded-lg border transition-colors flex items-center gap-1.5 text-sm ${
            showFilters || selectedMuscle
              ? "border-indigo-400 bg-indigo-50 text-indigo-700"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {selectedMuscle && (
            <span className="w-2 h-2 rounded-full bg-indigo-500 ml-0.5" />
          )}
        </button>
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === cat.value
                ? "bg-indigo-600 text-foreground"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Muscle group filter */}
      {showFilters && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-2">Muscle Group</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleMuscleChange(undefined)}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors capitalize ${
                !selectedMuscle
                  ? "bg-indigo-600 text-foreground"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              Any
            </button>
            {MUSCLE_GROUPS.map((mg) => (
              <button
                key={mg}
                onClick={() => handleMuscleChange(mg === selectedMuscle ? undefined : mg)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors capitalize ${
                  selectedMuscle === mg
                    ? "bg-indigo-600 text-foreground"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {mg}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

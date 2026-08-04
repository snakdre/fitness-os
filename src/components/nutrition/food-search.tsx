"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface FoodItem {
  id: string
  name: string
  brand?: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number | null
  servingSize: number
  servingUnit: string
  isCustom: boolean
}

interface FoodSearchProps {
  onSelect: (item: FoodItem) => void
  placeholder?: string
  className?: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function FoodSearch({ onSelect, placeholder = "Search foods...", className }: FoodSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const search = useCallback(async (q: string) => {
    if (q.trim().length === 0) {
      setResults([])
      setIsOpen(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/food?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const json = await res.json()
        setResults(json.data ?? [])
        setIsOpen(true)
      }
    } catch {
      // Silently fail search
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    search(debouncedQuery)
  }, [debouncedQuery, search])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(item: FoodItem) {
    onSelect(item)
    setQuery("")
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-9 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          {loading ? "⌛" : "🔍"}
        </span>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block truncate">
                    {item.name}
                  </span>
                  {item.brand && (
                    <span className="text-xs text-gray-400 block truncate">{item.brand}</span>
                  )}
                </div>
                <div className="ml-3 shrink-0 text-right">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 block">
                    {Math.round(item.calories)} kcal
                  </span>
                  <span className="text-xs text-gray-400">
                    per {item.servingSize}{item.servingUnit}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-0.5">
                <span className="text-xs text-blue-500">P {item.protein}g</span>
                <span className="text-xs text-green-500">C {item.carbs}g</span>
                <span className="text-xs text-yellow-500">F {item.fat}g</span>
                {item.isCustom && (
                  <span className="text-xs text-purple-400 ml-auto">Custom</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && !loading && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            No foods found for &ldquo;{query}&rdquo;
          </div>
        </div>
      )}
    </div>
  )
}

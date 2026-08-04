"use client"

import { useState } from "react"
import { FoodItemRow } from "./food-item-row"
import { cn } from "@/lib/utils"

type MealType =
  | "BREAKFAST"
  | "LUNCH"
  | "DINNER"
  | "SNACK"
  | "PRE_WORKOUT"
  | "POST_WORKOUT"

interface MealItem {
  id: string
  quantity: number
  servingSize: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number | null
  foodItem: {
    name: string
    brand?: string | null
    servingUnit: string
  }
}

interface MealCardProps {
  mealId: string
  mealType: MealType
  name?: string | null
  items: MealItem[]
  onAddFood?: (mealId: string) => void
  onRemoveItem?: (mealId: string, itemId: string) => void
  onDeleteMeal?: (mealId: string) => void
  className?: string
}

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snack",
  PRE_WORKOUT: "Pre-Workout",
  POST_WORKOUT: "Post-Workout",
}

const MEAL_TYPE_ICONS: Record<MealType, string> = {
  BREAKFAST: "🌅",
  LUNCH: "☀️",
  DINNER: "🌙",
  SNACK: "🍎",
  PRE_WORKOUT: "⚡",
  POST_WORKOUT: "💪",
}

export function MealCard({
  mealId,
  mealType,
  name,
  items,
  onAddFood,
  onRemoveItem,
  onDeleteMeal,
  className,
}: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0)
  const totalProtein = items.reduce((sum, item) => sum + item.protein, 0)
  const totalCarbs = items.reduce((sum, item) => sum + item.carbs, 0)
  const totalFat = items.reduce((sum, item) => sum + item.fat, 0)

  const label = name || MEAL_TYPE_LABELS[mealType]
  const icon = MEAL_TYPE_ICONS[mealType]

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <span className="text-lg">{icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {label}
            </h3>
            {items.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(totalCalories)} kcal · P {Math.round(totalProtein)}g · C{" "}
                {Math.round(totalCarbs)}g · F {Math.round(totalFat)}g
              </p>
            )}
          </div>
          <span
            className={cn(
              "ml-auto text-gray-400 transition-transform",
              isExpanded ? "rotate-180" : ""
            )}
          >
            ▾
          </span>
        </button>
        <div className="flex items-center gap-1 ml-2">
          {onAddFood && (
            <button
              onClick={() => onAddFood(mealId)}
              className="text-xs px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors font-medium"
            >
              + Add
            </button>
          )}
          {onDeleteMeal && (
            <button
              onClick={() => onDeleteMeal(mealId)}
              className="text-xs px-2 py-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Delete meal"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      {isExpanded && (
        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {items.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">No items yet</p>
              {onAddFood && (
                <button
                  onClick={() => onAddFood(mealId)}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-600 font-medium"
                >
                  Add food
                </button>
              )}
            </div>
          ) : (
            items.map((item) => (
              <FoodItemRow
                key={item.id}
                name={item.foodItem.name}
                brand={item.foodItem.brand}
                calories={item.calories}
                protein={item.protein}
                carbs={item.carbs}
                fat={item.fat}
                quantity={item.quantity}
                servingSize={item.servingSize}
                servingUnit={item.foodItem.servingUnit}
                onRemove={
                  onRemoveItem ? () => onRemoveItem(mealId, item.id) : undefined
                }
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

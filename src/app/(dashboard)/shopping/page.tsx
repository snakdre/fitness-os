"use client"

import { useEffect, useState } from "react"
import { ShoppingListCard } from "@/components/shopping/shopping-list-card"
import { ShoppingItemRow } from "@/components/shopping/shopping-item-row"
import { Bot, Plus, Loader2, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ShoppingListItem {
  id: string
  name: string
  quantity?: number | null
  unit?: string | null
  category?: string | null
  isPurchased: boolean
  estimatedCost?: number | null
}

interface ShoppingList {
  id: string
  name: string
  aiGenerated: boolean
  createdAt: string
  updatedAt: string
  items: ShoppingListItem[]
}

export default function ShoppingPage() {
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newItemName, setNewItemName] = useState("")
  const [addingItem, setAddingItem] = useState(false)

  async function loadLists() {
    setLoading(true)
    try {
      const res = await fetch("/api/shopping")
      if (res.ok) {
        const json = await res.json()
        setLists(json.data ?? [])
        if (!selectedListId && json.data?.length > 0) {
          setSelectedListId(json.data[0].id)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLists()
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch("/api/shopping/generate", { method: "POST" })
      if (res.ok) {
        const json = await res.json()
        setLists((prev) => [json.data, ...prev])
        setSelectedListId(json.data.id)
      }
    } finally {
      setGenerating(false)
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/shopping/${id}`, { method: "DELETE" })
    if (res.ok) {
      setLists((prev) => prev.filter((l) => l.id !== id))
      if (selectedListId === id) {
        setSelectedListId(lists.find((l) => l.id !== id)?.id ?? null)
      }
    }
  }

  async function handleToggleItem(listId: string, itemId: string, isPurchased: boolean) {
    const res = await fetch(`/api/shopping/${listId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_item", itemId, isPurchased }),
    })
    if (res.ok) {
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? {
                ...l,
                items: l.items.map((item) =>
                  item.id === itemId ? { ...item, isPurchased } : item
                ),
              }
            : l
        )
      )
    }
  }

  async function handleAddItem(listId: string) {
    if (!newItemName.trim()) return
    setAddingItem(true)
    try {
      const res = await fetch(`/api/shopping/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_item",
          item: { name: newItemName.trim() },
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setLists((prev) =>
          prev.map((l) =>
            l.id === listId ? { ...l, items: [...l.items, json.data] } : l
          )
        )
        setNewItemName("")
      }
    } finally {
      setAddingItem(false)
    }
  }

  const selectedList = lists.find((l) => l.id === selectedListId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Shopping Lists</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            {generating ? "Generating..." : "AI Generate"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lists sidebar */}
        <div className="space-y-3">
          {lists.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border p-6 text-center">
              <Bot className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">No shopping lists yet</p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="text-sm text-orange-400 hover:text-orange-300 font-medium"
              >
                Generate AI list
              </button>
            </div>
          ) : (
            lists.map((list) => (
              <ShoppingListCard
                key={list.id}
                list={list}
                isSelected={selectedListId === list.id}
                onSelect={() => setSelectedListId(list.id)}
                onDelete={() => handleDelete(list.id)}
              />
            ))
          )}
        </div>

        {/* Selected list detail */}
        <div className="lg:col-span-2">
          {selectedList ? (
            <div className="bg-surface rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{selectedList.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedList.items.filter((i) => i.isPurchased).length} /{" "}
                    {selectedList.items.length} items purchased
                  </p>
                </div>
                {selectedList.aiGenerated && (
                  <span className="flex items-center gap-1 text-xs bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full">
                    <Bot className="w-3 h-3" />
                    AI Generated
                  </span>
                )}
              </div>

              {/* Add item */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddItem(selectedList.id)
                  }}
                  placeholder="Add item..."
                  className="flex-1 bg-surface-2 border border-border-strong rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
                />
                <button
                  onClick={() => handleAddItem(selectedList.id)}
                  disabled={addingItem || !newItemName.trim()}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    newItemName.trim() && !addingItem
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-surface-2 text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {addingItem ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Items grouped by category */}
              {selectedList.items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No items in this list yet
                </p>
              ) : (
                <div className="space-y-1">
                  {selectedList.items.map((item) => (
                    <ShoppingItemRow
                      key={item.id}
                      item={item}
                      onToggle={(itemId, isPurchased) =>
                        handleToggleItem(selectedList.id, itemId, isPurchased)
                      }
                    />
                  ))}
                </div>
              )}

              {/* Total cost */}
              {selectedList.items.some((i) => i.estimatedCost != null) && (
                <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated total</span>
                  <span className="text-foreground font-medium">
                    $
                    {selectedList.items
                      .reduce((sum, i) => sum + (i.estimatedCost ?? 0), 0)
                      .toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface rounded-xl border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">Select a shopping list to view items</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

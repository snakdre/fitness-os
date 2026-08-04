import { auth } from "@/lib/auth"
import {
  getShoppingList,
  updateShoppingList,
  deleteShoppingList,
  addItem,
  updateItem,
  markItemPurchased,
} from "@/services/shopping.service"
import {
  createShoppingItemSchema,
  updateShoppingItemSchema,
  updateShoppingListSchema,
} from "@/lib/validations/shopping"
import { trackEvent } from "@/lib/analytics"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const list = await getShoppingList(id, session.user.id)
    if (!list) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }
    return Response.json({ data: list })
  } catch (error) {
    console.error("Get shopping list error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Check if this is an item operation
  const itemAction = (body as Record<string, unknown>)?.action as string | undefined

  if (itemAction === "add_item") {
    const result = createShoppingItemSchema.safeParse((body as Record<string, unknown>).item)
    if (!result.success) {
      return Response.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 })
    }
    try {
      const item = await addItem(id, session.user.id, result.data)
      if (!item) return Response.json({ error: "Not found" }, { status: 404 })
      return Response.json({ data: item })
    } catch (error) {
      console.error("Add item error:", error)
      return Response.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  if (itemAction === "update_item") {
    const itemId = (body as Record<string, unknown>).itemId as string
    const result = updateShoppingItemSchema.safeParse((body as Record<string, unknown>).item)
    if (!result.success) {
      return Response.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 })
    }
    try {
      const item = await updateItem(itemId, session.user.id, result.data)
      if (!item) return Response.json({ error: "Not found" }, { status: 404 })
      if (result.data.isPurchased !== undefined) {
        trackEvent(session.user.id, "ShoppingListItemToggled", { isPurchased: result.data.isPurchased })
      }
      return Response.json({ data: item })
    } catch (error) {
      console.error("Update item error:", error)
      return Response.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  if (itemAction === "toggle_item") {
    const itemId = (body as Record<string, unknown>).itemId as string
    const isPurchased = (body as Record<string, unknown>).isPurchased as boolean
    try {
      const item = await markItemPurchased(itemId, session.user.id, isPurchased)
      if (!item) return Response.json({ error: "Not found" }, { status: 404 })
      trackEvent(session.user.id, "ShoppingListItemToggled", { isPurchased })
      return Response.json({ data: item })
    } catch (error) {
      console.error("Toggle item error:", error)
      return Response.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  // Default: update the list itself
  const result = updateShoppingListSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 })
  }

  try {
    const list = await updateShoppingList(id, session.user.id, result.data)
    if (!list) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json({ data: list })
  } catch (error) {
    console.error("Update shopping list error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const result = await deleteShoppingList(id, session.user.id)
    if (!result) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }
    return Response.json({ data: { success: true } })
  } catch (error) {
    console.error("Delete shopping list error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

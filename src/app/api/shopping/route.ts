import { auth } from "@/lib/auth"
import { getShoppingLists, createShoppingList } from "@/services/shopping.service"
import { createShoppingListSchema } from "@/lib/validations/shopping"
import { trackEvent } from "@/lib/analytics"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const lists = await getShoppingLists(session.user.id)
    return Response.json({ data: lists })
  } catch (error) {
    console.error("Get shopping lists error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const result = createShoppingListSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 })
  }

  try {
    const list = await createShoppingList(session.user.id, result.data)
    trackEvent(session.user.id, "ShoppingListCreated")
    return Response.json({ data: list }, { status: 201 })
  } catch (error) {
    console.error("Create shopping list error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

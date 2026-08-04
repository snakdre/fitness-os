import { auth } from "@/lib/auth"
import { generateAIShoppingList } from "@/services/shopping.service"
import { trackEvent } from "@/lib/analytics"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "AI service is not configured. Please contact support." },
      { status: 503 }
    )
  }

  try {
    const shoppingList = await generateAIShoppingList(session.user.id)
    trackEvent(session.user.id, "ShoppingListGenerated", { itemCount: shoppingList.items.length })
    return Response.json({ data: shoppingList }, { status: 201 })
  } catch (error) {
    console.error("Generate shopping list error:", error)
    return Response.json({ error: "Failed to generate shopping list" }, { status: 500 })
  }
}

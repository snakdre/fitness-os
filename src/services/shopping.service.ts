import { db } from "@/lib/db"
import { chat } from "@/lib/ai/client"
import { getShoppingListGenerationPrompt } from "@/lib/ai/prompts"
import type {
  CreateShoppingListInput,
  CreateShoppingItemInput,
  UpdateShoppingItemInput,
} from "@/lib/validations/shopping"

export async function getShoppingLists(userId: string) {
  return db.shoppingList.findMany({
    where: { userId },
    include: {
      items: {
        orderBy: [{ category: "asc" }, { name: "asc" }],
      },
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getShoppingList(id: string, userId: string) {
  return db.shoppingList.findFirst({
    where: { id, userId },
    include: {
      items: {
        orderBy: [{ category: "asc" }, { name: "asc" }],
      },
    },
  })
}

export async function createShoppingList(userId: string, data: CreateShoppingListInput) {
  const { items, ...listData } = data

  return db.shoppingList.create({
    data: {
      userId,
      ...listData,
      ...(items && items.length > 0
        ? {
            items: {
              create: items,
            },
          }
        : {}),
    },
    include: { items: true },
  })
}

export async function updateShoppingList(id: string, userId: string, data: { name?: string; notes?: string }) {
  const list = await db.shoppingList.findFirst({ where: { id, userId } })
  if (!list) return null

  return db.shoppingList.update({
    where: { id },
    data,
    include: { items: true },
  })
}

export async function addItem(
  shoppingListId: string,
  userId: string,
  item: CreateShoppingItemInput
) {
  // Verify ownership
  const list = await db.shoppingList.findFirst({
    where: { id: shoppingListId, userId },
  })
  if (!list) return null

  return db.shoppingListItem.create({
    data: { shoppingListId, ...item },
  })
}

export async function updateItem(
  itemId: string,
  userId: string,
  data: UpdateShoppingItemInput
) {
  // Verify ownership via join
  const item = await db.shoppingListItem.findFirst({
    where: { id: itemId, shoppingList: { userId } },
  })
  if (!item) return null

  return db.shoppingListItem.update({ where: { id: itemId }, data })
}

export async function deleteShoppingList(id: string, userId: string) {
  const list = await db.shoppingList.findFirst({ where: { id, userId } })
  if (!list) return null

  return db.shoppingList.delete({ where: { id } })
}

export async function markItemPurchased(
  itemId: string,
  userId: string,
  isPurchased: boolean
) {
  const item = await db.shoppingListItem.findFirst({
    where: { id: itemId, shoppingList: { userId } },
  })
  if (!item) return null

  return db.shoppingListItem.update({
    where: { id: itemId },
    data: { isPurchased },
  })
}

export async function generateAIShoppingList(userId: string) {
  // Gather user context
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      goals: { where: { status: "ACTIVE" } },
      nutritionGoal: true,
    },
  })

  if (!user) throw new Error("User not found")

  const goals = user.goals.map((g) => g.type.replace(/_/g, " ").toLowerCase())

  const userContext = {
    goals,
    currentWeight: user.profile?.weight ?? undefined,
    targetWeight: user.goals[0]?.targetWeight ?? undefined,
    activityLevel: user.profile?.activityLevel ?? undefined,
    nutritionGoal: user.nutritionGoal
      ? {
          calories: (user.nutritionGoal as { calories?: number }).calories,
          protein: (user.nutritionGoal as { protein?: number }).protein,
          carbs: (user.nutritionGoal as { carbs?: number }).carbs,
          fat: (user.nutritionGoal as { fat?: number }).fat,
        }
      : null,
  }

  const systemPrompt = getShoppingListGenerationPrompt(userContext)

  const { content } = await chat(
    [{ role: "user", content: "Generate my weekly shopping list." }],
    systemPrompt,
    2048
  )

  // Parse the JSON response
  let items: Array<{
    name: string
    quantity?: number
    unit?: string
    category?: string
    estimatedCost?: number
  }> = []

  try {
    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      items = JSON.parse(jsonMatch[0])
    }
  } catch {
    // If parsing fails, create a simple list
    items = [{ name: "Shopping list generation failed - please try again", category: "other" }]
  }

  // Create the shopping list in DB
  const shoppingList = await db.shoppingList.create({
    data: {
      userId,
      name: `AI Generated List - ${new Date().toLocaleDateString()}`,
      aiGenerated: true,
      items: {
        create: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          estimatedCost: item.estimatedCost,
        })),
      },
    },
    include: { items: true },
  })

  return shoppingList
}

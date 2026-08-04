import { db } from "@/lib/db"
import { chat } from "@/lib/ai/client"
import { getShoppingListSystemPrompt } from "@/lib/ai/prompts"

export async function getOrCreateConversation(userId: string, conversationId?: string) {
  if (conversationId) {
    const conversation = await db.aIConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    })
    if (conversation) return conversation
  }

  // Create a new conversation
  return db.aIConversation.create({
    data: {
      userId,
      title: "New Conversation",
      messages: {},
    },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  })
}

export async function saveMessage(
  conversationId: string,
  role: "USER" | "ASSISTANT" | "SYSTEM",
  content: string,
  tokens?: number
) {
  const message = await db.aIMessage.create({
    data: { conversationId, role, content, tokens },
  })

  // Update conversation title from first user message if still default
  if (role === "USER") {
    const conversation = await db.aIConversation.findUnique({
      where: { id: conversationId },
      select: { title: true },
    })

    if (conversation?.title === "New Conversation") {
      const title = content.length > 50 ? content.substring(0, 47) + "..." : content
      await db.aIConversation.update({
        where: { id: conversationId },
        data: { title },
      })
    } else {
      // Just update updatedAt
      await db.aIConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      })
    }
  }

  return message
}

export async function getConversationHistory(conversationId: string, userId: string) {
  return db.aIConversation.findFirst({
    where: { id: conversationId, userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  })
}

export async function getUserAIContext(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      goals: { where: { status: "ACTIVE" } },
    },
  })

  if (!user) {
    return {
      name: "User",
      goals: [],
      currentWeight: undefined,
      targetWeight: undefined,
      activityLevel: undefined,
      recentWorkouts: [],
      nutritionSummary: undefined,
    }
  }

  // Get last 7 days of workouts
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentWorkouts = await db.workout.findMany({
    where: { userId, date: { gte: sevenDaysAgo }, status: "COMPLETED" },
    select: { name: true, date: true },
    orderBy: { date: "desc" },
    take: 10,
  })

  // Get recent meal item summaries (calories/protein from MealItems)
  const recentMealItems = await db.mealItem.findMany({
    where: { meal: { userId, date: { gte: sevenDaysAgo } } },
    select: { calories: true, protein: true },
    take: 100,
  })

  // Compute nutrition averages
  let nutritionSummary: string | undefined
  if (recentMealItems.length > 0) {
    const days = 7
    const totalCalories = recentMealItems.reduce((sum, m) => sum + m.calories, 0)
    const totalProtein = recentMealItems.reduce((sum, m) => sum + m.protein, 0)
    const avgCalories = Math.round(totalCalories / days)
    const avgProtein = Math.round(totalProtein / days)
    nutritionSummary = `~${avgCalories} kcal/day, ~${avgProtein}g protein/day`
  }

  const goals = user.goals.map((g) => {
    const label = g.type.replace(/_/g, " ").toLowerCase()
    return g.targetWeight ? `${label} (target: ${g.targetWeight}kg)` : label
  })

  const workoutNames = recentWorkouts.map((w) => w.name ?? "workout").filter(Boolean)

  return {
    name: user.name ?? "there",
    goals,
    currentWeight: user.profile?.weight ?? undefined,
    targetWeight: user.goals[0]?.targetWeight ?? undefined,
    activityLevel: user.profile?.activityLevel?.replace(/_/g, " ").toLowerCase() ?? undefined,
    recentWorkouts: workoutNames,
    nutritionSummary,
  }
}

export async function listConversations(userId: string) {
  return db.aIConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  })
}

export async function deleteConversation(conversationId: string, userId: string) {
  const conversation = await db.aIConversation.findFirst({
    where: { id: conversationId, userId },
  })
  if (!conversation) return null

  return db.aIConversation.delete({ where: { id: conversationId } })
}

export async function generateShoppingList(userId: string, context: string) {
  const systemPrompt = getShoppingListSystemPrompt(context)

  const { content } = await chat(
    [{ role: "user", content: "Generate a shopping list based on this meal plan." }],
    systemPrompt,
    2048
  )

  // Parse response
  let items: Array<{
    name: string
    quantity?: number
    unit?: string
    category?: string
    estimatedCost?: number
  }> = []

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      items = JSON.parse(jsonMatch[0])
    }
  } catch {
    items = []
  }

  return db.shoppingList.create({
    data: {
      userId,
      name: `AI Shopping List - ${new Date().toLocaleDateString()}`,
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
}

import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the database
vi.mock("@/lib/db", () => ({
  db: {
    aIConversation: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    aIMessage: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    workout: {
      findMany: vi.fn(),
    },
    mealItem: {
      findMany: vi.fn(),
    },
    shoppingList: {
      create: vi.fn(),
    },
  },
}))

// Mock the AI client
vi.mock("@/lib/ai/client", () => ({
  chat: vi.fn(),
  streamChat: vi.fn(),
}))

vi.mock("@/lib/ai/prompts", () => ({
  getShoppingListSystemPrompt: vi.fn().mockReturnValue("mock system prompt"),
}))

import { db } from "@/lib/db"
import { chat } from "@/lib/ai/client"
import {
  saveMessage,
  getOrCreateConversation,
  getUserAIContext,
  listConversations,
  deleteConversation,
} from "@/services/ai.service"

const mockDb = db as unknown as {
  aIConversation: {
    findFirst: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
  aIMessage: { create: ReturnType<typeof vi.fn> }
  user: { findUnique: ReturnType<typeof vi.fn> }
  workout: { findMany: ReturnType<typeof vi.fn> }
  mealItem: { findMany: ReturnType<typeof vi.fn> }
  shoppingList: { create: ReturnType<typeof vi.fn> }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("saveMessage", () => {
  it("creates a message in the database", async () => {
    const mockMessage = {
      id: "msg-1",
      conversationId: "conv-1",
      role: "USER",
      content: "Hello",
      tokens: null,
      createdAt: new Date(),
    }
    mockDb.aIMessage.create.mockResolvedValue(mockMessage)
    mockDb.aIConversation.findUnique.mockResolvedValue({ title: "New Conversation" })
    mockDb.aIConversation.update.mockResolvedValue({})

    const result = await saveMessage("conv-1", "USER", "Hello")

    expect(mockDb.aIMessage.create).toHaveBeenCalledWith({
      data: {
        conversationId: "conv-1",
        role: "USER",
        content: "Hello",
        tokens: undefined,
      },
    })
    expect(result).toEqual(mockMessage)
  })

  it("updates the conversation title from first user message", async () => {
    mockDb.aIMessage.create.mockResolvedValue({ id: "msg-1" })
    mockDb.aIConversation.findUnique.mockResolvedValue({ title: "New Conversation" })
    mockDb.aIConversation.update.mockResolvedValue({})

    await saveMessage("conv-1", "USER", "What should I eat today?")

    expect(mockDb.aIConversation.update).toHaveBeenCalledWith({
      where: { id: "conv-1" },
      data: { title: "What should I eat today?" },
    })
  })

  it("truncates long titles to 50 chars with ellipsis", async () => {
    mockDb.aIMessage.create.mockResolvedValue({ id: "msg-1" })
    mockDb.aIConversation.findUnique.mockResolvedValue({ title: "New Conversation" })
    mockDb.aIConversation.update.mockResolvedValue({})

    const longMessage = "This is a very long message that exceeds the fifty character limit significantly"
    await saveMessage("conv-1", "USER", longMessage)

    expect(mockDb.aIConversation.update).toHaveBeenCalledWith({
      where: { id: "conv-1" },
      data: { title: longMessage.substring(0, 47) + "..." },
    })
  })

  it("stores tokens when provided", async () => {
    mockDb.aIMessage.create.mockResolvedValue({ id: "msg-2" })
    mockDb.aIConversation.findUnique.mockResolvedValue({ title: "Some title" })
    mockDb.aIConversation.update.mockResolvedValue({})

    await saveMessage("conv-1", "ASSISTANT", "Here is my response", 250)

    expect(mockDb.aIMessage.create).toHaveBeenCalledWith({
      data: {
        conversationId: "conv-1",
        role: "ASSISTANT",
        content: "Here is my response",
        tokens: 250,
      },
    })
  })
})

describe("getOrCreateConversation", () => {
  it("returns existing conversation when conversationId is provided and found", async () => {
    const mockConv = {
      id: "conv-1",
      userId: "user-1",
      title: "My Conversation",
      messages: [],
    }
    mockDb.aIConversation.findFirst.mockResolvedValue(mockConv)

    const result = await getOrCreateConversation("user-1", "conv-1")

    expect(mockDb.aIConversation.findFirst).toHaveBeenCalledWith({
      where: { id: "conv-1", userId: "user-1" },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    })
    expect(result).toEqual(mockConv)
  })

  it("creates a new conversation when no conversationId provided", async () => {
    const mockConv = {
      id: "conv-new",
      userId: "user-1",
      title: "New Conversation",
      messages: [],
    }
    mockDb.aIConversation.create.mockResolvedValue(mockConv)

    const result = await getOrCreateConversation("user-1")

    expect(mockDb.aIConversation.create).toHaveBeenCalled()
    expect(result).toEqual(mockConv)
  })

  it("creates a new conversation when conversationId not found", async () => {
    mockDb.aIConversation.findFirst.mockResolvedValue(null)
    const mockConv = {
      id: "conv-new",
      userId: "user-1",
      title: "New Conversation",
      messages: [],
    }
    mockDb.aIConversation.create.mockResolvedValue(mockConv)

    const result = await getOrCreateConversation("user-1", "non-existent-id")

    expect(mockDb.aIConversation.create).toHaveBeenCalled()
    expect(result).toEqual(mockConv)
  })
})

describe("getUserAIContext", () => {
  it("returns fallback context when user not found", async () => {
    mockDb.user.findUnique.mockResolvedValue(null)

    const context = await getUserAIContext("non-existent-user")

    expect(context.name).toBe("User")
    expect(context.goals).toEqual([])
    expect(context.currentWeight).toBeUndefined()
  })

  it("builds context from user profile and goals", async () => {
    mockDb.user.findUnique.mockResolvedValue({
      id: "user-1",
      name: "John Doe",
      profile: {
        weight: 80,
        activityLevel: "MODERATELY_ACTIVE",
      },
      goals: [
        {
          type: "WEIGHT_LOSS",
          targetWeight: 75,
          status: "ACTIVE",
        },
      ],
    })
    mockDb.workout.findMany.mockResolvedValue([
      { name: "Chest Day", date: new Date() },
    ])
    mockDb.mealItem.findMany.mockResolvedValue([
      { calories: 2000, protein: 150 },
      { calories: 1800, protein: 140 },
    ])

    const context = await getUserAIContext("user-1")

    expect(context.name).toBe("John Doe")
    expect(context.currentWeight).toBe(80)
    expect(context.goals).toContain("weight loss (target: 75kg)")
    expect(context.activityLevel).toBe("moderately active")
    expect(context.recentWorkouts).toContain("Chest Day")
  })

  it("handles user with no profile gracefully", async () => {
    mockDb.user.findUnique.mockResolvedValue({
      id: "user-1",
      name: "Jane",
      profile: null,
      goals: [],
    })
    mockDb.workout.findMany.mockResolvedValue([])
    mockDb.mealItem.findMany.mockResolvedValue([])

    const context = await getUserAIContext("user-1")

    expect(context.name).toBe("Jane")
    expect(context.currentWeight).toBeUndefined()
    expect(context.goals).toEqual([])
    expect(context.recentWorkouts).toEqual([])
    expect(context.nutritionSummary).toBeUndefined()
  })

  it("builds nutrition summary from recent meals", async () => {
    mockDb.user.findUnique.mockResolvedValue({
      id: "user-1",
      name: "Bob",
      profile: { weight: 90, activityLevel: "VERY_ACTIVE" },
      goals: [],
    })
    mockDb.workout.findMany.mockResolvedValue([])
    // 7 meal items (simulating daily logging) with calories and protein
    mockDb.mealItem.findMany.mockResolvedValue(
      Array(7).fill({ calories: 2500, protein: 200 })
    )

    const context = await getUserAIContext("user-1")

    expect(context.nutritionSummary).toBeDefined()
    expect(context.nutritionSummary).toContain("kcal/day")
    expect(context.nutritionSummary).toContain("protein/day")
  })
})

describe("listConversations", () => {
  it("returns conversations ordered by updatedAt", async () => {
    const mockConvs = [
      { id: "c2", title: "Recent", updatedAt: new Date(), _count: { messages: 5 } },
      { id: "c1", title: "Older", updatedAt: new Date(Date.now() - 1000), _count: { messages: 3 } },
    ]
    mockDb.aIConversation.findMany.mockResolvedValue(mockConvs)

    const result = await listConversations("user-1")

    expect(mockDb.aIConversation.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { updatedAt: "desc" },
      select: expect.objectContaining({ id: true, title: true }),
    })
    expect(result).toEqual(mockConvs)
  })
})

describe("deleteConversation", () => {
  it("deletes conversation when user owns it", async () => {
    mockDb.aIConversation.findFirst.mockResolvedValue({ id: "conv-1", userId: "user-1" })
    mockDb.aIConversation.delete.mockResolvedValue({ id: "conv-1" })

    const result = await deleteConversation("conv-1", "user-1")

    expect(mockDb.aIConversation.delete).toHaveBeenCalledWith({ where: { id: "conv-1" } })
    expect(result).not.toBeNull()
  })

  it("returns null when conversation not found or not owned by user", async () => {
    mockDb.aIConversation.findFirst.mockResolvedValue(null)

    const result = await deleteConversation("conv-1", "wrong-user")

    expect(mockDb.aIConversation.delete).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })
})

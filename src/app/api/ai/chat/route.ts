import { auth } from "@/lib/auth"
import { streamChat } from "@/lib/ai/client"
import { getFitnessCoachSystemPrompt } from "@/lib/ai/prompts"
import {
  getUserAIContext,
  saveMessage,
  getOrCreateConversation,
} from "@/services/ai.service"
import { trackEvent } from "@/lib/analytics"
import { z } from "zod"

const schema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().cuid().optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "AI service is not configured. Please contact support." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return new Response("Bad request", { status: 400 })
  }

  const { message, conversationId } = result.data
  const userId = session.user.id

  try {
    // Get or create conversation
    const conversation = await getOrCreateConversation(userId, conversationId)

    // Track new conversation
    if (!conversationId) {
      trackEvent(userId, "AIConversationStarted")
    }

    // Save user message
    await saveMessage(conversation.id, "USER", message)

    // Build context and system prompt
    const userContext = await getUserAIContext(userId)
    const systemPrompt = getFitnessCoachSystemPrompt(userContext)

    // Get conversation history for context (last 10 messages)
    const history = conversation.messages.slice(-10).map((m) => ({
      role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }))
    history.push({ role: "user", content: message })

    // Stream response
    const encoder = new TextEncoder()
    let fullResponse = ""

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChat(history, systemPrompt, 2048)) {
            fullResponse += chunk
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
            )
          }
          // Save assistant message
          await saveMessage(conversation.id, "ASSISTANT", fullResponse)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, conversationId: conversation.id })}\n\n`
            )
          )
          controller.close()
        } catch (error) {
          console.error("Stream error:", error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "AI error occurred. Please try again." })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat route error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}

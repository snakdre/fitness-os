import { auth } from "@/lib/auth"
import { listConversations } from "@/services/ai.service"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const conversations = await listConversations(session.user.id)
    return Response.json({ data: conversations })
  } catch (error) {
    console.error("List conversations error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

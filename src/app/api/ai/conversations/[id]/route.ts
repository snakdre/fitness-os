import { auth } from "@/lib/auth"
import { getConversationHistory, deleteConversation } from "@/services/ai.service"

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
    const conversation = await getConversationHistory(id, session.user.id)
    if (!conversation) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }
    return Response.json({ data: conversation })
  } catch (error) {
    console.error("Get conversation error:", error)
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
    const result = await deleteConversation(id, session.user.id)
    if (!result) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }
    return Response.json({ data: { success: true } })
  } catch (error) {
    console.error("Delete conversation error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

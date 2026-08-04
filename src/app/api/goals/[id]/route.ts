import { auth } from "@/lib/auth"
import { getGoals, updateGoal, deleteGoal } from "@/services/profile.service"
import { updateGoalSchema } from "@/lib/validations/profile"
import { db } from "@/lib/db"

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
    const goal = await db.goal.findFirst({ where: { id, userId: session.user.id } })
    if (!goal) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }
    return Response.json({ data: goal })
  } catch (error) {
    console.error("Get goal error:", error)
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

  const result = updateGoalSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 })
  }

  try {
    const goal = await updateGoal(id, session.user.id, result.data)
    if (!goal) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }
    return Response.json({ data: goal })
  } catch (error) {
    console.error("Update goal error:", error)
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
    const result = await deleteGoal(id, session.user.id)
    if (!result) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }
    return Response.json({ data: { success: true } })
  } catch (error) {
    console.error("Delete goal error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

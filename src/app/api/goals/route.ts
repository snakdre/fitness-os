import { auth } from "@/lib/auth"
import { getGoals, createGoal } from "@/services/profile.service"
import { createGoalSchema } from "@/lib/validations/profile"
import { trackEvent } from "@/lib/analytics"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") ?? undefined

  try {
    const goals = await getGoals(session.user.id, status)
    return Response.json({ data: goals })
  } catch (error) {
    console.error("Get goals error:", error)
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

  const result = createGoalSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 })
  }

  try {
    const goal = await createGoal(session.user.id, result.data)
    trackEvent(session.user.id, "GoalCreated", { type: result.data.type })
    return Response.json({ data: goal }, { status: 201 })
  } catch (error) {
    console.error("Create goal error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { auth } from "@/lib/auth"
import { getProfile, updateProfile } from "@/services/profile.service"
import { updateProfileSchema } from "@/lib/validations/profile"
import { trackEvent } from "@/lib/analytics"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const profile = await getProfile(session.user.id)
    return Response.json({ data: profile })
  } catch (error) {
    console.error("Get profile error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
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

  const result = updateProfileSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 })
  }

  try {
    const profile = await updateProfile(session.user.id, result.data)
    trackEvent(session.user.id, "ProfileCompleted")
    return Response.json({ data: profile })
  } catch (error) {
    console.error("Update profile error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

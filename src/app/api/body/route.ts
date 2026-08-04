import { auth } from "@/lib/auth"
import { getBodyMeasurements, addBodyMeasurement } from "@/services/body.service"
import { bodyMeasurementSchema } from "@/lib/validations/body"
import { trackEvent } from "@/lib/analytics"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined

  try {
    const measurements = await getBodyMeasurements(session.user.id, limit)
    return Response.json({ data: measurements })
  } catch (error) {
    console.error("Get body measurements error:", error)
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

  const result = bodyMeasurementSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 })
  }

  try {
    const measurement = await addBodyMeasurement(session.user.id, result.data)
    trackEvent(session.user.id, "BodyMeasurementAdded", { weight: result.data.weight })
    return Response.json({ data: measurement }, { status: 201 })
  } catch (error) {
    console.error("Create body measurement error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { auth } from "@/lib/auth"
import {
  updateBodyMeasurement,
  deleteBodyMeasurement,
} from "@/services/body.service"
import { updateBodyMeasurementSchema } from "@/lib/validations/body"
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
    const measurement = await db.bodyMeasurement.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!measurement) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }
    return Response.json({ data: measurement })
  } catch (error) {
    console.error("Get body measurement error:", error)
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

  const result = updateBodyMeasurementSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 })
  }

  try {
    const measurement = await updateBodyMeasurement(id, session.user.id, result.data)
    if (!measurement) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }
    return Response.json({ data: measurement })
  } catch (error) {
    console.error("Update body measurement error:", error)
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
    const result = await deleteBodyMeasurement(id, session.user.id)
    if (!result) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }
    return Response.json({ data: { success: true } })
  } catch (error) {
    console.error("Delete body measurement error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

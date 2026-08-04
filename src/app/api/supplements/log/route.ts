import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { logSupplement } from "@/services/supplement.service"
import { logSupplementSchema } from "@/lib/validations/supplement"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const result = logSupplementSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const log = await logSupplement(session.user.id, result.data)

    return NextResponse.json({ data: log }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "Supplement not found") {
      return NextResponse.json({ error: "Supplement not found" }, { status: 404 })
    }
    console.error("[POST /api/supplements/log]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

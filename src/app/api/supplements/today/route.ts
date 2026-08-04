import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getTodaySupplementLogs } from "@/services/supplement.service"

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const logs = await getTodaySupplementLogs(session.user.id)

    return NextResponse.json({ data: logs })
  } catch (error) {
    console.error("[GET /api/supplements/today]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

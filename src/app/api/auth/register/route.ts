import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { checkRateLimit } from "@/lib/rate-limit"

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number"
    ),
})

export async function POST(request: NextRequest) {
  // Rate limiting: 5 registrations per IP per 15 minutes
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"

  if (!checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const { name, email, password } = parsed.data

  // Check if email is already taken
  const existing = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  })

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    )
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12)

  // Create user and credentials account in a transaction
  const user = await db.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email: email.toLowerCase(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    // Store the password hash in the Account model's access_token field
    // (provider = "credentials", this is the standard pattern for credentials auth
    //  when no separate Password model exists in the schema)
    await tx.account.create({
      data: {
        userId: newUser.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: newUser.id,
        access_token: passwordHash,
      },
    })

    return newUser
  })

  return NextResponse.json(
    {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      message: "Account created successfully",
    },
    { status: 201 }
  )
}

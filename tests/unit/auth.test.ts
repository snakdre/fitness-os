import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { loginSchema, registerSchema } from "@/lib/validations/auth"
import {
  checkRateLimit,
  getRateLimitRemaining,
  resetRateLimit,
  cleanupRateLimit,
} from "@/lib/rate-limit"

// ─── Zod Validation Tests ──────────────────────────────────────────────────────

describe("loginSchema", () => {
  describe("email field", () => {
    it("accepts a valid email", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "Password1",
      })
      expect(result.success).toBe(true)
    })

    it("rejects an empty email", () => {
      const result = loginSchema.safeParse({ email: "", password: "Password1" })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emails = result.error.flatten().fieldErrors.email
        expect(emails).toBeDefined()
        expect(emails!.length).toBeGreaterThan(0)
      }
    })

    it("rejects a non-email string", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "Password1",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emails = result.error.flatten().fieldErrors.email
        expect(emails).toBeDefined()
      }
    })
  })

  describe("password field", () => {
    it("accepts a valid password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "SecurePass1",
      })
      expect(result.success).toBe(true)
    })

    it("rejects a password shorter than 8 characters", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "Ab1",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const passwords = result.error.flatten().fieldErrors.password
        expect(passwords).toBeDefined()
      }
    })

    it("rejects an empty password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      })
      expect(result.success).toBe(false)
    })
  })

  it("returns properly typed output on success", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "ValidPass1",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe("test@example.com")
      expect(result.data.password).toBe("ValidPass1")
    }
  })
})

// ─── Register Schema Tests ─────────────────────────────────────────────────────

describe("registerSchema", () => {
  const validData = {
    name: "Alex Johnson",
    email: "alex@example.com",
    password: "SecurePass1",
    confirmPassword: "SecurePass1",
  }

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  describe("name field", () => {
    it("rejects a name shorter than 2 characters", () => {
      const result = registerSchema.safeParse({ ...validData, name: "A" })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toBeDefined()
      }
    })

    it("rejects an empty name", () => {
      const result = registerSchema.safeParse({ ...validData, name: "" })
      expect(result.success).toBe(false)
    })

    it("rejects a name longer than 50 characters", () => {
      const result = registerSchema.safeParse({
        ...validData,
        name: "A".repeat(51),
      })
      expect(result.success).toBe(false)
    })

    it("accepts a two-character name", () => {
      const result = registerSchema.safeParse({ ...validData, name: "Jo" })
      expect(result.success).toBe(true)
    })
  })

  describe("password field", () => {
    it("rejects a password without uppercase", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "lowercase1",
        confirmPassword: "lowercase1",
      })
      expect(result.success).toBe(false)
    })

    it("rejects a password without a digit", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "NoDigitsHere",
        confirmPassword: "NoDigitsHere",
      })
      expect(result.success).toBe(false)
    })

    it("rejects a password shorter than 8 characters", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "Abc1",
        confirmPassword: "Abc1",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("confirmPassword field", () => {
    it("rejects when passwords do not match", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "SecurePass1",
        confirmPassword: "DifferentPass1",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const confirmErrors = result.error.flatten().fieldErrors.confirmPassword
        expect(confirmErrors).toBeDefined()
        expect(confirmErrors!.some((e) => e.includes("match"))).toBe(true)
      }
    })

    it("accepts when passwords match exactly", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "MatchPass99",
        confirmPassword: "MatchPass99",
      })
      expect(result.success).toBe(true)
    })
  })
})

// ─── Rate Limit Tests ──────────────────────────────────────────────────────────

describe("checkRateLimit", () => {
  const key = "test-key"
  const uniqueKey = () => `test-${Math.random()}`

  afterEach(() => {
    resetRateLimit(key)
  })

  it("allows the first request", () => {
    const k = uniqueKey()
    expect(checkRateLimit(k, 5, 60000)).toBe(true)
  })

  it("allows requests up to the limit", () => {
    const k = uniqueKey()
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(k, 5, 60000)).toBe(true)
    }
  })

  it("blocks requests over the limit", () => {
    const k = uniqueKey()
    for (let i = 0; i < 5; i++) {
      checkRateLimit(k, 5, 60000)
    }
    expect(checkRateLimit(k, 5, 60000)).toBe(false)
  })

  it("resets after the window expires", async () => {
    const k = uniqueKey()
    // Use a very short window (1ms) to simulate expiry
    for (let i = 0; i < 3; i++) {
      checkRateLimit(k, 3, 1)
    }
    // Exhaust limit
    expect(checkRateLimit(k, 3, 1)).toBe(false)
    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 5))
    // Should be allowed again
    expect(checkRateLimit(k, 3, 60000)).toBe(true)
  })

  it("different keys have independent limits", () => {
    const k1 = uniqueKey()
    const k2 = uniqueKey()
    for (let i = 0; i < 3; i++) {
      checkRateLimit(k1, 3, 60000)
    }
    // k1 is exhausted
    expect(checkRateLimit(k1, 3, 60000)).toBe(false)
    // k2 should still be allowed
    expect(checkRateLimit(k2, 3, 60000)).toBe(true)
  })
})

describe("getRateLimitRemaining", () => {
  it("returns the full limit for a fresh key", () => {
    const k = `remaining-${Math.random()}`
    expect(getRateLimitRemaining(k, 10)).toBe(10)
  })

  it("returns the correct remaining count after some requests", () => {
    const k = `remaining-${Math.random()}`
    checkRateLimit(k, 10, 60000)
    checkRateLimit(k, 10, 60000)
    checkRateLimit(k, 10, 60000)
    expect(getRateLimitRemaining(k, 10)).toBe(7)
  })

  it("returns 0 when limit is exhausted", () => {
    const k = `remaining-${Math.random()}`
    for (let i = 0; i < 5; i++) {
      checkRateLimit(k, 5, 60000)
    }
    expect(getRateLimitRemaining(k, 5)).toBe(0)
  })
})

describe("resetRateLimit", () => {
  it("allows requests again after reset", () => {
    const k = `reset-${Math.random()}`
    for (let i = 0; i < 3; i++) {
      checkRateLimit(k, 3, 60000)
    }
    expect(checkRateLimit(k, 3, 60000)).toBe(false)
    resetRateLimit(k)
    expect(checkRateLimit(k, 3, 60000)).toBe(true)
  })
})

describe("cleanupRateLimit", () => {
  it("does not throw when called", () => {
    expect(() => cleanupRateLimit()).not.toThrow()
  })

  it("cleans up expired entries and allows new requests", async () => {
    const k = `cleanup-${Math.random()}`
    // Fill up with 1ms window
    for (let i = 0; i < 3; i++) {
      checkRateLimit(k, 3, 1)
    }
    await new Promise((r) => setTimeout(r, 5))
    cleanupRateLimit()
    // After cleanup and fresh window, should be allowed
    expect(checkRateLimit(k, 3, 60000)).toBe(true)
  })
})

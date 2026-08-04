const rateLimit = new Map<string, { count: number; resetTime: number }>()

/**
 * Check if a request is within the rate limit.
 * Returns true if the request is allowed, false if rate limit exceeded.
 *
 * @param key - Unique identifier (e.g. IP address, user ID)
 * @param limit - Max requests per window (default: 10)
 * @param windowMs - Window duration in milliseconds (default: 60000 = 1 min)
 */
export function checkRateLimit(
  key: string,
  limit = 10,
  windowMs = 60000
): boolean {
  const now = Date.now()
  const entry = rateLimit.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}

/**
 * Get remaining requests for a key.
 */
export function getRateLimitRemaining(
  key: string,
  limit = 10
): number {
  const entry = rateLimit.get(key)
  if (!entry || Date.now() > entry.resetTime) return limit
  return Math.max(0, limit - entry.count)
}

/**
 * Reset rate limit for a key.
 */
export function resetRateLimit(key: string): void {
  rateLimit.delete(key)
}

/**
 * Clean up expired entries (call periodically to prevent memory leaks).
 */
export function cleanupRateLimit(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimit.entries()) {
    if (now > entry.resetTime) {
      rateLimit.delete(key)
    }
  }
}

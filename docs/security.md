# Fitness OS — Security Architecture

## Overview

Security is built into every layer of Fitness OS. This document covers authentication, authorization, data protection, and operational security practices.

---

## Authentication

### Auth.js v5 (next-auth@beta)

Authentication is handled entirely by Auth.js, which provides:

- **Providers:** Google OAuth 2.0, Email Magic Links
- **Session strategy:** JWT stored in HTTP-only, Secure, SameSite=Lax cookies
- **CSRF protection:** Built-in via Auth.js
- **Token rotation:** Refresh tokens handled automatically

### Session Security

```
Cookie name: authjs.session-token
HttpOnly: true
Secure: true (production)
SameSite: Lax
Path: /
MaxAge: 30 days
```

The JWT is signed with `AUTH_SECRET` (minimum 32 bytes, generated via `openssl rand -base64 32`).

**Session contains:**
```typescript
{
  id: string        // User ID
  email: string
  name: string
  image: string
  role: UserRole    // USER | COACH | ADMIN
}
```

---

## Authorization

### Middleware Protection

All dashboard routes are protected at the middleware level:

```typescript
// src/middleware.ts
export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: [
    '/((?!api/auth|api/webhooks|_next/static|_next/image|favicon.ico|.*\\.png$).*)'
  ]
}
```

Unauthenticated requests to protected routes are redirected to `/login`.

### API Route Authorization

Every API route checks authentication before processing:

```typescript
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Resource Ownership

All database queries scope to the authenticated user's ID:

```typescript
// Always filter by userId — never trust client-provided IDs alone
const workout = await db.workout.findFirst({
  where: {
    id: params.id,
    userId: session.user.id,  // ownership check
  }
})

if (!workout) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
```

### Role-Based Access Control

```typescript
function requireRole(session: Session, role: UserRole) {
  if (session.user.role !== role && session.user.role !== 'ADMIN') {
    throw new Error('Forbidden')
  }
}
```

| Route Pattern | Required Role |
|--------------|--------------|
| `/api/coach/*` | COACH or ADMIN |
| `/api/admin/*` | ADMIN |
| All other `/api/*` | Any authenticated user |

---

## Input Validation

All API inputs are validated with Zod before any processing:

```typescript
const schema = z.object({
  name: z.string().min(1).max(100),
  date: z.string().datetime(),
})

const result = schema.safeParse(await req.json())
if (!result.success) {
  return NextResponse.json(
    { error: result.error.flatten() },
    { status: 400 }
  )
}
```

**Rules:**
- No raw database queries with user input (Prisma handles parameterization)
- String length limits on all text fields
- Enum validation for categorical fields
- Numeric range validation for measurements
- Date validation for all temporal fields

---

## SQL Injection Prevention

Prisma ORM uses parameterized queries exclusively. Raw queries are prohibited:

```typescript
// Always use Prisma's typed methods
await db.user.findUnique({ where: { email: userInput } })

// If raw SQL is needed, use Prisma.sql template literal (auto-parameterized)
await db.$queryRaw(Prisma.sql`SELECT * FROM "User" WHERE id = ${userId}`)
```

---

## XSS Prevention

- **React** auto-escapes all content rendered in JSX
- Avoid setting inner HTML from user content — use React's text rendering instead
- All AI-generated content is rendered as plain text or sanitized markdown
- Content Security Policy headers set via Next.js config

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]
```

---

## Secrets Management

**Rules:**
1. No secrets in source code — ever
2. No secrets in client bundles (only `NEXT_PUBLIC_` vars go to browser)
3. `.env.local` is gitignored
4. Production secrets in environment variables (Vercel/Railway/etc.)
5. Rotate keys immediately if exposed

**Environment variable categories:**
```
# Server-only (never exposed to browser)
DATABASE_URL
AUTH_SECRET
AUTH_GOOGLE_SECRET
ANTHROPIC_API_KEY
STRIPE_SECRET_KEY
SENTRY_AUTH_TOKEN

# Safe to expose (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST
NEXT_PUBLIC_SENTRY_DSN
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Default API | 60 requests | 1 minute |
| AI endpoints | 10 requests | 1 minute |
| Auth endpoints | 10 requests | 1 minute |
| Stripe webhooks | Unlimited | — |

Rate limiting is implemented via Redis (Upstash) or in-memory for development.

---

## Data Privacy

### User Data Isolation

Every query includes a `userId` filter:

```typescript
// All data reads are scoped to the user
const meals = await db.meal.findMany({
  where: { userId: session.user.id }
})
```

### Sensitive Data Handling

- **Passwords:** Not stored (OAuth-only; magic links use time-limited tokens)
- **Payment info:** Never stored — Stripe handles all card data
- **Health data:** Encrypted at rest via database encryption
- **PII in logs:** User IDs logged, not emails or names

### Data Deletion

Account deletion cascades via Prisma's `onDelete: Cascade`:
- All user data is deleted when account is deleted
- Audit logs retain anonymous records (userId set to null)

---

## Audit Logging

All sensitive operations are logged to `AuditLog`:

```typescript
await db.auditLog.create({
  data: {
    userId: session.user.id,
    action: 'DELETE',
    resource: 'Workout',
    resourceId: workoutId,
    ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
    userAgent: req.headers.get('user-agent'),
    metadata: { workoutName: workout.name },
  }
})
```

**Logged events:**
- User login/logout
- Account creation/deletion
- Data exports
- Admin actions
- Subscription changes
- Failed auth attempts

---

## Error Handling Security

Never expose internal details in error responses:

```typescript
// Production
return NextResponse.json(
  { error: 'Internal server error' },
  { status: 500 }
)

// Development only
if (process.env.NODE_ENV === 'development') {
  console.error(error)
}
```

All errors are reported to Sentry with user context (ID only, not PII).

---

## CORS

Next.js App Router handles CORS via headers. For API routes:

```typescript
// Only allow requests from the app's own origin in production
const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL

export function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}
```

---

## Dependency Security

- `npm audit` run on every CI build
- Dependabot alerts enabled on GitHub
- Lock file (`package-lock.json`) committed
- No `--force` installs without security review

---

## Infrastructure Security

### Database

- Database not publicly accessible (VPC-only in production)
- SSL-required connections (`sslmode=require` in DATABASE_URL)
- Connection pooling via PgBouncer
- Regular automated backups

### Deployment

- Environment variables injected at runtime (not baked into image)
- Immutable deployments (no SSH in prod)
- Health check endpoints monitored
- Automatic rollback on deployment failures

---

## Security Checklist for New Features

Before shipping any feature:

- [ ] All inputs validated with Zod
- [ ] All database queries scoped by userId
- [ ] No secrets in code or logs
- [ ] Rate limiting applied if needed
- [ ] Audit log entries for sensitive operations
- [ ] Error messages do not expose internals
- [ ] Tests include unauthorized access cases

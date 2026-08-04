# Fitness OS — System Architecture

## Overview

Fitness OS is a server-first, full-stack Next.js application using the App Router paradigm. The architecture prioritizes:

1. **Security** — Server-side data fetching, no secrets in the browser
2. **Performance** — React Server Components where possible, streaming where helpful
3. **Scalability** — Stateless API, horizontal scaling ready
4. **Maintainability** — Clear separation of concerns, typed end-to-end

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client (Browser)                            │
│  React Client Components │ PostHog Analytics │ Sentry Error Tracking │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS
┌───────────────────────────────▼─────────────────────────────────────┐
│                       Next.js App Server                             │
│                                                                      │
│  ┌─────────────────────┐    ┌──────────────────────────────────┐    │
│  │  React Server        │    │         API Route Handlers        │    │
│  │  Components          │    │  /api/workouts  /api/nutrition    │    │
│  │  (data fetching)     │    │  /api/body      /api/ai           │    │
│  └────────┬────────────┘    └──────────────┬───────────────────┘    │
│           │                                │                         │
│  ┌────────▼────────────────────────────────▼───────────────────┐    │
│  │                     Service Layer                             │    │
│  │  WorkoutService │ NutritionService │ AIService │ BodyService  │    │
│  └────────────────────────────┬────────────────────────────────┘    │
│                                │                                     │
│  ┌─────────────────────────────▼──────────────────────────────┐     │
│  │                     Data Access Layer (Prisma)               │     │
│  └─────────────────────────────┬──────────────────────────────┘     │
└────────────────────────────────┼────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                      External Services                               │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  PostgreSQL  │  │  Anthropic   │  │   PostHog    │              │
│  │  Database    │  │  Claude API  │  │  Analytics   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐                                 │
│  │   Sentry     │  │   Stripe     │                                 │
│  │  (errors)    │  │  (payments)  │                                 │
│  └──────────────┘  └──────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Application Layers

### 1. Presentation Layer — `src/app/`

Next.js App Router with two route groups:

**`(auth)/`** — Unauthenticated routes
- `/login` — Google OAuth + magic link sign-in
- `/register` — New user onboarding
- `/auth/error` — Auth error page

**`(dashboard)/`** — Authenticated routes (middleware-protected)
- `/` — Dashboard overview
- `/workouts` — Workout log and planner
- `/nutrition` — Food diary and macro tracker
- `/body` — Body composition tracking
- `/supplements` — Supplement manager
- `/ai-coach` — AI conversation interface
- `/shopping` — AI-generated shopping lists
- `/settings` — User settings and profile
- `/coach` — Coach portal (COACH role only)

**`api/`** — REST API endpoints
- All API routes validate input with Zod
- All API routes require auth unless marked public
- Standard response envelope: `{ data, error, meta }`

### 2. Component Layer — `src/components/`

```
components/
├── ui/               # shadcn/ui primitives (Button, Input, etc.)
├── shared/           # Shared layout components (Navbar, Sidebar)
├── workouts/         # Workout-specific components
├── nutrition/        # Nutrition-specific components
├── body/             # Body tracking components
├── supplements/      # Supplement components
└── ai/               # AI chat interface components
```

Components are split into:
- **Server Components** (default) — fetch data directly from DB
- **Client Components** (marked `'use client'`) — interactive UI

### 3. Service Layer — `src/services/`

Business logic lives here, completely server-side. Services are called by:
- Server Components (directly)
- API Route Handlers
- Server Actions

```typescript
// Pattern: service function
export async function getUserWorkouts(userId: string, options: WorkoutQueryOptions) {
  return db.workout.findMany({
    where: { userId, ...buildWhereClause(options) },
    include: { exercises: { include: { sets: true } } },
    orderBy: { date: 'desc' },
  })
}
```

### 4. Data Access Layer — Prisma

Single `db` instance exported from `src/lib/db.ts`. The Prisma client is a singleton in development (prevents connection exhaustion from hot reload).

---

## Authentication Architecture

Auth.js v5 (next-auth@beta) handles all authentication:

```
User → Browser → /api/auth/* → Auth.js → Google OAuth
                                      → Database (Session/Account)
```

**Session strategy:** JWT stored in HTTP-only secure cookies
**Session data:** `{ id, email, name, image, role }`
**Protected routes:** Next.js middleware checks session on all `(dashboard)` routes

```typescript
// src/middleware.ts
export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: ['/((?!api/auth|_next|.*\\..*).*)']
}
```

### Role-Based Access Control

| Role | Permissions |
|------|------------|
| `USER` | Full access to own data |
| `COACH` | Access own data + assigned clients' data |
| `ADMIN` | Full system access |

---

## AI Integration Architecture

The AI layer is abstracted behind `src/lib/ai/client.ts`:

```typescript
// Conversation flow
User Message
    → Store in AIMessage (role: USER)
    → Fetch conversation history
    → Build context (user profile, recent workouts, goals)
    → Call Anthropic claude-sonnet-4-6 with streaming
    → Stream response to client
    → Store complete response in AIMessage (role: ASSISTANT)
    → Update token count
```

**Context injection:** Each AI request includes:
- User profile (age, gender, activity level, goals)
- Recent workouts (last 7 days)
- Recent nutrition data (last 3 days)
- Active goals
- Supplement regimen

**Conversation persistence:** Full history stored in `AIConversation` + `AIMessage` models.

---

## Data Flow Patterns

### Server Component Data Fetching

```typescript
// app/(dashboard)/workouts/page.tsx
import { getUserWorkouts } from '@/services/workout.service'
import { auth } from '@/lib/auth'

export default async function WorkoutsPage() {
  const session = await auth()
  const workouts = await getUserWorkouts(session!.user.id)
  return <WorkoutList workouts={workouts} />
}
```

### API Route Handler Pattern

```typescript
// app/api/workouts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createWorkoutSchema } from '@/lib/validations/workout'
import { createWorkout } from '@/services/workout.service'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const validated = createWorkoutSchema.safeParse(body)
  if (!validated.success) {
    return NextResponse.json({ error: validated.error.flatten() }, { status: 400 })
  }

  const workout = await createWorkout(session.user.id, validated.data)
  return NextResponse.json({ data: workout }, { status: 201 })
}
```

### Server Action Pattern

```typescript
// app/(dashboard)/workouts/actions.ts
'use server'
import { auth } from '@/lib/auth'
import { createWorkout } from '@/services/workout.service'
import { revalidatePath } from 'next/cache'

export async function createWorkoutAction(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  
  await createWorkout(session.user.id, { name: formData.get('name') as string })
  revalidatePath('/workouts')
}
```

---

## Caching Strategy

| Resource | Cache Strategy | Revalidation |
|----------|---------------|-------------|
| User profile | Per-request | On update |
| Workout list | Static (ISR) | On new workout |
| Exercise library | Static | Daily |
| Food database | Static | Daily |
| AI conversations | No cache | Real-time |
| Analytics | No cache | Real-time |

---

## Error Handling

All errors flow through a central error handler:

1. **Validation errors** (400) — Zod parse errors, returned as structured field errors
2. **Auth errors** (401) — Missing/invalid session
3. **Authorization errors** (403) — Insufficient permissions
4. **Not found** (404) — Resource doesn't exist or doesn't belong to user
5. **Server errors** (500) — Unexpected errors, logged to Sentry

All production errors are reported to Sentry with:
- User ID (if authenticated)
- Request path
- Error stack trace
- Environment context

---

## Performance Considerations

- **React Server Components** for all read-heavy pages (no client JS)
- **Streaming** for AI responses (long-running LLM calls)
- **Database indexes** on all FK and frequently-queried columns
- **Connection pooling** via PgBouncer in production
- **Image optimization** via Next.js Image component
- **Code splitting** automatic with App Router

# Fitness OS — API Design Documentation

## Overview

Fitness OS exposes a REST API via Next.js App Router Route Handlers. All endpoints follow consistent conventions for authentication, validation, and response format.

**Base URL:** `/api`  
**Format:** JSON  
**Auth:** Bearer token (Auth.js JWT session cookie)

---

## Response Envelope

All API responses use a consistent envelope:

```typescript
// Success
{
  "data": <payload>,
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150
  }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "field": ["Error message"]
    }
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No content (DELETE) |
| 400 | Bad request / validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable entity |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Authentication

All endpoints require a valid Auth.js session unless marked **[public]**.

```
Authorization: (handled automatically via session cookies)
```

Session validation:
```typescript
const session = await auth()
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

## Endpoints

### Auth

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/auth/session` | Get current session | Public |
| POST | `/api/auth/signin` | Sign in | Public |
| POST | `/api/auth/signout` | Sign out | Required |

---

### Users & Profiles

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PATCH | `/api/users/me` | Update profile |
| GET | `/api/users/me/stats` | Get user fitness stats |
| DELETE | `/api/users/me` | Delete account |

**PATCH /api/users/me**
```typescript
// Request body
{
  name?: string
  bio?: string
  age?: number
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  height?: number      // cm
  weight?: number      // kg
  activityLevel?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE'
  timezone?: string    // IANA timezone
  fitnessLevel?: string
}
```

---

### Goals

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/goals` | List user goals |
| POST | `/api/goals` | Create goal |
| GET | `/api/goals/:id` | Get goal |
| PATCH | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |

**POST /api/goals**
```typescript
{
  type: 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE' | 'ENDURANCE' | 'STRENGTH'
  targetWeight?: number
  targetDate?: string   // ISO 8601
  description?: string
  startWeight?: number
}
```

---

### Workouts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workouts` | List workouts (paginated, filterable) |
| POST | `/api/workouts` | Create workout |
| GET | `/api/workouts/:id` | Get workout with exercises and sets |
| PATCH | `/api/workouts/:id` | Update workout |
| DELETE | `/api/workouts/:id` | Delete workout |
| POST | `/api/workouts/:id/complete` | Mark workout complete |
| GET | `/api/workouts/templates` | List workout templates |

**GET /api/workouts** — Query params:
- `page` (default: 1)
- `pageSize` (default: 20, max: 100)
- `status` — PLANNED, COMPLETED, SKIPPED
- `from` — ISO date start range
- `to` — ISO date end range

**POST /api/workouts**
```typescript
{
  name: string
  date: string           // ISO 8601
  notes?: string
  status?: 'PLANNED' | 'COMPLETED'
  exercises?: Array<{
    exerciseId: string
    order: number
    restTime?: number    // seconds
    notes?: string
    sets?: Array<{
      setNumber: number
      reps?: number
      weight?: number    // kg
      duration?: number  // seconds
    }>
  }>
}
```

---

### Exercises

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/exercises` | Search exercises [public for auth users] |
| POST | `/api/exercises` | Create custom exercise |
| GET | `/api/exercises/:id` | Get exercise |
| PATCH | `/api/exercises/:id` | Update custom exercise |
| DELETE | `/api/exercises/:id` | Delete custom exercise |

**GET /api/exercises** — Query params:
- `q` — Search term
- `category` — ExerciseCategory enum
- `muscleGroup` — e.g. "chest"
- `equipment` — e.g. "barbell"

---

### Nutrition

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/nutrition/meals` | List meals (date range) |
| POST | `/api/nutrition/meals` | Create meal |
| GET | `/api/nutrition/meals/:id` | Get meal with items |
| PATCH | `/api/nutrition/meals/:id` | Update meal |
| DELETE | `/api/nutrition/meals/:id` | Delete meal |
| POST | `/api/nutrition/meals/:id/items` | Add item to meal |
| DELETE | `/api/nutrition/meals/:id/items/:itemId` | Remove item from meal |
| GET | `/api/nutrition/summary` | Daily nutrition summary |
| GET | `/api/nutrition/goal` | Get nutrition goals |
| PUT | `/api/nutrition/goal` | Set nutrition goals |

**GET /api/nutrition/summary** — Query params:
- `date` — ISO date (default: today)

**Response:**
```typescript
{
  data: {
    date: string
    totals: {
      calories: number
      protein: number
      carbs: number
      fat: number
      fiber: number
    }
    goals: {
      calories: number
      protein: number
      carbs: number
      fat: number
    }
    meals: Meal[]
  }
}
```

---

### Food Items

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/food` | Search food database |
| POST | `/api/food` | Create custom food item |
| GET | `/api/food/:id` | Get food item |
| PATCH | `/api/food/:id` | Update custom food item |
| DELETE | `/api/food/:id` | Delete custom food item |
| GET | `/api/food/barcode/:barcode` | Look up by barcode |

**GET /api/food** — Query params:
- `q` — Search query (min 2 chars)
- `page`, `pageSize`

---

### Body Measurements

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/body` | List measurements (date range) |
| POST | `/api/body` | Log measurement |
| GET | `/api/body/:id` | Get measurement |
| PATCH | `/api/body/:id` | Update measurement |
| DELETE | `/api/body/:id` | Delete measurement |
| GET | `/api/body/latest` | Get most recent measurement |
| GET | `/api/body/trends` | Get trend data for charts |

**POST /api/body**
```typescript
{
  date?: string        // ISO 8601 (default: now)
  weight?: number      // kg
  bodyFat?: number     // percentage
  chest?: number       // cm
  waist?: number       // cm
  hips?: number        // cm
  biceps?: number      // cm
  thighs?: number      // cm
  calves?: number      // cm
  shoulders?: number   // cm
  neck?: number        // cm
  notes?: string
}
```

---

### Supplements

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/supplements` | List supplements |
| POST | `/api/supplements` | Add supplement |
| GET | `/api/supplements/:id` | Get supplement |
| PATCH | `/api/supplements/:id` | Update supplement |
| DELETE | `/api/supplements/:id` | Delete supplement |
| POST | `/api/supplements/:id/log` | Log supplement taken |
| GET | `/api/supplements/today` | Get today's supplement schedule |

---

### Shopping Lists

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/shopping` | List shopping lists |
| POST | `/api/shopping` | Create shopping list |
| GET | `/api/shopping/:id` | Get list with items |
| DELETE | `/api/shopping/:id` | Delete list |
| PATCH | `/api/shopping/:id/items/:itemId` | Update item (toggle purchased) |
| POST | `/api/shopping/generate` | AI-generate list from meal plan |

---

### AI Coach

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ai/conversations` | List conversations |
| POST | `/api/ai/conversations` | Create conversation |
| GET | `/api/ai/conversations/:id` | Get conversation with messages |
| DELETE | `/api/ai/conversations/:id` | Delete conversation |
| POST | `/api/ai/conversations/:id/messages` | Send message (streaming) |

**POST /api/ai/conversations/:id/messages**
```typescript
// Request
{
  content: string
}

// Response: Server-Sent Events (streaming)
// Content-Type: text/event-stream
data: {"type": "delta", "content": "Here is"}
data: {"type": "delta", "content": " your workout plan..."}
data: {"type": "done", "tokens": 342}
```

---

### Analytics

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analytics/events` | Track event |
| GET | `/api/analytics/summary` | Get user analytics summary |

---

### Subscriptions (Admin/Stripe)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/subscriptions/me` | Get current subscription |
| POST | `/api/subscriptions/checkout` | Create Stripe checkout session |
| POST | `/api/subscriptions/portal` | Create Stripe portal session |
| POST | `/api/webhooks/stripe` | Stripe webhook handler [public] |

---

### Coach Portal (COACH role only)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/coach/clients` | List assigned clients |
| POST | `/api/coach/clients/invite` | Invite client |
| GET | `/api/coach/clients/:clientId/workouts` | View client workouts |
| GET | `/api/coach/clients/:clientId/nutrition` | View client nutrition |
| GET | `/api/coach/clients/:clientId/body` | View client body data |

---

## Pagination

List endpoints support cursor-based or offset pagination:

```typescript
// Request
GET /api/workouts?page=2&pageSize=20

// Response meta
{
  "meta": {
    "page": 2,
    "pageSize": 20,
    "total": 87,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

## Rate Limiting

| Tier | Limit |
|------|-------|
| Default | 60 req/min |
| AI endpoints | 10 req/min |
| Auth endpoints | 10 req/min |
| Stripe webhooks | No limit |

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1700000000
```

---

## Validation

All request bodies are validated with Zod before processing:

```typescript
const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.string().datetime(),
  notes: z.string().max(1000).optional(),
  status: z.enum(['PLANNED', 'COMPLETED']).default('PLANNED'),
})
```

Validation errors return 400 with Zod error details:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "name": ["String must contain at least 1 character(s)"],
      "date": ["Invalid datetime"]
    }
  }
}
```

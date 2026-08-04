# Fitness OS — Testing Strategy

## Overview

Fitness OS uses a layered testing approach covering unit, integration, and end-to-end tests.

**Test Stack:**
- **Unit/Integration:** Vitest + React Testing Library
- **E2E:** Playwright
- **Coverage:** V8 (built into Vitest)
- **CI:** GitHub Actions runs all tests on every PR

---

## Test Pyramid

```
       /\
      /  \
     / E2E \       Playwright — 20 critical user flows
    /────────\
   / Integration\  Vitest — API routes, services
  /──────────────\
 /   Unit Tests   \ Vitest — utilities, components, validation
/──────────────────\
```

---

## Test Types

### Unit Tests

Test individual functions and components in isolation.

**Location:** Co-located with source files (`*.test.ts`, `*.test.tsx`) or in `tests/unit/`

**What to unit test:**
- Utility functions (`src/lib/utils.ts`, `src/lib/validations/`)
- Pure business logic in services
- React components (rendering, interactions)
- Zod schemas (valid and invalid inputs)

```typescript
// Example: src/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'excluded', 'included')).toBe('base included')
  })

  it('merges tailwind conflicts correctly', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6')
  })
})
```

### Integration Tests

Test API routes and service layer with a test database.

**Location:** `tests/integration/`

**What to test:**
- API route handlers (happy path + error cases)
- Service functions with real database
- Authentication flows
- Authorization (403 cases)

```typescript
// Example: tests/integration/workouts.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { POST } from '@/app/api/workouts/route'
import { createTestUser, cleanTestDb } from '../helpers'

describe('POST /api/workouts', () => {
  let userId: string

  beforeEach(async () => {
    userId = await createTestUser()
  })

  afterEach(async () => {
    await cleanTestDb()
  })

  it('creates a workout for authenticated user', async () => {
    const req = new Request('http://localhost/api/workouts', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Workout', date: new Date().toISOString() }),
      headers: { 'Content-Type': 'application/json' }
    })

    const res = await POST(req)
    expect(res.status).toBe(201)

    const body = await res.json()
    expect(body.data.name).toBe('Test Workout')
  })

  it('returns 401 for unauthenticated requests', async () => {
    // Mock auth to return null session
    const req = new Request('http://localhost/api/workouts', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', date: new Date().toISOString() }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid input', async () => {
    const req = new Request('http://localhost/api/workouts', {
      method: 'POST',
      body: JSON.stringify({ name: '' }), // missing date, empty name
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
```

### E2E Tests

Test complete user flows in a real browser.

**Location:** `tests/e2e/`

**Critical flows to test:**
1. User registration and onboarding
2. Login with Google OAuth (mocked)
3. Log a workout end-to-end
4. Log a meal and view daily nutrition summary
5. Record body measurement
6. Add and log a supplement
7. Start an AI conversation
8. View dashboard stats
9. Update profile settings
10. Cancel subscription flow

```typescript
// Example: tests/e2e/workout-logging.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Workout Logging', () => {
  test.beforeEach(async ({ page }) => {
    // Log in via test helper
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.click('[data-testid="magic-link-button"]')
    // Handle magic link in test environment
  })

  test('user can log a completed workout', async ({ page }) => {
    await page.goto('/workouts/new')
    await page.fill('[name="name"]', 'Chest Day')
    await page.fill('[name="date"]', '2026-08-03')
    await page.click('[data-testid="add-exercise"]')
    await page.fill('[data-testid="exercise-search"]', 'Bench Press')
    await page.click('[data-testid="exercise-result-0"]')
    await page.fill('[data-testid="set-1-reps"]', '10')
    await page.fill('[data-testid="set-1-weight"]', '80')
    await page.click('[data-testid="complete-workout"]')

    await expect(page).toHaveURL(/\/workouts\/[a-z0-9]+/)
    await expect(page.locator('[data-testid="workout-status"]')).toHaveText('Completed')
  })
})
```

---

## Configuration

### Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', '.next', 'tests'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    }
  }
})
```

### Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Test Setup

```typescript
// tests/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Auth.js
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'test-user-id', email: 'test@example.com', role: 'USER' }
  })
}))
```

---

## Test Database

Integration tests use a separate test PostgreSQL database:

```bash
# .env.test
DATABASE_URL="postgresql://user:password@localhost:5432/fitness_os_test"
```

Test helpers:
```typescript
// tests/helpers/db.ts
import { db } from '@/lib/db'

export async function cleanTestDb() {
  // Clean in reverse FK order
  await db.auditLog.deleteMany()
  await db.aiMessage.deleteMany()
  await db.aiConversation.deleteMany()
  await db.meal.deleteMany()
  await db.workout.deleteMany()
  await db.user.deleteMany()
}

export async function createTestUser(overrides = {}) {
  const user = await db.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
      ...overrides,
    }
  })
  return user.id
}
```

---

## Coverage Targets

| Category | Target |
|----------|--------|
| Overall lines | 70% |
| Service functions | 80% |
| API route handlers | 75% |
| UI components | 60% |
| Utility functions | 90% |
| Zod schemas | 100% |

---

## CI Integration

GitHub Actions runs tests on every push and PR:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage

  e2e:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: fitness_os_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/fitness_os_test
```

---

## NPM Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## Test Naming Conventions

```typescript
describe('[Unit/Feature name]', () => {
  it('[action] when [condition]', async () => { ... })
  it('[action] returns [result]', async () => { ... })
  it('throws [error] when [invalid condition]', async () => { ... })
})
```

Examples:
- `it('creates workout when valid data provided')`
- `it('returns 401 when user is not authenticated')`
- `it('calculates correct calorie total from meal items')`

# Fitness OS

A production-grade, AI-powered Fitness Operating System built with Next.js 15, TypeScript, and the Anthropic Claude API. Fitness OS combines workout tracking, nutrition management, body composition monitoring, supplement tracking, and AI coaching into a single cohesive platform.

## Overview

Fitness OS is designed for:
- **Individual users** tracking their fitness journey with AI guidance
- **Coaches** managing multiple clients with real-time insight
- **Teams & Enterprises** running corporate wellness programs

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL 16 |
| ORM | Prisma v5 |
| Auth | Auth.js v5 (next-auth@beta) |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Analytics | PostHog |
| Error Tracking | Sentry |
| Validation | Zod v4 |
| Forms | React Hook Form + @hookform/resolvers |
| Charts | Recharts |
| Testing | Vitest + React Testing Library + Playwright |
| CI/CD | GitHub Actions |

---

## Prerequisites

- Node.js >= 20
- PostgreSQL 16 (local or cloud)
- npm >= 10

---

## Quick Start

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd fitness-os
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in all required values in `.env.local`:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — Generate with `openssl rand -base64 32`
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — From Google Cloud Console
- `ANTHROPIC_API_KEY` — From console.anthropic.com
- `NEXT_PUBLIC_POSTHOG_KEY` — From PostHog dashboard

### 3. Set up the database

```bash
# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npx prisma db seed
```

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
fitness-os/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth routes (login, register)
│   │   ├── (dashboard)/        # Protected app routes
│   │   │   ├── workouts/
│   │   │   ├── nutrition/
│   │   │   ├── body/
│   │   │   ├── supplements/
│   │   │   ├── ai-coach/
│   │   │   └── settings/
│   │   ├── api/                # API route handlers
│   │   │   ├── auth/
│   │   │   ├── workouts/
│   │   │   ├── nutrition/
│   │   │   ├── body/
│   │   │   ├── supplements/
│   │   │   └── ai/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── workouts/
│   │   ├── nutrition/
│   │   ├── body/
│   │   ├── supplements/
│   │   ├── ai/
│   │   └── shared/
│   ├── lib/
│   │   ├── db.ts               # Prisma client
│   │   ├── auth.ts             # Auth.js config
│   │   ├── utils.ts            # cn() helper
│   │   ├── analytics.ts        # PostHog client
│   │   ├── ai/                 # Claude API abstraction
│   │   └── validations/        # Zod schemas
│   ├── services/               # Business logic
│   │   ├── workout.service.ts
│   │   ├── nutrition.service.ts
│   │   ├── body.service.ts
│   │   └── ai.service.ts
│   └── types/                  # TypeScript types
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/
├── docs/                       # Documentation
├── public/                     # Static assets
├── tests/
│   ├── unit/
│   └── e2e/
└── .github/
    └── workflows/
```

---

## Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run unit tests (Vitest)
npm run test:e2e     # Run E2E tests (Playwright)
npm run test:coverage # Coverage report
npx prisma studio    # Open Prisma Studio (DB GUI)
npx prisma migrate dev # Run migrations
npx prisma generate  # Regenerate Prisma client
```

---

## Authentication

Auth.js v5 handles authentication with:
- **Google OAuth** (primary provider)
- **Email Magic Links** (passwordless)
- JWT sessions stored in HTTP-only cookies
- Role-based access: `USER`, `COACH`, `ADMIN`

---

## Feature Modules

### Workout Tracker
- Plan, log, and analyze workouts
- 500+ exercises with instructions and muscle group targeting
- Progress charts and personal records
- AI-generated workout suggestions

### Nutrition Manager
- Food diary with macro/calorie tracking
- Barcode scanner for food items
- AI meal planning and shopping list generation
- Custom food item creation

### Body Composition
- Weight and measurement tracking
- Body fat percentage trends
- Progress photos (planned v2)
- Goal-setting with timelines

### Supplement Tracker
- Daily supplement scheduling and logging
- Adherence tracking
- Interaction warnings (AI-powered)

### AI Coach
- Conversational AI powered by Claude (claude-sonnet-4-6)
- Context-aware responses using your actual fitness data
- Workout recommendations, nutrition advice, injury guidance
- Streaming responses for real-time interaction

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Write tests for new features
4. Ensure `npm run lint` and `npm test` pass
5. Submit a pull request

---

## License

Private — All rights reserved.

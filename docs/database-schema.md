# Fitness OS — Database Schema Documentation

## Overview

Fitness OS uses PostgreSQL with Prisma ORM. The schema is organized into logical domain groups.

**Database:** PostgreSQL 16  
**ORM:** Prisma v5  
**Schema file:** `prisma/schema.prisma`

---

## Domain Groups

1. **Auth** — User accounts, OAuth, sessions
2. **User** — Profiles, roles
3. **Fitness** — Workouts, exercises, sets
4. **Nutrition** — Food, meals, goals
5. **Body** — Measurements, composition
6. **Supplements** — Tracking and logging
7. **Shopping** — AI-generated lists
8. **AI** — Conversation history
9. **Analytics** — Event tracking
10. **Business** — Subscriptions, coaching relationships
11. **Audit** — Security audit trail

---

## Auth Domain

### `Account`
Auth.js OAuth account linking.

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| userId | String | FK → User |
| type | String | oauth, oidc, email |
| provider | String | google, github, etc. |
| providerAccountId | String | Provider's user ID |
| refresh_token | Text? | OAuth refresh token |
| access_token | Text? | OAuth access token |
| expires_at | Int? | Token expiry timestamp |
| token_type | String? | bearer, etc. |
| scope | String? | OAuth scopes |
| id_token | Text? | OIDC id token |
| session_state | String? | OAuth session state |

**Indexes:** `userId`, unique(`provider`, `providerAccountId`)

### `Session`
Auth.js session store.

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| sessionToken | String | Unique session token |
| userId | String | FK → User |
| expires | DateTime | Session expiry |

**Indexes:** unique(`sessionToken`), `userId`

### `VerificationToken`
Email magic link tokens.

| Column | Type | Description |
|--------|------|-------------|
| identifier | String | Email address |
| token | String | Unique verification token |
| expires | DateTime | Token expiry |

**Indexes:** unique(`token`), unique(`identifier`, `token`)

---

## User Domain

### `User`

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| email | String | Unique email |
| name | String? | Display name |
| image | String? | Avatar URL |
| role | UserRole | USER, COACH, ADMIN |
| emailVerified | DateTime? | Email verification timestamp |
| createdAt | DateTime | Account creation |
| updatedAt | DateTime | Last updated |

**Enums:** `UserRole { USER, COACH, ADMIN }`  
**Indexes:** unique(`email`), `role`

### `Profile`
Extended user information.

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| userId | String | Unique FK → User |
| age | Int? | Age in years |
| gender | Gender? | MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY |
| height | Float? | Height in cm |
| weight | Float? | Current weight in kg |
| activityLevel | ActivityLevel | Sedentary to extremely active |
| bio | Text? | Free-text bio |
| avatarUrl | String? | Profile picture URL |
| timezone | String | IANA timezone string |
| dateOfBirth | DateTime? | For age calculations |
| fitnessLevel | String? | beginner, intermediate, advanced |

**Enums:**  
- `ActivityLevel { SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE, EXTREMELY_ACTIVE }`
- `Gender { MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY }`

---

## Fitness Domain

### `Exercise`
Exercise library (global + user-custom).

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| name | String | Exercise name |
| category | ExerciseCategory | STRENGTH, CARDIO, etc. |
| muscleGroups | String[] | e.g. ["chest", "triceps"] |
| equipment | String[] | e.g. ["barbell", "bench"] |
| instructions | Text? | Step-by-step instructions |
| videoUrl | String? | Demonstration video |
| imageUrl | String? | Illustration |
| isCustom | Boolean | User-created vs. global |
| createdById | String? | FK → User (null = system) |
| isPublic | Boolean | Visible to other users |

**Enums:** `ExerciseCategory { STRENGTH, CARDIO, FLEXIBILITY, BALANCE, SPORTS, OTHER }`

### `Workout`
A single workout session.

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| userId | String | FK → User |
| name | String | Workout name |
| date | DateTime | Scheduled/completed date |
| duration | Int? | Duration in minutes |
| notes | Text? | Free-form notes |
| status | WorkoutStatus | PLANNED, IN_PROGRESS, COMPLETED, SKIPPED |
| caloriesBurned | Int? | Estimated calories |
| totalVolume | Float? | Total weight × reps |
| isTemplate | Boolean | Save as reusable template |

**Enums:** `WorkoutStatus { PLANNED, IN_PROGRESS, COMPLETED, SKIPPED }`

### `WorkoutExercise`
Join between Workout and Exercise, with ordering.

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| workoutId | String | FK → Workout |
| exerciseId | String | FK → Exercise |
| order | Int | Display order in workout |
| notes | Text? | Exercise-specific notes |
| restTime | Int? | Seconds rest between sets |

### `ExerciseSet`
Individual set within a WorkoutExercise.

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| workoutExerciseId | String | FK → WorkoutExercise |
| setNumber | Int | Set order (1, 2, 3...) |
| reps | Int? | Repetitions |
| weight | Float? | Weight in kg |
| duration | Int? | Seconds (timed sets) |
| distance | Float? | km (cardio) |
| isCompleted | Boolean | Marked done during workout |
| rpe | Int? | Rate of Perceived Exertion 1–10 |
| notes | String? | Set notes |

---

## Nutrition Domain

### `FoodItem`
Food database (global + user-custom).

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| name | String | Food name |
| brand | String? | Brand name |
| calories | Float | kcal per serving |
| protein | Float | Grams protein per serving |
| carbs | Float | Grams carbs per serving |
| fat | Float | Grams fat per serving |
| fiber | Float? | Grams fiber per serving |
| sodium | Float? | mg sodium per serving |
| sugar | Float? | Grams sugar per serving |
| servingSize | Float | Default serving size |
| servingUnit | String | g, ml, oz, etc. |
| barcode | String? | UPC/EAN barcode (unique) |
| isCustom | Boolean | User-created |
| createdById | String? | FK → User |
| isPublic | Boolean | Shared with other users |

### `Meal`
A meal entry for a specific date/type.

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| userId | String | FK → User |
| date | DateTime | Meal date |
| mealType | MealType | BREAKFAST, LUNCH, DINNER, SNACK, etc. |
| name | String? | Custom meal name |
| notes | Text? | Meal notes |

**Enums:** `MealType { BREAKFAST, LUNCH, DINNER, SNACK, PRE_WORKOUT, POST_WORKOUT }`

### `MealItem`
Individual food items within a meal.

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| mealId | String | FK → Meal |
| foodItemId | String | FK → FoodItem |
| quantity | Float | Multiplier of serving size |
| servingSize | Float | Actual serving size |
| calories | Float | Calculated calories |
| protein | Float | Calculated protein |
| carbs | Float | Calculated carbs |
| fat | Float | Calculated fat |
| fiber | Float? | Calculated fiber |

### `NutritionGoal`
Daily nutrition targets per user.

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| userId | String | Unique FK → User |
| calories | Int | Daily calorie target |
| protein | Float | Daily protein target (g) |
| carbs | Float | Daily carb target (g) |
| fat | Float | Daily fat target (g) |
| fiber | Float? | Daily fiber target (g) |
| water | Float? | Daily water target (liters) |

---

## Body Domain

### `BodyMeasurement`
Periodic body measurements.

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| userId | String | FK → User |
| date | DateTime | Measurement date |
| weight | Float? | kg |
| bodyFat | Float? | Percentage |
| chest | Float? | cm circumference |
| waist | Float? | cm circumference |
| hips | Float? | cm circumference |
| biceps | Float? | cm circumference |
| thighs | Float? | cm circumference |
| calves | Float? | cm circumference |
| shoulders | Float? | cm circumference |
| neck | Float? | cm circumference |
| notes | Text? | Notes |

---

## Goals Domain

### `Goal`

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| userId | String | FK → User |
| type | GoalType | WEIGHT_LOSS, MUSCLE_GAIN, etc. |
| targetWeight | Float? | Target weight in kg |
| targetDate | DateTime? | Target completion date |
| description | Text? | User-written description |
| status | GoalStatus | ACTIVE, COMPLETED, PAUSED, ABANDONED |
| startWeight | Float? | Weight at goal creation |
| currentWeight | Float? | Latest weight reading |
| notes | Text? | Progress notes |

**Enums:**
- `GoalType { WEIGHT_LOSS, MUSCLE_GAIN, MAINTENANCE, ENDURANCE, STRENGTH }`
- `GoalStatus { ACTIVE, COMPLETED, PAUSED, ABANDONED }`

---

## Supplements Domain

### `Supplement`

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| userId | String | FK → User |
| name | String | Supplement name |
| brand | String? | Brand |
| dosage | Float | Amount per dose |
| unit | String | mg, g, ml, capsules |
| frequency | String | daily, twice daily, etc. |
| instructions | Text? | Timing/food instructions |
| startDate | DateTime | When regimen started |
| endDate | DateTime? | When regimen ends |
| isActive | Boolean | Currently taking |
| category | String? | protein, vitamin, mineral, etc. |

### `SupplementLog`
Daily supplement intake records.

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| supplementId | String | FK → Supplement |
| userId | String | FK → User |
| takenAt | DateTime | When taken |
| dosage | Float | Actual dosage taken |
| notes | String? | Notes |

---

## Shopping Domain

### `ShoppingList`

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| userId | String | FK → User |
| name | String | List name |
| generatedAt | DateTime | Creation time |
| aiGenerated | Boolean | Generated by AI |
| notes | Text? | List notes |

### `ShoppingListItem`

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| shoppingListId | String | FK → ShoppingList |
| name | String | Item name |
| quantity | Float? | Amount needed |
| unit | String? | Unit of measure |
| category | String? | produce, dairy, protein |
| isPurchased | Boolean | Checked off |
| estimatedCost | Float? | Estimated price |
| brand | String? | Specific brand |
| notes | String? | Notes |

---

## AI Domain

### `AIConversation`

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| userId | String | FK → User |
| title | String | Conversation title |
| context | Text? | JSON context snapshot |
| createdAt | DateTime | Created |
| updatedAt | DateTime | Last message |

### `AIMessage`

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| conversationId | String | FK → AIConversation |
| role | MessageRole | USER, ASSISTANT, SYSTEM |
| content | Text | Message content |
| tokens | Int? | Token count |
| createdAt | DateTime | Message timestamp |

**Enums:** `MessageRole { USER, ASSISTANT, SYSTEM }`

---

## Business Domain

### `Subscription`

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| userId | String | Unique FK → User |
| plan | SubscriptionPlan | FREE, PRO, COACH, ENTERPRISE |
| status | SubscriptionStatus | ACTIVE, CANCELLED, etc. |
| stripeCustomerId | String? | Stripe customer ID |
| stripeSubscriptionId | String? | Stripe subscription ID |
| currentPeriodEnd | DateTime? | Billing period end |
| cancelAtPeriodEnd | Boolean | Scheduled for cancellation |

**Enums:**
- `SubscriptionPlan { FREE, PRO, COACH, ENTERPRISE }`
- `SubscriptionStatus { ACTIVE, CANCELLED, PAST_DUE, TRIALING, INCOMPLETE }`

### `CoachRelationship`

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| coachId | String | FK → User (coach) |
| clientId | String | FK → User (client) |
| status | RelationshipStatus | PENDING, ACTIVE, PAUSED, ENDED |
| startDate | DateTime? | Relationship start |
| endDate | DateTime? | Relationship end |
| notes | Text? | Coach notes |

**Enums:** `RelationshipStatus { PENDING, ACTIVE, PAUSED, ENDED }`

---

## Audit Domain

### `AuditLog`

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| userId | String? | FK → User (null for system events) |
| action | String | CREATE, UPDATE, DELETE, LOGIN, LOGOUT |
| resource | String | Table/entity name |
| resourceId | String? | Affected record ID |
| metadata | Json? | Additional context |
| ipAddress | String? | Client IP |
| userAgent | Text? | Browser/client user agent |
| createdAt | DateTime | Event timestamp |

---

## Analytics Domain

### `AnalyticsEvent`

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| userId | String? | FK → User (null for anonymous) |
| event | String | Event name |
| properties | Json? | Event properties |
| timestamp | DateTime | When it happened |
| sessionId | String? | Client session ID |
| ipAddress | String? | Client IP |

---

## Indexing Strategy

All foreign keys are indexed. Additional indexes:
- `User.email` — Login lookup
- `Workout.date` — Date range queries
- `Meal.date` — Date range queries
- `BodyMeasurement.date` — Timeline queries
- `AnalyticsEvent.event` — Event aggregation
- `AnalyticsEvent.timestamp` — Time-series queries
- `AuditLog.createdAt` — Audit trail queries
- `FoodItem.barcode` — Barcode scanner lookup
- `FoodItem.name` — Text search

---

## Migration Strategy

- All schema changes via `prisma migrate dev`
- Migration files committed to `prisma/migrations/`
- Production deploys via `prisma migrate deploy`
- Never edit migration files after applying

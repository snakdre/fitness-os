import { PostHog } from "posthog-node"

let posthogClient: PostHog | null = null

function getPostHogClient(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
    })
  }
  return posthogClient
}

export type AnalyticsEventName =
  | "AccountCreated"
  | "ProfileCompleted"
  | "FirstWorkoutCompleted"
  | "FirstMealLogged"
  | "FirstGoalCreated"
  | "WorkoutCompleted"
  | "MealLogged"
  | "SupplementTaken"
  | "ShoppingListGenerated"
  | "AIConversationStarted"
  | "GoalCreated"
  | "GoalCompleted"
  | "BodyMeasurementAdded"
  | "ShoppingListCreated"
  | "ShoppingListItemToggled"

export function trackEvent(
  userId: string,
  event: AnalyticsEventName,
  properties?: Record<string, unknown>
) {
  const client = getPostHogClient()
  if (!client) return
  client.capture({ distinctId: userId, event, properties })
}

export async function shutdownAnalytics() {
  await posthogClient?.shutdown()
}

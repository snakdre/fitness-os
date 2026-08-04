export interface FitnessScoreInput {
  trainingConsistency: number // workouts logged in last 30 days (max ~20 for score of 100)
  nutritionAdherence: number // days nutrition logged in last 30 days (max 30)
  recoveryDays: number // rest days in last 14 days (optimal: 4-5)
  goalProgress: number // percentage of goal achieved (0-100)
}

export function calculateFitnessScore(input: FitnessScoreInput): number {
  // Training consistency: 30% weight
  const trainingScore = Math.min(100, (input.trainingConsistency / 20) * 100) * 0.3

  // Nutrition adherence: 30% weight
  const nutritionScore = Math.min(100, (input.nutritionAdherence / 30) * 100) * 0.3

  // Recovery (optimal is 4-5 rest days per 2 weeks): 20% weight
  const optimalRecovery = Math.abs(input.recoveryDays - 4.5)
  const recoveryScore = Math.max(0, 100 - optimalRecovery * 15) * 0.2

  // Goal progress: 20% weight
  const goalScore = Math.min(100, input.goalProgress) * 0.2

  return Math.round(trainingScore + nutritionScore + recoveryScore + goalScore)
}

export function getFitnessScoreLabel(score: number): string {
  if (score >= 90) return "Elite"
  if (score >= 75) return "Advanced"
  if (score >= 60) return "Intermediate"
  if (score >= 40) return "Beginner"
  return "Getting Started"
}

export function getFitnessScoreColor(score: number): string {
  if (score >= 90) return "text-purple-500"
  if (score >= 75) return "text-blue-500"
  if (score >= 60) return "text-green-500"
  if (score >= 40) return "text-yellow-500"
  return "text-gray-500"
}

export function getFitnessScoreBgColor(score: number): string {
  if (score >= 90) return "bg-purple-500"
  if (score >= 75) return "bg-blue-500"
  if (score >= 60) return "bg-green-500"
  if (score >= 40) return "bg-yellow-500"
  return "bg-gray-500"
}

export function getFitnessScoreRingColor(score: number): string {
  if (score >= 90) return "stroke-purple-500"
  if (score >= 75) return "stroke-blue-500"
  if (score >= 60) return "stroke-green-500"
  if (score >= 40) return "stroke-yellow-500"
  return "stroke-gray-500"
}

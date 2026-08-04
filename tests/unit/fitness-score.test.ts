import { describe, it, expect } from "vitest"
import {
  calculateFitnessScore,
  getFitnessScoreLabel,
  getFitnessScoreColor,
  getFitnessScoreRingColor,
  getFitnessScoreBgColor,
} from "@/lib/fitness-score"

describe("calculateFitnessScore", () => {
  it("returns 100 for perfect inputs", () => {
    const score = calculateFitnessScore({
      trainingConsistency: 20,
      nutritionAdherence: 30,
      recoveryDays: 4.5,
      goalProgress: 100,
    })
    expect(score).toBe(100)
  })

  it("returns 0 for zero inputs with 0 recovery days (which still gives partial recovery score)", () => {
    // With recoveryDays=0: optimalRecovery=|0-4.5|=4.5, recoveryScore=max(0,100-67.5)*0.2=6.5 -> rounds to 7
    // training=0, nutrition=0, goalProgress=0 => total = 7
    const score = calculateFitnessScore({
      trainingConsistency: 0,
      nutritionAdherence: 0,
      recoveryDays: 0,
      goalProgress: 0,
    })
    expect(score).toBe(7)
  })

  it("returns 0 for all-zero inputs except extreme recovery", () => {
    // With recoveryDays=100: optimalRecovery=|100-4.5|=95.5, recoveryScore=max(0,100-1432.5)=0
    const score = calculateFitnessScore({
      trainingConsistency: 0,
      nutritionAdherence: 0,
      recoveryDays: 100,
      goalProgress: 0,
    })
    expect(score).toBe(0)
  })

  it("caps training consistency at 20 workouts", () => {
    const scoreAt20 = calculateFitnessScore({
      trainingConsistency: 20,
      nutritionAdherence: 0,
      recoveryDays: 4.5,
      goalProgress: 0,
    })
    const scoreAt40 = calculateFitnessScore({
      trainingConsistency: 40,
      nutritionAdherence: 0,
      recoveryDays: 4.5,
      goalProgress: 0,
    })
    expect(scoreAt20).toBe(scoreAt40)
  })

  it("caps nutrition adherence at 30 days", () => {
    const scoreAt30 = calculateFitnessScore({
      trainingConsistency: 0,
      nutritionAdherence: 30,
      recoveryDays: 4.5,
      goalProgress: 0,
    })
    const scoreAt60 = calculateFitnessScore({
      trainingConsistency: 0,
      nutritionAdherence: 60,
      recoveryDays: 4.5,
      goalProgress: 0,
    })
    expect(scoreAt30).toBe(scoreAt60)
  })

  it("gives lower recovery score when far from optimal 4-5 rest days", () => {
    const optimalScore = calculateFitnessScore({
      trainingConsistency: 10,
      nutritionAdherence: 15,
      recoveryDays: 4.5,
      goalProgress: 50,
    })
    const poorRecoveryScore = calculateFitnessScore({
      trainingConsistency: 10,
      nutritionAdherence: 15,
      recoveryDays: 0,
      goalProgress: 50,
    })
    expect(optimalScore).toBeGreaterThan(poorRecoveryScore)
  })

  it("recovery score is 0 when recovery days deviate by more than ~6.67 from optimal", () => {
    // optimalRecovery = |11.17 - 4.5| = 6.67; recoveryScore = max(0, 100 - 100.05) = 0
    const scoreHighRecovery = calculateFitnessScore({
      trainingConsistency: 0,
      nutritionAdherence: 0,
      recoveryDays: 11.17,
      goalProgress: 0,
    })
    expect(scoreHighRecovery).toBe(0)
  })

  it("caps goal progress at 100%", () => {
    const score100 = calculateFitnessScore({
      trainingConsistency: 0,
      nutritionAdherence: 0,
      recoveryDays: 4.5,
      goalProgress: 100,
    })
    const score200 = calculateFitnessScore({
      trainingConsistency: 0,
      nutritionAdherence: 0,
      recoveryDays: 4.5,
      goalProgress: 200,
    })
    expect(score100).toBe(score200)
  })

  it("training consistency is 30% of total score", () => {
    const scoreAllTraining = calculateFitnessScore({
      trainingConsistency: 20,
      nutritionAdherence: 0,
      recoveryDays: 4.5,
      goalProgress: 0,
    })
    // 100 * 0.3 = 30, recovery at 4.5 = max(0, 100 - 0) * 0.2 = 20
    // total = 30 + 0 + 20 + 0 = 50
    expect(scoreAllTraining).toBe(50)
  })

  it("nutrition adherence is 30% of total score", () => {
    const scoreAllNutrition = calculateFitnessScore({
      trainingConsistency: 0,
      nutritionAdherence: 30,
      recoveryDays: 4.5,
      goalProgress: 0,
    })
    // 0 + 100*0.3 + recovery(4.5)*0.2 + 0 = 30 + 20 = 50
    expect(scoreAllNutrition).toBe(50)
  })

  it("returns integer values (rounded)", () => {
    const score = calculateFitnessScore({
      trainingConsistency: 7,
      nutritionAdherence: 13,
      recoveryDays: 3,
      goalProgress: 45,
    })
    expect(Number.isInteger(score)).toBe(true)
  })

  it("partial training+nutrition gives proportional score", () => {
    const score = calculateFitnessScore({
      trainingConsistency: 10, // 50% of 20 = 50 * 0.3 = 15
      nutritionAdherence: 15, // 50% of 30 = 50 * 0.3 = 15
      recoveryDays: 4.5, // optimal = 0 deviation: 100 * 0.2 = 20
      goalProgress: 50, // 50 * 0.2 = 10
    })
    // 15 + 15 + 20 + 10 = 60
    expect(score).toBe(60)
  })
})

describe("getFitnessScoreLabel", () => {
  it("returns 'Elite' for score >= 90", () => {
    expect(getFitnessScoreLabel(90)).toBe("Elite")
    expect(getFitnessScoreLabel(100)).toBe("Elite")
    expect(getFitnessScoreLabel(95)).toBe("Elite")
  })

  it("returns 'Advanced' for score 75-89", () => {
    expect(getFitnessScoreLabel(75)).toBe("Advanced")
    expect(getFitnessScoreLabel(85)).toBe("Advanced")
    expect(getFitnessScoreLabel(89)).toBe("Advanced")
  })

  it("returns 'Intermediate' for score 60-74", () => {
    expect(getFitnessScoreLabel(60)).toBe("Intermediate")
    expect(getFitnessScoreLabel(70)).toBe("Intermediate")
    expect(getFitnessScoreLabel(74)).toBe("Intermediate")
  })

  it("returns 'Beginner' for score 40-59", () => {
    expect(getFitnessScoreLabel(40)).toBe("Beginner")
    expect(getFitnessScoreLabel(50)).toBe("Beginner")
    expect(getFitnessScoreLabel(59)).toBe("Beginner")
  })

  it("returns 'Getting Started' for score < 40", () => {
    expect(getFitnessScoreLabel(0)).toBe("Getting Started")
    expect(getFitnessScoreLabel(25)).toBe("Getting Started")
    expect(getFitnessScoreLabel(39)).toBe("Getting Started")
  })
})

describe("getFitnessScoreColor", () => {
  it("returns purple for elite scores", () => {
    expect(getFitnessScoreColor(90)).toBe("text-purple-500")
    expect(getFitnessScoreColor(100)).toBe("text-purple-500")
  })

  it("returns blue for advanced scores", () => {
    expect(getFitnessScoreColor(75)).toBe("text-blue-500")
    expect(getFitnessScoreColor(80)).toBe("text-blue-500")
  })

  it("returns green for intermediate scores", () => {
    expect(getFitnessScoreColor(60)).toBe("text-green-500")
    expect(getFitnessScoreColor(65)).toBe("text-green-500")
  })

  it("returns yellow for beginner scores", () => {
    expect(getFitnessScoreColor(40)).toBe("text-yellow-500")
    expect(getFitnessScoreColor(50)).toBe("text-yellow-500")
  })

  it("returns gray for getting started scores", () => {
    expect(getFitnessScoreColor(0)).toBe("text-gray-500")
    expect(getFitnessScoreColor(39)).toBe("text-gray-500")
  })
})

describe("getFitnessScoreRingColor", () => {
  it("returns correct ring colors for each tier", () => {
    expect(getFitnessScoreRingColor(95)).toBe("stroke-purple-500")
    expect(getFitnessScoreRingColor(80)).toBe("stroke-blue-500")
    expect(getFitnessScoreRingColor(65)).toBe("stroke-green-500")
    expect(getFitnessScoreRingColor(45)).toBe("stroke-yellow-500")
    expect(getFitnessScoreRingColor(20)).toBe("stroke-gray-500")
  })
})

describe("getFitnessScoreBgColor", () => {
  it("returns correct background colors for each tier", () => {
    expect(getFitnessScoreBgColor(95)).toBe("bg-purple-500")
    expect(getFitnessScoreBgColor(80)).toBe("bg-blue-500")
    expect(getFitnessScoreBgColor(65)).toBe("bg-green-500")
    expect(getFitnessScoreBgColor(45)).toBe("bg-yellow-500")
    expect(getFitnessScoreBgColor(20)).toBe("bg-gray-500")
  })
})

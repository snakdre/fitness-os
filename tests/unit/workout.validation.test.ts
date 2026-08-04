import { describe, it, expect } from "vitest"
import {
  createWorkoutSchema,
  updateWorkoutSchema,
  addExerciseSchema,
  createExerciseSchema,
  updateExerciseSetSchema,
} from "@/lib/validations/workout"

describe("createWorkoutSchema", () => {
  it("accepts valid workout data", () => {
    const result = createWorkoutSchema.safeParse({
      name: "Push Day",
      date: "2026-08-03T10:00:00.000Z",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty name", () => {
    const result = createWorkoutSchema.safeParse({
      name: "",
      date: "2026-08-03T10:00:00.000Z",
    })
    expect(result.success).toBe(false)
  })

  it("rejects name over 100 characters", () => {
    const result = createWorkoutSchema.safeParse({
      name: "a".repeat(101),
      date: "2026-08-03T10:00:00.000Z",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid date format", () => {
    const result = createWorkoutSchema.safeParse({
      name: "Push Day",
      date: "not-a-date",
    })
    expect(result.success).toBe(false)
  })

  it("defaults isTemplate to false", () => {
    const result = createWorkoutSchema.safeParse({
      name: "Push Day",
      date: "2026-08-03T10:00:00.000Z",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isTemplate).toBe(false)
    }
  })

  it("accepts optional notes", () => {
    const result = createWorkoutSchema.safeParse({
      name: "Push Day",
      date: "2026-08-03T10:00:00.000Z",
      notes: "Focus on form",
    })
    expect(result.success).toBe(true)
  })
})

describe("updateWorkoutSchema", () => {
  it("accepts partial update with status", () => {
    const result = updateWorkoutSchema.safeParse({
      status: "COMPLETED",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid status", () => {
    const result = updateWorkoutSchema.safeParse({
      status: "INVALID_STATUS",
    })
    expect(result.success).toBe(false)
  })

  it("accepts duration as positive integer", () => {
    const result = updateWorkoutSchema.safeParse({
      duration: 60,
    })
    expect(result.success).toBe(true)
  })

  it("rejects negative duration", () => {
    const result = updateWorkoutSchema.safeParse({
      duration: -5,
    })
    expect(result.success).toBe(false)
  })
})

describe("addExerciseSchema", () => {
  it("accepts valid exercise with sets", () => {
    const result = addExerciseSchema.safeParse({
      exerciseId: "clxyz123456789abcdef01234",
      order: 0,
      sets: [
        { setNumber: 1, reps: 10, weight: 80 },
        { setNumber: 2, reps: 10, weight: 80 },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("rejects rpe outside 1-10 range", () => {
    const result = addExerciseSchema.safeParse({
      exerciseId: "clxyz123456789abcdef01234",
      order: 0,
      sets: [{ setNumber: 1, rpe: 11 }],
    })
    expect(result.success).toBe(false)
  })

  it("rejects negative weight", () => {
    const result = addExerciseSchema.safeParse({
      exerciseId: "clxyz123456789abcdef01234",
      order: 0,
      sets: [{ setNumber: 1, weight: -10 }],
    })
    expect(result.success).toBe(false)
  })

  it("requires exerciseId to be a valid cuid", () => {
    const result = addExerciseSchema.safeParse({
      exerciseId: "not-a-cuid",
      order: 0,
      sets: [],
    })
    expect(result.success).toBe(false)
  })
})

describe("createExerciseSchema", () => {
  it("accepts valid exercise", () => {
    const result = createExerciseSchema.safeParse({
      name: "Bulgarian Split Squat",
      category: "STRENGTH",
      muscleGroups: ["quadriceps", "glutes"],
      equipment: ["dumbbell"],
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty muscleGroups array", () => {
    const result = createExerciseSchema.safeParse({
      name: "Some Exercise",
      category: "STRENGTH",
      muscleGroups: [],
      equipment: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid category", () => {
    const result = createExerciseSchema.safeParse({
      name: "Some Exercise",
      category: "YOGA",
      muscleGroups: ["core"],
    })
    expect(result.success).toBe(false)
  })

  it("defaults equipment to empty array", () => {
    const result = createExerciseSchema.safeParse({
      name: "Burpee",
      category: "CARDIO",
      muscleGroups: ["full_body"],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.equipment).toEqual([])
    }
  })

  it("rejects invalid videoUrl", () => {
    const result = createExerciseSchema.safeParse({
      name: "Squat",
      category: "STRENGTH",
      muscleGroups: ["quadriceps"],
      videoUrl: "not-a-url",
    })
    expect(result.success).toBe(false)
  })
})

describe("updateExerciseSetSchema", () => {
  it("accepts partial set update", () => {
    const result = updateExerciseSetSchema.safeParse({
      isCompleted: true,
      reps: 10,
      weight: 80,
    })
    expect(result.success).toBe(true)
  })

  it("accepts empty object (no-op update)", () => {
    const result = updateExerciseSetSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("rejects rpe above 10", () => {
    const result = updateExerciseSetSchema.safeParse({ rpe: 11 })
    expect(result.success).toBe(false)
  })
})

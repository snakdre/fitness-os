import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock is hoisted — use vi.fn() inline, access mocks via the module ref
vi.mock("@/lib/db", () => ({
  db: {
    workout: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    workoutExercise: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    exerciseSet: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    exercise: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

import { db } from "@/lib/db"
// Typed shorthand helpers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDb = db as unknown as {
  workout: {
    findMany: ReturnType<typeof vi.fn>
    findFirst: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    count: ReturnType<typeof vi.fn>
  }
  workoutExercise: {
    create: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
  }
  exerciseSet: {
    findFirst: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  exercise: {
    findUnique: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
  }
}

import {
  createWorkout,
  getWorkout,
  getWorkouts,
  updateWorkout,
  deleteWorkout,
  completeWorkout,
  getWorkoutStats,
  addExerciseToWorkout,
  updateExerciseSet,
  getExercises,
  createCustomExercise,
} from "@/services/workout.service"

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── createWorkout ────────────────────────────────────────────────────────────

describe("createWorkout", () => {
  it("creates a workout with correct data", async () => {
    const mockWorkout = {
      id: "workout-1",
      userId: "user-1",
      name: "Push Day",
      status: "PLANNED",
      date: new Date("2026-08-03T10:00:00.000Z"),
      exercises: [],
    }
    mockDb.workout.create.mockResolvedValue(mockWorkout)

    const result = await createWorkout("user-1", {
      name: "Push Day",
      date: "2026-08-03T10:00:00.000Z",
      isTemplate: false,
    })

    expect(mockDb.workout.create).toHaveBeenCalledOnce()
    const callArgs = mockDb.workout.create.mock.calls[0][0]
    expect(callArgs.data.userId).toBe("user-1")
    expect(callArgs.data.name).toBe("Push Day")
    expect(callArgs.data.status).toBe("PLANNED")
    expect(result).toEqual(mockWorkout)
  })

  it("sets isTemplate to false by default", async () => {
    mockDb.workout.create.mockResolvedValue({ id: "w1", exercises: [] })

    await createWorkout("user-1", {
      name: "Test",
      date: "2026-08-03T10:00:00.000Z",
      isTemplate: false,
    })

    const callArgs = mockDb.workout.create.mock.calls[0][0]
    expect(callArgs.data.isTemplate).toBe(false)
  })
})

// ─── getWorkout ───────────────────────────────────────────────────────────────

describe("getWorkout", () => {
  it("returns the workout when found", async () => {
    const mockWorkout = { id: "w1", userId: "user-1", name: "Pull Day" }
    mockDb.workout.findFirst.mockResolvedValue(mockWorkout)

    const result = await getWorkout("w1", "user-1")
    expect(result).toEqual(mockWorkout)
    expect(mockDb.workout.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "w1", userId: "user-1" } })
    )
  })

  it("returns null when workout belongs to another user", async () => {
    mockDb.workout.findFirst.mockResolvedValue(null)

    const result = await getWorkout("w1", "other-user")
    expect(result).toBeNull()
  })
})

// ─── updateWorkout ────────────────────────────────────────────────────────────

describe("updateWorkout", () => {
  it("returns null when workout not found", async () => {
    mockDb.workout.findFirst.mockResolvedValue(null)

    const result = await updateWorkout("w1", "user-1", { name: "New Name" })
    expect(result).toBeNull()
    expect(mockDb.workout.update).not.toHaveBeenCalled()
  })

  it("updates the workout when user owns it", async () => {
    const existing = { id: "w1", userId: "user-1" }
    const updated = { id: "w1", name: "New Name", exercises: [] }
    mockDb.workout.findFirst.mockResolvedValue(existing)
    mockDb.workout.update.mockResolvedValue(updated)

    const result = await updateWorkout("w1", "user-1", { name: "New Name" })
    expect(mockDb.workout.update).toHaveBeenCalledOnce()
    expect(result).toEqual(updated)
  })
})

// ─── deleteWorkout ────────────────────────────────────────────────────────────

describe("deleteWorkout", () => {
  it("returns false when workout not found", async () => {
    mockDb.workout.findFirst.mockResolvedValue(null)

    const result = await deleteWorkout("w1", "user-1")
    expect(result).toBe(false)
    expect(mockDb.workout.delete).not.toHaveBeenCalled()
  })

  it("deletes workout and returns true when authorized", async () => {
    mockDb.workout.findFirst.mockResolvedValue({ id: "w1", userId: "user-1" })
    mockDb.workout.delete.mockResolvedValue({ id: "w1" })

    const result = await deleteWorkout("w1", "user-1")
    expect(result).toBe(true)
    expect(mockDb.workout.delete).toHaveBeenCalledWith({ where: { id: "w1" } })
  })
})

// ─── completeWorkout ──────────────────────────────────────────────────────────

describe("completeWorkout", () => {
  it("returns null when workout not found", async () => {
    mockDb.workout.findFirst.mockResolvedValue(null)

    const result = await completeWorkout("w1", "user-1")
    expect(result).toBeNull()
    expect(mockDb.workout.update).not.toHaveBeenCalled()
  })

  it("calculates totalVolume correctly from completed sets", async () => {
    const mockWorkout = {
      id: "w1",
      userId: "user-1",
      duration: 45,
      createdAt: new Date(),
      exercises: [
        {
          sets: [
            { isCompleted: true, weight: 80, reps: 10 },  // 800
            { isCompleted: true, weight: 80, reps: 8 },   // 640
            { isCompleted: false, weight: 80, reps: 10 }, // skipped
          ],
        },
        {
          sets: [
            { isCompleted: true, weight: 50, reps: 12 }, // 600
          ],
        },
      ],
    }
    mockDb.workout.findFirst.mockResolvedValue(mockWorkout)
    mockDb.workout.update.mockResolvedValue({ id: "w1", status: "COMPLETED", exercises: [] })

    await completeWorkout("w1", "user-1")

    const updateArgs = mockDb.workout.update.mock.calls[0][0]
    expect(updateArgs.data.status).toBe("COMPLETED")
    expect(updateArgs.data.totalVolume).toBe(2040) // 800 + 640 + 600
  })

  it("sets totalVolume to undefined when no completed sets have weight", async () => {
    const mockWorkout = {
      id: "w1",
      userId: "user-1",
      duration: 30,
      createdAt: new Date(),
      exercises: [
        {
          sets: [
            { isCompleted: true, weight: null, reps: null },
          ],
        },
      ],
    }
    mockDb.workout.findFirst.mockResolvedValue(mockWorkout)
    mockDb.workout.update.mockResolvedValue({ id: "w1", exercises: [] })

    await completeWorkout("w1", "user-1")

    const updateArgs = mockDb.workout.update.mock.calls[0][0]
    expect(updateArgs.data.totalVolume).toBeUndefined()
  })
})

// ─── addExerciseToWorkout ─────────────────────────────────────────────────────

describe("addExerciseToWorkout", () => {
  it("returns null when workout not found", async () => {
    mockDb.workout.findFirst.mockResolvedValue(null)

    const result = await addExerciseToWorkout("w1", "user-1", {
      exerciseId: "ex-1",
      order: 0,
      sets: [{ setNumber: 1, reps: 10 }],
    })
    expect(result).toBeNull()
  })

  it("returns null when exercise does not exist", async () => {
    mockDb.workout.findFirst.mockResolvedValue({ id: "w1" })
    mockDb.exercise.findUnique.mockResolvedValue(null)

    const result = await addExerciseToWorkout("w1", "user-1", {
      exerciseId: "ex-missing",
      order: 0,
      sets: [],
    })
    expect(result).toBeNull()
  })

  it("creates workout exercise with sets", async () => {
    mockDb.workout.findFirst.mockResolvedValue({ id: "w1" })
    mockDb.exercise.findUnique.mockResolvedValue({ id: "ex-1", name: "Bench Press" })
    mockDb.workoutExercise.create.mockResolvedValue({
      id: "we-1",
      exercise: { name: "Bench Press" },
      sets: [{ setNumber: 1 }],
    })

    const result = await addExerciseToWorkout("w1", "user-1", {
      exerciseId: "ex-1",
      order: 0,
      sets: [{ setNumber: 1, reps: 10, weight: 80 }],
    })

    expect(mockDb.workoutExercise.create).toHaveBeenCalledOnce()
    expect(result).toBeTruthy()
  })
})

// ─── updateExerciseSet ────────────────────────────────────────────────────────

describe("updateExerciseSet", () => {
  it("returns null when set not found", async () => {
    mockDb.exerciseSet.findFirst.mockResolvedValue(null)

    const result = await updateExerciseSet("set-1", "user-1", { isCompleted: true })
    expect(result).toBeNull()
  })

  it("returns null when set belongs to another user", async () => {
    mockDb.exerciseSet.findFirst.mockResolvedValue({
      id: "set-1",
      workoutExercise: {
        workout: { userId: "other-user" },
      },
    })

    const result = await updateExerciseSet("set-1", "user-1", { isCompleted: true })
    expect(result).toBeNull()
    expect(mockDb.exerciseSet.update).not.toHaveBeenCalled()
  })

  it("updates the set when user is authorized", async () => {
    mockDb.exerciseSet.findFirst.mockResolvedValue({
      id: "set-1",
      workoutExercise: {
        workout: { userId: "user-1" },
      },
    })
    mockDb.exerciseSet.update.mockResolvedValue({ id: "set-1", isCompleted: true })

    const result = await updateExerciseSet("set-1", "user-1", { isCompleted: true })
    expect(mockDb.exerciseSet.update).toHaveBeenCalledOnce()
    expect(result).toEqual({ id: "set-1", isCompleted: true })
  })
})

// ─── getExercises ─────────────────────────────────────────────────────────────

describe("getExercises", () => {
  it("fetches exercises with no filter", async () => {
    mockDb.exercise.findMany.mockResolvedValue([])

    await getExercises()
    expect(mockDb.exercise.findMany).toHaveBeenCalledOnce()
  })

  it("includes category filter when provided", async () => {
    mockDb.exercise.findMany.mockResolvedValue([])

    await getExercises({ category: "STRENGTH" })

    const callArgs = mockDb.exercise.findMany.mock.calls[0][0]
    expect(callArgs.where.category).toBe("STRENGTH")
  })
})

// ─── createCustomExercise ─────────────────────────────────────────────────────

describe("createCustomExercise", () => {
  it("creates an exercise marked as custom and private", async () => {
    const mockExercise = { id: "ex-new", name: "My Exercise" }
    mockDb.exercise.create.mockResolvedValue(mockExercise)

    const result = await createCustomExercise("user-1", {
      name: "My Exercise",
      category: "STRENGTH",
      muscleGroups: ["chest"],
      equipment: [],
    })

    const callArgs = mockDb.exercise.create.mock.calls[0][0]
    expect(callArgs.data.isCustom).toBe(true)
    expect(callArgs.data.isPublic).toBe(false)
    expect(callArgs.data.createdById).toBe("user-1")
    expect(result).toEqual(mockExercise)
  })
})

// ─── getWorkoutStats ──────────────────────────────────────────────────────────

describe("getWorkoutStats", () => {
  it("returns zero stats when user has no workouts", async () => {
    mockDb.workout.count.mockResolvedValue(0)
    mockDb.workout.findMany.mockResolvedValue([])

    const stats = await getWorkoutStats("user-1")
    expect(stats.totalWorkouts).toBe(0)
    expect(stats.streak).toBe(0)
    expect(stats.thisWeek).toBe(0)
    expect(stats.totalVolume).toBe(0)
  })

  it("calculates avgDuration from completed workouts", async () => {
    mockDb.workout.count
      .mockResolvedValueOnce(3) // totalWorkouts
      .mockResolvedValueOnce(1) // thisWeek

    mockDb.workout.findMany
      .mockResolvedValueOnce([
        { date: new Date(), duration: 60, totalVolume: 1000 },
        { date: new Date(), duration: 40, totalVolume: 800 },
        { date: new Date(), duration: 80, totalVolume: 1200 },
      ])
      .mockResolvedValueOnce([]) // weeklyVolume query

    const stats = await getWorkoutStats("user-1")
    expect(stats.avgDuration).toBe(60)
    expect(stats.totalVolume).toBe(3000)
  })
})

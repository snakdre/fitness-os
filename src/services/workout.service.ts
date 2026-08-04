import "server-only"
import { db } from "@/lib/db"
import {
  CreateWorkoutInput,
  UpdateWorkoutInput,
  AddExerciseInput,
  CreateExerciseInput,
} from "@/lib/validations/workout"

// ─── Workouts ────────────────────────────────────────────────────────────────

export async function getWorkouts(
  userId: string,
  options?: {
    status?: string
    from?: Date
    to?: Date
    limit?: number
    offset?: number
  }
) {
  const { status, from, to, limit = 20, offset = 0 } = options ?? {}

  const where: Record<string, unknown> = { userId }
  if (status) where.status = status
  if (from || to) {
    where.date = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    }
  }

  const [workouts, total] = await Promise.all([
    db.workout.findMany({
      where,
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { exercises: true } },
      },
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    }),
    db.workout.count({ where }),
  ])

  return { workouts, total, limit, offset }
}

export async function getWorkout(workoutId: string, userId: string) {
  const workout = await db.workout.findFirst({
    where: { id: workoutId, userId },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: { orderBy: { setNumber: "asc" } },
        },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!workout) return null
  return workout
}

export async function createWorkout(userId: string, data: CreateWorkoutInput) {
  return db.workout.create({
    data: {
      userId,
      name: data.name,
      date: new Date(data.date),
      notes: data.notes,
      isTemplate: data.isTemplate ?? false,
      status: "PLANNED",
    },
    include: {
      exercises: {
        include: { exercise: true, sets: true },
      },
    },
  })
}

export async function updateWorkout(
  workoutId: string,
  userId: string,
  data: UpdateWorkoutInput
) {
  // Verify ownership
  const existing = await db.workout.findFirst({ where: { id: workoutId, userId } })
  if (!existing) return null

  return db.workout.update({
    where: { id: workoutId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.date !== undefined ? { date: new Date(data.date) } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.isTemplate !== undefined ? { isTemplate: data.isTemplate } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.duration !== undefined ? { duration: data.duration } : {}),
      ...(data.caloriesBurned !== undefined
        ? { caloriesBurned: data.caloriesBurned }
        : {}),
      ...(data.totalVolume !== undefined ? { totalVolume: data.totalVolume } : {}),
    },
    include: {
      exercises: {
        include: { exercise: true, sets: { orderBy: { setNumber: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  })
}

export async function deleteWorkout(workoutId: string, userId: string) {
  const existing = await db.workout.findFirst({ where: { id: workoutId, userId } })
  if (!existing) return false

  await db.workout.delete({ where: { id: workoutId } })
  return true
}

// ─── Exercises Within a Workout ──────────────────────────────────────────────

export async function addExerciseToWorkout(
  workoutId: string,
  userId: string,
  data: AddExerciseInput
) {
  // Verify workout ownership
  const workout = await db.workout.findFirst({ where: { id: workoutId, userId } })
  if (!workout) return null

  // Verify exercise exists
  const exercise = await db.exercise.findUnique({ where: { id: data.exerciseId } })
  if (!exercise) return null

  return db.workoutExercise.create({
    data: {
      workoutId,
      exerciseId: data.exerciseId,
      order: data.order,
      notes: data.notes,
      restTime: data.restTime,
      sets: {
        create: data.sets.map((s) => ({
          setNumber: s.setNumber,
          reps: s.reps,
          weight: s.weight,
          duration: s.duration,
          distance: s.distance,
          rpe: s.rpe,
          notes: s.notes,
          isCompleted: false,
        })),
      },
    },
    include: {
      exercise: true,
      sets: { orderBy: { setNumber: "asc" } },
    },
  })
}

export async function updateExerciseSet(
  setId: string,
  userId: string,
  data: Partial<{
    reps: number
    weight: number
    isCompleted: boolean
    rpe: number
    duration: number
    distance: number
    notes: string
  }>
) {
  // Verify ownership via join
  const set = await db.exerciseSet.findFirst({
    where: { id: setId },
    include: {
      workoutExercise: { include: { workout: true } },
    },
  })

  if (!set || set.workoutExercise.workout.userId !== userId) return null

  return db.exerciseSet.update({
    where: { id: setId },
    data: {
      ...(data.reps !== undefined ? { reps: data.reps } : {}),
      ...(data.weight !== undefined ? { weight: data.weight } : {}),
      ...(data.isCompleted !== undefined ? { isCompleted: data.isCompleted } : {}),
      ...(data.rpe !== undefined ? { rpe: data.rpe } : {}),
      ...(data.duration !== undefined ? { duration: data.duration } : {}),
      ...(data.distance !== undefined ? { distance: data.distance } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    },
  })
}

// ─── Complete Workout ─────────────────────────────────────────────────────────

export async function completeWorkout(workoutId: string, userId: string) {
  const workout = await db.workout.findFirst({
    where: { id: workoutId, userId },
    include: {
      exercises: {
        include: {
          sets: true,
        },
      },
    },
  })

  if (!workout) return null

  // Calculate total volume (weight × reps for all completed sets)
  let totalVolume = 0
  for (const we of workout.exercises) {
    for (const set of we.sets) {
      if (set.isCompleted && set.weight && set.reps) {
        totalVolume += set.weight * set.reps
      }
    }
  }

  // Calculate duration in minutes from createdAt → now if not already set
  const durationMinutes = workout.duration
    ? workout.duration
    : Math.round((Date.now() - workout.createdAt.getTime()) / 60000)

  return db.workout.update({
    where: { id: workoutId },
    data: {
      status: "COMPLETED",
      totalVolume: totalVolume > 0 ? totalVolume : undefined,
      duration: durationMinutes,
    },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: { orderBy: { setNumber: "asc" } },
        },
        orderBy: { order: "asc" },
      },
    },
  })
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getWorkoutStats(userId: string) {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const [totalWorkouts, thisWeekWorkouts, allCompleted] = await Promise.all([
    db.workout.count({ where: { userId, status: "COMPLETED" } }),
    db.workout.count({
      where: { userId, status: "COMPLETED", date: { gte: startOfWeek } },
    }),
    db.workout.findMany({
      where: { userId, status: "COMPLETED" },
      select: { date: true, duration: true, totalVolume: true },
      orderBy: { date: "desc" },
    }),
  ])

  // Calculate streak (consecutive days with completed workouts)
  let streak = 0
  if (allCompleted.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const workoutDays = new Set(
      allCompleted.map((w) => {
        const d = new Date(w.date)
        d.setHours(0, 0, 0, 0)
        return d.toISOString()
      })
    )

    let checkDate = new Date(today)
    // If no workout today, start from yesterday
    if (!workoutDays.has(checkDate.toISOString())) {
      checkDate.setDate(checkDate.getDate() - 1)
    }

    while (workoutDays.has(checkDate.toISOString())) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
  }

  const avgDuration =
    allCompleted.length > 0
      ? Math.round(
          allCompleted.reduce((sum, w) => sum + (w.duration ?? 0), 0) /
            allCompleted.length
        )
      : 0

  const totalVolume = allCompleted.reduce((sum, w) => sum + (w.totalVolume ?? 0), 0)

  // Volume per week for chart (last 8 weeks)
  const eightWeeksAgo = new Date()
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)

  const recentWorkouts = await db.workout.findMany({
    where: { userId, status: "COMPLETED", date: { gte: eightWeeksAgo } },
    select: { date: true, totalVolume: true },
    orderBy: { date: "asc" },
  })

  const weeklyVolume: Record<string, number> = {}
  for (const w of recentWorkouts) {
    const d = new Date(w.date)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const key = weekStart.toISOString().slice(0, 10)
    weeklyVolume[key] = (weeklyVolume[key] ?? 0) + (w.totalVolume ?? 0)
  }

  return {
    totalWorkouts,
    thisWeek: thisWeekWorkouts,
    streak,
    avgDuration,
    totalVolume,
    weeklyVolume: Object.entries(weeklyVolume).map(([week, volume]) => ({
      week,
      volume,
    })),
  }
}

// ─── Exercises Library ────────────────────────────────────────────────────────

export async function getExercises(options?: {
  category?: string
  search?: string
  userId?: string
}) {
  const { category, search, userId } = options ?? {}

  const where: Record<string, unknown> = {
    OR: [{ isPublic: true }, ...(userId ? [{ createdById: userId }] : [])],
  }

  if (category) where.category = category

  if (search) {
    where.name = { contains: search, mode: "insensitive" }
  }

  return db.exercise.findMany({
    where,
    orderBy: [{ isCustom: "asc" }, { name: "asc" }],
  })
}

export async function createCustomExercise(
  userId: string,
  data: CreateExerciseInput
) {
  return db.exercise.create({
    data: {
      name: data.name,
      category: data.category,
      muscleGroups: data.muscleGroups,
      equipment: data.equipment ?? [],
      instructions: data.instructions,
      videoUrl: data.videoUrl,
      isCustom: true,
      isPublic: false,
      createdById: userId,
    },
  })
}

export async function getWorkoutHistory(userId: string, exerciseId: string) {
  const workoutExercises = await db.workoutExercise.findMany({
    where: {
      exerciseId,
      workout: { userId, status: "COMPLETED" },
    },
    include: {
      workout: { select: { date: true, name: true } },
      sets: { orderBy: { setNumber: "asc" } },
    },
    orderBy: { workout: { date: "desc" } },
    take: 20,
  })

  return workoutExercises.map((we) => {
    const completedSets = we.sets.filter((s) => s.isCompleted)
    const maxWeight = completedSets.reduce(
      (max, s) => Math.max(max, s.weight ?? 0),
      0
    )
    const totalVolume = completedSets.reduce(
      (sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0),
      0
    )
    return {
      date: we.workout.date,
      workoutName: we.workout.name,
      sets: we.sets,
      maxWeight,
      totalVolume,
    }
  })
}

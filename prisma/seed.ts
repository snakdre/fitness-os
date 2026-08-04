import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { config } from "dotenv"
import path from "path"

config({ path: path.join(process.cwd(), ".env.local") })
config({ path: path.join(process.cwd(), ".env") })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool, { schema: "public" })
const prisma = new PrismaClient({ adapter })

const exercises = [
  // ─── STRENGTH — Chest ────────────────────────────────────────────────────────
  {
    name: "Barbell Bench Press",
    category: "STRENGTH" as const,
    muscleGroups: ["chest", "triceps", "anterior_deltoid"],
    equipment: ["barbell", "bench"],
    instructions:
      "Lie on a flat bench with barbell at chest width grip. Lower the bar to mid-chest, then press up explosively.",
  },
  {
    name: "Incline Dumbbell Press",
    category: "STRENGTH" as const,
    muscleGroups: ["chest", "anterior_deltoid", "triceps"],
    equipment: ["dumbbell", "bench"],
    instructions:
      "Set bench to 30-45 degree incline. Press dumbbells from shoulder height to lockout.",
  },
  {
    name: "Cable Fly",
    category: "STRENGTH" as const,
    muscleGroups: ["chest"],
    equipment: ["cable"],
    instructions:
      "Stand between two cable machines. Bring handles together in a hugging arc motion.",
  },
  {
    name: "Push-Up",
    category: "STRENGTH" as const,
    muscleGroups: ["chest", "triceps", "anterior_deltoid", "core"],
    equipment: ["bodyweight"],
    instructions:
      "In a plank position, lower your chest to the floor while keeping your body straight, then push up.",
  },
  {
    name: "Dumbbell Fly",
    category: "STRENGTH" as const,
    muscleGroups: ["chest"],
    equipment: ["dumbbell", "bench"],
    instructions:
      "Lie on a flat bench. With slight elbow bend, lower dumbbells in an arc until you feel a chest stretch, then bring together.",
  },

  // ─── STRENGTH — Back ─────────────────────────────────────────────────────────
  {
    name: "Barbell Deadlift",
    category: "STRENGTH" as const,
    muscleGroups: ["back", "glutes", "hamstrings", "core", "forearms"],
    equipment: ["barbell"],
    instructions:
      "Stand with feet hip-width apart over the bar. Hinge at the hips, grip the bar, and drive through your heels to stand up.",
  },
  {
    name: "Pull-Up",
    category: "STRENGTH" as const,
    muscleGroups: ["back", "biceps", "core"],
    equipment: ["pull_up_bar", "bodyweight"],
    instructions:
      "Hang from a bar with palms facing away. Pull your chest to the bar by driving elbows down, then lower with control.",
  },
  {
    name: "Barbell Row",
    category: "STRENGTH" as const,
    muscleGroups: ["back", "biceps", "rear_deltoid"],
    equipment: ["barbell"],
    instructions:
      "Hinge forward at the hips with a neutral spine. Pull the bar to your lower abdomen, squeezing your shoulder blades.",
  },
  {
    name: "Lat Pulldown",
    category: "STRENGTH" as const,
    muscleGroups: ["back", "biceps"],
    equipment: ["cable", "machine"],
    instructions:
      "Grip the bar wider than shoulder width. Pull down to your upper chest while leaning back slightly.",
  },
  {
    name: "Seated Cable Row",
    category: "STRENGTH" as const,
    muscleGroups: ["back", "biceps", "rear_deltoid"],
    equipment: ["cable", "machine"],
    instructions:
      "Sit upright, grip the handle, and pull to your abdomen while keeping your torso still.",
  },
  {
    name: "Chin-Up",
    category: "STRENGTH" as const,
    muscleGroups: ["back", "biceps"],
    equipment: ["pull_up_bar", "bodyweight"],
    instructions:
      "Hang from a bar with palms facing you. Pull your chin above the bar, emphasizing bicep engagement.",
  },

  // ─── STRENGTH — Shoulders ─────────────────────────────────────────────────────
  {
    name: "Overhead Press",
    category: "STRENGTH" as const,
    muscleGroups: ["shoulders", "triceps", "core"],
    equipment: ["barbell"],
    instructions:
      "Stand with barbell at shoulder height. Press overhead to lockout, keeping your core braced.",
  },
  {
    name: "Dumbbell Lateral Raise",
    category: "STRENGTH" as const,
    muscleGroups: ["lateral_deltoid"],
    equipment: ["dumbbell"],
    instructions:
      "With slight elbow bend, raise dumbbells to the side until arms are parallel to the floor, then lower.",
  },
  {
    name: "Front Raise",
    category: "STRENGTH" as const,
    muscleGroups: ["anterior_deltoid"],
    equipment: ["dumbbell"],
    instructions:
      "Raise dumbbells in front of you to shoulder height with straight arms, then lower.",
  },
  {
    name: "Face Pull",
    category: "STRENGTH" as const,
    muscleGroups: ["rear_deltoid", "rotator_cuff", "upper_back"],
    equipment: ["cable"],
    instructions:
      "Pull a rope attachment to your face with elbows high, emphasizing external rotation.",
  },

  // ─── STRENGTH — Arms ─────────────────────────────────────────────────────────
  {
    name: "Barbell Curl",
    category: "STRENGTH" as const,
    muscleGroups: ["biceps"],
    equipment: ["barbell"],
    instructions:
      "Stand with an underhand grip, curl the bar to shoulder height keeping upper arms still.",
  },
  {
    name: "Hammer Curl",
    category: "STRENGTH" as const,
    muscleGroups: ["biceps", "brachialis", "forearms"],
    equipment: ["dumbbell"],
    instructions:
      "With neutral grip (thumbs up), curl the dumbbell to shoulder height.",
  },
  {
    name: "Tricep Pushdown",
    category: "STRENGTH" as const,
    muscleGroups: ["triceps"],
    equipment: ["cable"],
    instructions:
      "Stand facing a high cable pulley. Keep elbows at sides and push the bar down to lockout.",
  },
  {
    name: "Skull Crusher",
    category: "STRENGTH" as const,
    muscleGroups: ["triceps"],
    equipment: ["barbell", "bench"],
    instructions:
      "Lie on a bench. Lower the bar to your forehead by bending only at the elbows, then extend.",
  },
  {
    name: "Dip",
    category: "STRENGTH" as const,
    muscleGroups: ["triceps", "chest", "anterior_deltoid"],
    equipment: ["bodyweight"],
    instructions:
      "Support yourself on parallel bars. Lower your body until elbows are at 90°, then press up.",
  },

  // ─── STRENGTH — Legs ─────────────────────────────────────────────────────────
  {
    name: "Barbell Back Squat",
    category: "STRENGTH" as const,
    muscleGroups: ["quadriceps", "glutes", "hamstrings", "core"],
    equipment: ["barbell"],
    instructions:
      "With the bar on your upper traps, descend until thighs are parallel to the floor, then stand up.",
  },
  {
    name: "Romanian Deadlift",
    category: "STRENGTH" as const,
    muscleGroups: ["hamstrings", "glutes", "lower_back"],
    equipment: ["barbell"],
    instructions:
      "Stand tall. Hinge at hips pushing them back while keeping a slight knee bend, feeling a hamstring stretch.",
  },
  {
    name: "Leg Press",
    category: "STRENGTH" as const,
    muscleGroups: ["quadriceps", "glutes", "hamstrings"],
    equipment: ["machine"],
    instructions:
      "Push the platform away until knees are almost fully extended, then lower with control.",
  },
  {
    name: "Bulgarian Split Squat",
    category: "STRENGTH" as const,
    muscleGroups: ["quadriceps", "glutes", "hamstrings"],
    equipment: ["dumbbell", "bench"],
    instructions:
      "Rear foot elevated on a bench. Lower your back knee toward the floor, then drive up through the front heel.",
  },
  {
    name: "Leg Curl",
    category: "STRENGTH" as const,
    muscleGroups: ["hamstrings"],
    equipment: ["machine"],
    instructions: "Lie face down. Curl your heels to your glutes, then lower with control.",
  },
  {
    name: "Leg Extension",
    category: "STRENGTH" as const,
    muscleGroups: ["quadriceps"],
    equipment: ["machine"],
    instructions:
      "Sit in the machine. Extend your knees to full lockout, then lower slowly.",
  },
  {
    name: "Calf Raise",
    category: "STRENGTH" as const,
    muscleGroups: ["calves"],
    equipment: ["machine", "bodyweight"],
    instructions:
      "Stand with your toes on a raised surface. Push through the balls of your feet to raise your heels as high as possible.",
  },
  {
    name: "Hip Thrust",
    category: "STRENGTH" as const,
    muscleGroups: ["glutes", "hamstrings"],
    equipment: ["barbell", "bench"],
    instructions:
      "Shoulders on a bench, bar across hips. Drive hips up to full extension by squeezing your glutes.",
  },
  {
    name: "Walking Lunge",
    category: "STRENGTH" as const,
    muscleGroups: ["quadriceps", "glutes", "hamstrings"],
    equipment: ["dumbbell", "bodyweight"],
    instructions:
      "Step forward and lower your back knee to the floor, then step forward with the other leg.",
  },

  // ─── STRENGTH — Core ─────────────────────────────────────────────────────────
  {
    name: "Plank",
    category: "STRENGTH" as const,
    muscleGroups: ["core", "abs"],
    equipment: ["bodyweight"],
    instructions:
      "Hold a push-up position on your forearms, keeping your body in a straight line from head to heels.",
  },
  {
    name: "Cable Crunch",
    category: "STRENGTH" as const,
    muscleGroups: ["abs"],
    equipment: ["cable"],
    instructions:
      "Kneel below a cable pulley. Flex your spine to bring your elbows toward your knees.",
  },
  {
    name: "Hanging Leg Raise",
    category: "STRENGTH" as const,
    muscleGroups: ["abs", "hip_flexors"],
    equipment: ["pull_up_bar"],
    instructions:
      "Hang from a bar and raise your legs to hip height or above, keeping minimal swing.",
  },
  {
    name: "Russian Twist",
    category: "STRENGTH" as const,
    muscleGroups: ["abs", "obliques"],
    equipment: ["bodyweight", "dumbbell"],
    instructions:
      "Sit with knees bent and lean back slightly. Rotate your torso side to side.",
  },
  {
    name: "Ab Wheel Rollout",
    category: "STRENGTH" as const,
    muscleGroups: ["abs", "core"],
    equipment: ["bodyweight"],
    instructions:
      "Kneel on the floor with an ab wheel. Roll forward extending your body, then use your core to pull back.",
  },

  // ─── CARDIO ───────────────────────────────────────────────────────────────────
  {
    name: "Running",
    category: "CARDIO" as const,
    muscleGroups: ["legs", "core", "full_body"],
    equipment: ["treadmill"],
    instructions: "Maintain a consistent pace with a midfoot strike. Keep your breathing rhythmic.",
  },
  {
    name: "Cycling",
    category: "CARDIO" as const,
    muscleGroups: ["quadriceps", "hamstrings", "calves", "glutes"],
    equipment: ["bike"],
    instructions:
      "Adjust seat height so there's a slight bend at the knee when the pedal is at the bottom. Maintain cadence.",
  },
  {
    name: "Rowing",
    category: "CARDIO" as const,
    muscleGroups: ["back", "legs", "core", "arms"],
    equipment: ["rowing_machine"],
    instructions: "Drive with your legs first, then lean back and pull the handle to your chest.",
  },
  {
    name: "Jump Rope",
    category: "CARDIO" as const,
    muscleGroups: ["calves", "full_body"],
    equipment: ["bodyweight"],
    instructions:
      "Keep the rope turning with your wrists, jump with both feet together, landing softly on the balls of your feet.",
  },
  {
    name: "Burpee",
    category: "CARDIO" as const,
    muscleGroups: ["full_body"],
    equipment: ["bodyweight"],
    instructions:
      "Squat down, kick your feet back to a push-up position, do a push-up, jump your feet forward, then jump up with arms overhead.",
  },
  {
    name: "Stair Climber",
    category: "CARDIO" as const,
    muscleGroups: ["glutes", "quadriceps", "calves"],
    equipment: ["machine"],
    instructions: "Step at a steady pace. Keep your torso upright and don't lean on the handles.",
  },
  {
    name: "Elliptical",
    category: "CARDIO" as const,
    muscleGroups: ["full_body", "legs"],
    equipment: ["machine"],
    instructions:
      "Use a smooth, fluid motion. Push and pull the handles to engage your upper body.",
  },
  {
    name: "Sprint Intervals",
    category: "CARDIO" as const,
    muscleGroups: ["legs", "core"],
    equipment: ["treadmill", "bodyweight"],
    instructions:
      "Alternate between maximum effort sprints (20-30s) and rest periods (40-60s).",
  },

  // ─── FLEXIBILITY ─────────────────────────────────────────────────────────────
  {
    name: "Hamstring Stretch",
    category: "FLEXIBILITY" as const,
    muscleGroups: ["hamstrings"],
    equipment: ["mat", "bodyweight"],
    instructions:
      "Sit on the floor with legs extended. Reach toward your toes, keeping your back flat.",
  },
  {
    name: "Hip Flexor Stretch",
    category: "FLEXIBILITY" as const,
    muscleGroups: ["hip_flexors", "quadriceps"],
    equipment: ["mat", "bodyweight"],
    instructions:
      "Kneel on one knee in a lunge position. Push your hips forward until you feel a stretch in the front of the hip.",
  },
  {
    name: "Pigeon Pose",
    category: "FLEXIBILITY" as const,
    muscleGroups: ["glutes", "hip_flexors"],
    equipment: ["mat"],
    instructions:
      "From a plank, bring one knee forward and outside your hands. Lower your back leg flat and fold forward.",
  },
  {
    name: "Cat-Cow Stretch",
    category: "FLEXIBILITY" as const,
    muscleGroups: ["back", "core"],
    equipment: ["mat"],
    instructions:
      "On hands and knees, alternate arching your back (cat) and dropping your belly (cow) with your breath.",
  },
  {
    name: "World's Greatest Stretch",
    category: "FLEXIBILITY" as const,
    muscleGroups: ["full_body", "hip_flexors", "thoracic_spine"],
    equipment: ["mat", "bodyweight"],
    instructions:
      "Lunge forward, place the same-side hand on the floor, rotate opposite arm to the sky, then reverse.",
  },
  {
    name: "Shoulder Cross-Body Stretch",
    category: "FLEXIBILITY" as const,
    muscleGroups: ["shoulders", "rear_deltoid"],
    equipment: ["bodyweight"],
    instructions:
      "Pull one arm across your chest with the opposite hand. Hold 30 seconds each side.",
  },

  // ─── BALANCE ─────────────────────────────────────────────────────────────────
  {
    name: "Single-Leg Deadlift",
    category: "BALANCE" as const,
    muscleGroups: ["hamstrings", "glutes", "core"],
    equipment: ["dumbbell", "bodyweight"],
    instructions:
      "Stand on one leg. Hinge forward at the hip while extending the free leg behind you.",
  },
  {
    name: "Bosu Ball Squat",
    category: "BALANCE" as const,
    muscleGroups: ["quadriceps", "core", "glutes"],
    equipment: ["bodyweight"],
    instructions:
      "Stand on the flat side of a BOSU ball. Perform a squat while maintaining balance.",
  },
  {
    name: "Yoga Tree Pose",
    category: "BALANCE" as const,
    muscleGroups: ["core", "legs", "glutes"],
    equipment: ["bodyweight", "mat"],
    instructions:
      "Stand on one foot. Place the opposite foot against your calf or thigh. Bring hands to prayer position.",
  },
]

async function main() {
  console.log("Seeding exercises...")

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { id: `seed-${exercise.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}` },
      update: {
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment,
        instructions: exercise.instructions,
      },
      create: {
        id: `seed-${exercise.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`,
        name: exercise.name,
        category: exercise.category,
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment,
        instructions: exercise.instructions,
        isCustom: false,
        isPublic: true,
      },
    })
  }

  console.log(`Seeded ${exercises.length} exercises.`)

  // Demo user (upsert to avoid duplicate email error)
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@fitness-os.com" },
    update: { name: "Demo User" },
    create: {
      email: "demo@fitness-os.com",
      name: "Demo User",
    },
  })

  console.log(`Demo user: ${demoUser.email}`)

  // Seed a sample completed workout for the demo user
  const existingWorkout = await prisma.workout.findFirst({
    where: { userId: demoUser.id, name: "Demo Push Day" },
  })

  if (!existingWorkout) {
    const benchPress = await prisma.exercise.findFirst({
      where: { name: "Barbell Bench Press" },
    })
    const ohp = await prisma.exercise.findFirst({
      where: { name: "Overhead Press" },
    })

    if (benchPress && ohp) {
      await prisma.workout.create({
        data: {
          userId: demoUser.id,
          name: "Demo Push Day",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: "COMPLETED",
          duration: 55,
          totalVolume: 4500,
          exercises: {
            create: [
              {
                exerciseId: benchPress.id,
                order: 0,
                restTime: 120,
                sets: {
                  create: [
                    { setNumber: 1, reps: 8, weight: 80, isCompleted: true },
                    { setNumber: 2, reps: 8, weight: 80, isCompleted: true },
                    { setNumber: 3, reps: 6, weight: 85, isCompleted: true },
                  ],
                },
              },
              {
                exerciseId: ohp.id,
                order: 1,
                restTime: 90,
                sets: {
                  create: [
                    { setNumber: 1, reps: 10, weight: 50, isCompleted: true },
                    { setNumber: 2, reps: 10, weight: 50, isCompleted: true },
                    { setNumber: 3, reps: 8, weight: 55, isCompleted: true },
                  ],
                },
              },
            ],
          },
        },
      })
      console.log("Seeded demo workout.")
    }
  }

  console.log("Seed complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

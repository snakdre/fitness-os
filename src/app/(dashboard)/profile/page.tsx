"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateProfileSchema, createGoalSchema } from "@/lib/validations/profile"
import type { UpdateProfileInput, CreateGoalInput } from "@/lib/validations/profile"
import { User, Target, Plus, Trash2, Save, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Goal {
  id: string
  type: string
  description?: string | null
  targetWeight?: number | null
  targetDate?: string | null
  status: string
}

interface ProfileData {
  id: string
  name?: string | null
  email: string
  image?: string | null
  profile?: {
    age?: number | null
    gender?: string | null
    height?: number | null
    weight?: number | null
    activityLevel?: string
    bio?: string | null
    timezone?: string
    fitnessLevel?: string | null
  } | null
}

const activityLevels = [
  { value: "SEDENTARY", label: "Sedentary (little or no exercise)" },
  { value: "LIGHTLY_ACTIVE", label: "Lightly active (1-3 days/week)" },
  { value: "MODERATELY_ACTIVE", label: "Moderately active (3-5 days/week)" },
  { value: "VERY_ACTIVE", label: "Very active (6-7 days/week)" },
  { value: "EXTREMELY_ACTIVE", label: "Extremely active (twice/day)" },
]

const goalTypes = [
  { value: "WEIGHT_LOSS", label: "Weight Loss" },
  { value: "MUSCLE_GAIN", label: "Muscle Gain" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "ENDURANCE", label: "Endurance" },
  { value: "STRENGTH", label: "Strength" },
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [addingGoal, setAddingGoal] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
  })

  const {
    register: registerGoal,
    handleSubmit: handleGoalSubmit,
    reset: resetGoal,
    formState: { errors: goalErrors },
  } = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
  })

  useEffect(() => {
    async function load() {
      const [profileRes, goalsRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/goals"),
      ])
      if (profileRes.ok) {
        const json = await profileRes.json()
        setProfile(json.data)
        reset({
          age: json.data?.profile?.age ?? undefined,
          gender: json.data?.profile?.gender ?? undefined,
          height: json.data?.profile?.height ?? undefined,
          weight: json.data?.profile?.weight ?? undefined,
          activityLevel: json.data?.profile?.activityLevel ?? undefined,
          bio: json.data?.profile?.bio ?? undefined,
          timezone: json.data?.profile?.timezone ?? undefined,
          fitnessLevel: json.data?.profile?.fitnessLevel ?? undefined,
        })
      }
      if (goalsRes.ok) {
        const json = await goalsRes.json()
        setGoals(json.data ?? [])
      }
    }
    load()
  }, [reset])

  async function onSubmit(data: UpdateProfileInput) {
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  async function onGoalSubmit(data: CreateGoalInput) {
    setAddingGoal(true)
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const json = await res.json()
        setGoals((prev) => [json.data, ...prev])
        setShowGoalForm(false)
        resetGoal()
      }
    } finally {
      setAddingGoal(false)
    }
  }

  async function deleteGoal(id: string) {
    const res = await fetch(`/api/goals/${id}`, { method: "DELETE" })
    if (res.ok) {
      setGoals((prev) => prev.filter((g) => g.id !== id))
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Profile</h1>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar + Basic Info */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {profile?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{profile?.name}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Age</label>
              <input
                type="number"
                {...register("age", { valueAsNumber: true })}
                className="w-full bg-surface-2 border border-border-strong rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Gender</label>
              <select
                {...register("gender")}
                className="w-full bg-surface-2 border border-border-strong rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                {...register("height", { valueAsNumber: true })}
                className="w-full bg-surface-2 border border-border-strong rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
                placeholder="175"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                {...register("weight", { valueAsNumber: true })}
                className="w-full bg-surface-2 border border-border-strong rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
                placeholder="70"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Activity Level</label>
              <select
                {...register("activityLevel")}
                className="w-full bg-surface-2 border border-border-strong rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
              >
                <option value="">Select level</option>
                {activityLevels.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Fitness Level</label>
              <select
                {...register("fitnessLevel")}
                className="w-full bg-surface-2 border border-border-strong rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
              >
                <option value="">Select level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Timezone</label>
              <input
                type="text"
                {...register("timezone")}
                className="w-full bg-surface-2 border border-border-strong rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
                placeholder="UTC"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Bio</label>
              <textarea
                {...register("bio")}
                rows={3}
                className="w-full bg-surface-2 border border-border-strong rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500 resize-none"
                placeholder="Tell your AI coach about yourself..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors",
              saved
                ? "bg-green-600 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            )}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Goals Section */}
      <div id="goals" className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-400" />
            Goals
          </h2>
          <button
            onClick={() => setShowGoalForm(!showGoalForm)}
            className="flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        </div>

        {/* Add Goal Form */}
        {showGoalForm && (
          <form
            onSubmit={handleGoalSubmit(onGoalSubmit)}
            className="mb-4 p-4 bg-surface-2 rounded-lg space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Goal Type</label>
                <select
                  {...registerGoal("type")}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
                >
                  <option value="">Select type</option>
                  {goalTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {goalErrors.type && (
                  <p className="text-xs text-red-400 mt-1">{goalErrors.type.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Target Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...registerGoal("targetWeight", { valueAsNumber: true })}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Target Date</label>
                <input
                  type="date"
                  {...registerGoal("targetDate")}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Start Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...registerGoal("startWeight", { valueAsNumber: true })}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
                  placeholder="Optional"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <input
                  type="text"
                  {...registerGoal("description")}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowGoalForm(false); resetGoal() }}
                className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-surface-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingGoal}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
              >
                {addingGoal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Goal
              </button>
            </div>
          </form>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No goals yet. Add your first goal to get started!
          </p>
        ) : (
          <div className="space-y-2">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between p-3 bg-surface-2 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {goalTypes.find((t) => t.value === goal.type)?.label ?? goal.type}
                  </p>
                  {goal.description && (
                    <p className="text-xs text-muted-foreground truncate">{goal.description}</p>
                  )}
                  {goal.targetWeight && (
                    <p className="text-xs text-muted-foreground">Target: {goal.targetWeight}kg</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      goal.status === "ACTIVE"
                        ? "bg-green-500/10 text-green-400"
                        : goal.status === "COMPLETED"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-zinc-700 text-muted-foreground"
                    )}
                  >
                    {goal.status.toLowerCase()}
                  </span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

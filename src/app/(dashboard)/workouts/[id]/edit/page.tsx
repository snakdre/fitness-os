import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getWorkout } from "@/services/workout.service"
import { EditWorkoutClient } from "./edit-workout-client"

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const workout = await getWorkout(id, session.user.id)
  if (!workout) notFound()

  return <EditWorkoutClient workout={workout} />
}

import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your VYROX account and start your fitness journey",
}

export default function RegisterPage() {
  return <RegisterForm />
}

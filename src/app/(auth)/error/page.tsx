"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Server configuration error",
    description:
      "There is a problem with the server configuration. Please contact support.",
  },
  AccessDenied: {
    title: "Access denied",
    description:
      "You do not have permission to sign in with this account.",
  },
  Verification: {
    title: "Verification link expired",
    description:
      "The verification link has expired or has already been used. Please request a new one.",
  },
  OAuthSignin: {
    title: "OAuth sign-in error",
    description: "There was a problem signing in with this provider. Please try again.",
  },
  OAuthCallback: {
    title: "OAuth callback error",
    description:
      "There was a problem with the OAuth provider response. Please try again.",
  },
  OAuthCreateAccount: {
    title: "Account creation failed",
    description:
      "There was a problem creating your account. Please try again.",
  },
  EmailCreateAccount: {
    title: "Email account creation failed",
    description:
      "There was a problem creating your account with this email. Please try again.",
  },
  Callback: {
    title: "Sign-in callback error",
    description: "There was a problem during sign-in. Please try again.",
  },
  OAuthAccountNotLinked: {
    title: "Account not linked",
    description:
      "This email is already associated with another account. Please sign in using your original provider.",
  },
  EmailSignin: {
    title: "Email sign-in error",
    description:
      "There was a problem sending the email. Please check your email address and try again.",
  },
  CredentialsSignin: {
    title: "Invalid credentials",
    description: "The email or password you entered is incorrect. Please try again.",
  },
  SessionRequired: {
    title: "Sign in required",
    description: "You must be signed in to access this page.",
  },
  Default: {
    title: "Authentication error",
    description:
      "An unexpected error occurred during authentication. Please try again.",
  },
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get("error") ?? "Default"
  const errorInfo = errorMessages[errorCode] ?? errorMessages.Default

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 border border-red-900">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <CardTitle className="text-xl text-foreground">{errorInfo.title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {errorInfo.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorCode !== "Default" && (
          <p className="text-center text-xs text-muted-foreground">
            Error code:{" "}
            <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-muted-foreground">
              {errorCode}
            </code>
          </p>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button asChild className="w-full">
          <Link href="/login">Try signing in again</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/">Go home</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-foreground">Loading...</CardTitle>
          </CardHeader>
        </Card>
      }
    >
      <ErrorContent />
    </Suspense>
  )
}

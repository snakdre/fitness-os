import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: {
    template: "%s | VYROX",
    default: "Authentication | VYROX",
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/strong-man.png" alt="VYROX" width={32} height={32} />
          <span className="text-foreground font-bold text-lg tracking-tight">
            VYROX
          </span>
        </Link>
        <p className="text-xs text-muted-foreground hidden sm:block">
          Your Fitness OS
        </p>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} VYROX. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

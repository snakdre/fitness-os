import type { NextAuthConfig } from "next-auth"

// Edge-compatible auth config — no Node.js-only modules (no Prisma, no bcrypt)
// Used by middleware only. Full config with adapter is in auth.ts.
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      const isProtected =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/workouts") ||
        pathname.startsWith("/nutrition") ||
        pathname.startsWith("/ai-coach") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/body") ||
        pathname.startsWith("/supplements") ||
        pathname.startsWith("/shopping")

      const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register")

      if (isProtected && !isLoggedIn) return false
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? "USER"
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) ?? "USER"
      }
      return session
    },
  },
  providers: [], // providers are added in auth.ts
}

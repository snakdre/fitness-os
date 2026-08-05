import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { CapacitorInit } from "@/components/capacitor-init"
import { auth } from "@/lib/auth"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "VYROX — Your Fitness OS",
    template: "%s | VYROX",
  },
  description:
    "VYROX is an AI-powered fitness operating system for tracking workouts, nutrition, body measurements, and achieving your goals.",
  keywords: [
    "fitness",
    "workout tracker",
    "nutrition",
    "AI coach",
    "body measurements",
    "health",
  ],
  authors: [{ name: "VYROX" }],
  creator: "VYROX",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "VYROX — Your Fitness OS",
    description: "AI-powered fitness operating system",
    siteName: "VYROX",
  },
  twitter: {
    card: "summary_large_image",
    title: "VYROX — Your Fitness OS",
    description: "AI-powered fitness operating system",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VYROX",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        <Providers session={session}>
          <CapacitorInit />
          {children}
        </Providers>
      </body>
    </html>
  )
}

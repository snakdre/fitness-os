import Link from "next/link"
import Image from "next/image"
import {
  Dumbbell,
  Utensils,
  Bot,
  Activity,
  ArrowRight,
  ChevronRight,
  Star,
} from "lucide-react"

const features = [
  {
    icon: Dumbbell,
    title: "Workout Tracking",
    description:
      "Log exercises, sets, reps, and weights. Track your strength progress over time with beautiful charts.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Utensils,
    title: "Nutrition Monitoring",
    description:
      "Track meals, macros, and calories. Get personalized nutrition insights to fuel your performance.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Bot,
    title: "AI Coach",
    description:
      "Chat with your personal AI fitness expert powered by Claude. Get tailored advice, workout plans, and meal ideas.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: Activity,
    title: "Progress Analytics",
    description:
      "Visualize your transformation with body measurements, weight trends, and fitness score tracking.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
]

const testimonials = [
  {
    name: "Alex M.",
    role: "Competitive athlete",
    text: "VYROX transformed how I approach training. The AI coach gives better advice than most trainers I've worked with.",
  },
  {
    name: "Sarah K.",
    role: "Fitness beginner",
    text: "I finally have a system that works. The AI helps me understand nutrition and my progress is visible every week.",
  },
  {
    name: "James T.",
    role: "Bodybuilder",
    text: "The shopping list generator alone saves me hours every week. The whole platform is just premium.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 h-16 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2">
          <Image src="/strong-man.png" alt="VYROX" width={32} height={32} />
          <span className="font-bold text-lg text-foreground tracking-tight">VYROX</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-8 text-center overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Star className="w-3.5 h-3.5" fill="currentColor" />
            AI-powered fitness, reimagined
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground mb-6 leading-[1.1]">
            Your AI Fitness
            <br />
            <span className="text-orange-400">Operating System</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Track workouts, optimize nutrition, and get AI-powered coaching in one
            platform. VYROX turns your data into results.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-orange-500/20"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 bg-surface hover:bg-surface-2 border border-border-strong text-foreground font-semibold px-8 py-3.5 rounded-xl text-base transition-colors"
            >
              Sign In
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-4">No credit card required</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-8 bg-surface/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to reach your goals
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete fitness platform built with cutting-edge AI to personalize
              every aspect of your journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-surface rounded-2xl border border-border p-6 hover:border-border-strong transition-colors"
                >
                  <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* AI Coach highlight */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-orange-500/10 to-zinc-900 rounded-3xl border border-orange-500/20 p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-orange-400 text-sm font-semibold mb-4">
                <Bot className="w-4 h-4" />
                Powered by Claude AI
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Your personal fitness expert, available 24/7
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Ask anything about workouts, nutrition, recovery, or supplementation.
                The AI Coach knows your profile, goals, and history — giving you truly
                personalized guidance.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                Start chatting free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mock chat preview */}
            <div className="w-full lg:w-80 bg-surface rounded-2xl border border-border p-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 bg-zinc-700 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs text-foreground">U</span>
                </div>
                <div className="bg-zinc-700 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-foreground max-w-[85%]">
                  What should I eat before my workout?
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-foreground" />
                </div>
                <div className="bg-surface-2 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-foreground max-w-[85%]">
                  For your muscle gain goal, aim for 20-40g protein + 30-60g carbs 1-2 hours before. Try oatmeal with a protein shake.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-8 bg-surface/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-10">
            Trusted by athletes and beginners alike
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-surface rounded-xl border border-border p-5"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-orange-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-foreground text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to transform your fitness?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join thousands of athletes using VYROX to hit their goals faster.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl text-base transition-colors shadow-xl shadow-orange-500/20"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/strong-man.png" alt="VYROX" width={24} height={24} />
            <span className="font-bold text-sm text-muted-foreground">VYROX</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} VYROX. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-muted-foreground">Privacy</Link>
            <Link href="#" className="hover:text-muted-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

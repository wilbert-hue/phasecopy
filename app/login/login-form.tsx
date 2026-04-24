"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { AnimatedNoise } from "@/components/animated-noise"

type LoginFormProps = { returnTo: string }

function isSafeReturnTo(r: string): boolean {
  return r.startsWith("/") && !r.startsWith("//")
}

export function LoginForm({ returnTo: defaultReturnTo }: LoginFormProps) {
  const router = useRouter()
  const sp = useSearchParams()
  const fromQuery = sp.get("returnTo")
  const returnTo = fromQuery && isSafeReturnTo(fromQuery) ? fromQuery : defaultReturnTo
  const demoEnded = sp.get("reason") === "demo_ended"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        setError(
          j.error ?? (res.status === 401 ? "Invalid email or password" : "Sign in failed"),
        )
        return
      }
      router.push(returnTo)
      router.refresh()
    } catch {
      setError("Network error")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <AnimatedNoise opacity={0.03} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 20%, rgba(27, 73, 101, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 90%, rgba(58, 175, 169, 0.06) 0%, transparent 50%)
          `,
        }}
      />
      <div
        className="absolute left-0 top-[15%] w-[2px] h-[35%] opacity-40"
        style={{
          background: "linear-gradient(to bottom, transparent, #1B4965, #2A8F9C, #4FBDBA, transparent)",
        }}
      />
      <div className="grid-bg fixed inset-0 -z-10 opacity-20" aria-hidden />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>

        <h1
          className="font-[var(--font-bebas)] text-[clamp(1.5rem,4vw,2.5rem)] tracking-wider"
          style={{ color: "#1E6080" }}
        >
          Dashboard access
        </h1>
        {demoEnded && (
          <p className="mt-3 font-mono text-sm text-amber-800 bg-amber-100/80 border border-amber-200 px-3 py-2 max-w-prose">
            The demo time window is over, so the dashboard is closed. The configured demo email and password are no
            longer accepted. Update the demo dates in the server config if you need a new window.
          </p>
        )}
        <p className="mt-3 font-mono text-sm text-muted-foreground max-w-prose">
          Use the demo <code className="text-foreground/90">DASHBOARD_DEMO_EMAIL</code> and{" "}
          <code className="text-foreground/90">DASHBOARD_PASSWORD</code> from{" "}
          <code className="text-foreground/90">.env.local</code>. They are accepted for 11 days after{" "}
          <code className="text-foreground/90">DASHBOARD_DEMO_START_AT</code>—not on a per–sign-in timer.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <div>
            <label htmlFor="dash-email" className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
              Email
            </label>
            <input
              id="dash-email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-border bg-background/80 px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#2A8F9C]/50 focus:border-[#2A8F9C]"
              disabled={pending}
            />
          </div>
          <div>
            <label htmlFor="dash-password" className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
              Password
            </label>
            <input
              id="dash-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-border bg-background/80 px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#2A8F9C]/50 focus:border-[#2A8F9C]"
              disabled={pending}
            />
          </div>
          {error && <p className="font-mono text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={pending || !email || !password}
            className="inline-flex w-full items-center justify-center gap-2 px-4 py-3 font-mono text-xs uppercase tracking-widest text-white transition-all disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #1B4965, #1E6080)",
              border: "1px solid rgba(42, 143, 156, 0.3)",
            }}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  )
}

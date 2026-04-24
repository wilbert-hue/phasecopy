import { NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { createSessionToken, getSessionSecret } from "@/lib/session"
import { SESSION_COOKIE_NAME } from "@/lib/session-constants"
import {
  getDemoNotAfterSec,
  isDemoAccessActive,
  secondsLeftInDemoWindow,
} from "@/lib/demo-window"

function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const ba = Buffer.from(a, "utf8")
  const bb = Buffer.from(b, "utf8")
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

function normalizeEmail(s: string): string {
  return s.trim().toLowerCase()
}

export async function POST(request: Request) {
  const expectedEmail = process.env.DASHBOARD_DEMO_EMAIL?.trim()
  const expectedPassword = process.env.DASHBOARD_PASSWORD
  const secret = getSessionSecret()
  if (!expectedEmail || !expectedPassword || !secret) {
    return NextResponse.json(
      {
        error:
          "Sign-in is not configured on the server. Add DASHBOARD_DEMO_EMAIL, DASHBOARD_PASSWORD, and DASHBOARD_SESSION_SECRET in your project environment, then redeploy. On Vercel: Project → Settings → Environment Variables.",
      },
      { status: 503 },
    )
  }

  const notAfterSec = getDemoNotAfterSec()
  if (notAfterSec == null) {
    return NextResponse.json(
      {
        error:
          "Set DASHBOARD_DEMO_START_AT in your project environment to an ISO-8601 time (e.g. 2026-01-15T00:00:00.000Z), then redeploy. On Vercel: Settings → Environment Variables.",
      },
      { status: 503 },
    )
  }
  if (!isDemoAccessActive()) {
    return NextResponse.json(
      {
        error:
          "The 11-day demo sign-in period has ended. The configured email and password are no longer accepted.",
      },
      { status: 403 },
    )
  }

  let body: { email?: string; password?: string } = {}
  try {
    body = (await request.json()) as { email?: string; password?: string }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const email = typeof body.email === "string" ? body.email : ""
  const password = body.password ?? ""
  const emailMatch = secureCompare(normalizeEmail(email), normalizeEmail(expectedEmail))
  if (!emailMatch) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }
  if (!secureCompare(password, expectedPassword)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  const token = createSessionToken(secret, expectedEmail, notAfterSec)
  const maxAge = Math.max(1, secondsLeftInDemoWindow())
  const res = NextResponse.json({ ok: true, demoEndsAt: notAfterSec * 1000 })
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production",
  })
  return res
}

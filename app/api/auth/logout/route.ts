import { NextResponse } from "next/server"
import { SESSION_COOKIE_NAME } from "@/lib/session-constants"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  })
  return res
}

export async function GET(request: Request) {
  const res = NextResponse.redirect(new URL("/", request.url), 307)
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  })
  return res
}

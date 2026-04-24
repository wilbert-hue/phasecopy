import { NextResponse, type NextRequest } from "next/server"
import { verifySessionTokenEdge } from "@/lib/session-edge"
import { SESSION_COOKIE_NAME } from "@/lib/session-constants"

function redirectWithoutLegacyClerkParams(request: NextRequest): NextResponse | null {
  const u = request.nextUrl.clone()
  let changed = false
  for (const key of [...u.searchParams.keys()]) {
    if (key.startsWith("__clerk")) {
      u.searchParams.delete(key)
      changed = true
    }
  }
  if (!changed) return null
  const path = u.pathname + (u.searchParams.toString() ? `?${u.searchParams}` : "") + u.hash
  return NextResponse.redirect(new URL(path, request.url), 307)
}

export async function proxy(request: NextRequest) {
  const clean = redirectWithoutLegacyClerkParams(request)
  if (clean) return clean

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const secret = process.env.DASHBOARD_SESSION_SECRET?.trim()
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const ok = secret && token && (await verifySessionTokenEdge(token, secret))
    if (!ok) {
      const login = new URL("/login", request.url)
      const back = request.nextUrl.pathname + request.nextUrl.search
      login.searchParams.set("returnTo", back)
      return NextResponse.redirect(login)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
}

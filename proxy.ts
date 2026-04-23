import { NextResponse } from "next/server"
import { DomainResolutionError } from "@auth0/nextjs-auth0/errors"
import { auth0 } from "./lib/auth0"

/** Old Clerk dev URLs (?__clerk…) can linger in bookmarks/history; strip so Auth0-only app stays clean. */
function redirectWithoutLegacyClerkParams(request: Request): NextResponse | null {
  const url = new URL(request.url)
  let changed = false
  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith("__clerk")) {
      url.searchParams.delete(key)
      changed = true
    }
  }
  if (!changed) return null
  const path = url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : "") + url.hash
  return NextResponse.redirect(new URL(path, url.origin), 307)
}

export async function proxy(request: Request) {
  const clean = redirectWithoutLegacyClerkParams(request)
  if (clean) return clean

  try {
    return await auth0.middleware(request)  } catch (e) {
    if (e instanceof DomainResolutionError) {
      const cause = e.cause instanceof Error ? e.cause.message : e.cause
      console.error(
        "[auth0] DomainResolutionError:",
        e.message,
        cause != null ? `\n  Cause: ${cause}` : "",
        "\n  Fix: set AUTH0_DOMAIN (e.g. dev-abc.us.auth0.com) or AUTH0_ISSUER_BASE_URL in .env.local, then restart `next dev`.",
      )
    }
    throw e
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}

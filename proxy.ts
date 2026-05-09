import { NextResponse, type NextRequest } from "next/server"

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
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
}

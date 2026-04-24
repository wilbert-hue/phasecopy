import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getSessionSecret, verifySessionToken } from "@/lib/session"
import { SESSION_COOKIE_NAME } from "@/lib/session-constants"
import { LoginForm } from "./login-form"

type SearchParams = { returnTo?: string | string[] }

function normalizeReturnTo(raw: string | undefined): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard"
  }
  return raw
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const r = Array.isArray(sp.returnTo) ? sp.returnTo[0] : sp.returnTo
  const returnTo = normalizeReturnTo(r)
  const secret = getSessionSecret()
  if (secret) {
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value
    if (verifySessionToken(token, secret)) {
      redirect(returnTo)
    }
  }
  return <LoginForm returnTo={returnTo} />
}

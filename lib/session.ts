import { createHmac, timingSafeEqual } from "node:crypto"

export { SESSION_COOKIE_NAME } from "@/lib/session-constants"

/** Secret for HMAC session cookie. Set in `.env.local` (not committed). */
export function getSessionSecret(): string | undefined {
  return process.env.DASHBOARD_SESSION_SECRET?.trim() || undefined
}

type SessionPayloadV1 = { v: 1; exp: number; em: string }

/**
 * Signed token: base64url(JSON payload) + "." + hex(HMAC-SHA256 of base64 part)).
 * `exp` is Unix seconds when the **demo access window** ends (same for all users).
 * Session and dashboard access are invalid when `now >= exp`.
 */
export function createSessionToken(
  secret: string,
  email: string,
  sessionExpSec: number,
): string {
  const payload: SessionPayloadV1 = { v: 1, exp: sessionExpSec, em: email.trim().toLowerCase() }
  const json = JSON.stringify(payload)
  const payloadB64 = Buffer.from(json, "utf8").toString("base64url")
  const sig = createHmac("sha256", secret).update(payloadB64, "utf8").digest("hex")
  return `${payloadB64}.${sig}`
}

export function verifySessionToken(
  token: string | undefined,
  secret: string | undefined,
): boolean {
  if (!token || !secret) return false
  return verifyTokenPayload(token, secret) !== null
}

/** Returns parsed email if valid and not expired; else null. */
export function verifyTokenPayload(
  token: string,
  secret: string,
): { email: string } | null {
  const last = token.lastIndexOf(".")
  if (last <= 0) return null
  const payloadB64 = token.slice(0, last)
  const sig = token.slice(last + 1)
  if (sig.length !== 64 || !/^[0-9a-f]+$/i.test(sig)) return null
  const expected = createHmac("sha256", secret).update(payloadB64, "utf8").digest("hex")
  if (expected.length !== sig.length) return null
  if (!timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(sig, "utf8"))) {
    return null
  }
  let payload: SessionPayloadV1
  try {
    const json = Buffer.from(payloadB64, "base64url").toString("utf8")
    payload = JSON.parse(json) as SessionPayloadV1
  } catch {
    return null
  }
  if (payload.v !== 1 || typeof payload.exp !== "number" || typeof payload.em !== "string") {
    return null
  }
  if (!payload.em) return null
  const now = Math.floor(Date.now() / 1000)
  if (now >= payload.exp) return null
  return { email: payload.em }
}

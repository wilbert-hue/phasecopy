/** Eleven days in ms — demo email/password are valid for this long after DASHBOARD_DEMO_START_AT. */
export const DEMO_ACCESS_DURATION_MS = 11 * 24 * 60 * 60 * 1000

/**
 * `DASHBOARD_DEMO_START_AT` — ISO-8601 instant when the demo access window starts.
 * Access ends at start + 11 days (not rolling from sign-in).
 */
export function getDemoNotAfterMs(): number | null {
  const s = process.env.DASHBOARD_DEMO_START_AT?.trim()
  if (!s) return null
  const t = Date.parse(s)
  if (Number.isNaN(t)) return null
  return t + DEMO_ACCESS_DURATION_MS
}

export function getDemoNotAfterSec(): number | null {
  const m = getDemoNotAfterMs()
  if (m == null) return null
  return Math.floor(m / 1000)
}

export function isDemoAccessActive(): boolean {
  const end = getDemoNotAfterMs()
  if (end == null) return false
  return Date.now() < end
}

/** Seconds from now until the demo window ends (0 if over). */
export function secondsLeftInDemoWindow(): number {
  const end = getDemoNotAfterMs()
  if (end == null) return 0
  return Math.max(0, Math.floor((end - Date.now()) / 1000))
}

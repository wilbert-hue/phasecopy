import { Auth0Client } from "@auth0/nextjs-auth0/server"

/**
 * `AUTH0_SECRET` is not shown in the Auth0 dashboard — it is a long random string
 * *you* generate so the SDK can encrypt the session cookie. If it is empty, crypto
 * fails with: `"ikm" must be at least one byte in length`.
 *
 * Generate one (64 hex chars = 32 bytes):
 * - macOS/Linux: `openssl rand -hex 32`
 * - Node (any OS): `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
 */
function requireAuth0Secret(): string {
  const secret = process.env.AUTH0_SECRET?.trim()
  if (!secret) {
    throw new Error(
      "AUTH0_SECRET is missing or empty in .env.local. It is not from Auth0—generate a random secret " +
        "(e.g. `openssl rand -hex 32`, or run Node: randomBytes(32).toString('hex')).",
    )
  }
  return secret
}

/**
 * v4 reads `AUTH0_DOMAIN` (hostname only, e.g. `dev-abc.us.auth0.com`).
 * If it is missing at module load, the SDK falls back to a lazy "resolver" that
 * throws at request time — Next surfaces that as `DomainResolutionError`
 * ("Domain resolver threw an error") even when the cause is simply a missing domain.
 *
 * We also accept `AUTH0_ISSUER_BASE_URL` (https://…/) from older Auth0 / quickstarts.
 */
function resolveAuth0Domain(): string | undefined {
  const direct = process.env.AUTH0_DOMAIN?.trim()
  if (direct) return direct

  const issuer = process.env.AUTH0_ISSUER_BASE_URL?.trim()
  if (!issuer) return undefined

  try {
    const url = issuer.includes("://") ? new URL(issuer) : new URL(`https://${issuer}`)
    return url.hostname || undefined
  } catch {
    return undefined
  }
}

const domain = resolveAuth0Domain()

export const auth0 = new Auth0Client({
  secret: requireAuth0Secret(),
  // Passing a string forces static domain mode (no lazy resolver).
  ...(domain ? { domain } : {}),
  signInReturnToPath: "/dashboard",
})

function base64UrlToJson(s: string): string {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/")
  const m = 4 - (pad.length % 4)
  const padded = m === 4 ? pad : pad + "=".repeat(m)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let j = 0; j < binary.length; j++) {
    bytes[j] = binary.charCodeAt(j)
  }
  return new TextDecoder().decode(bytes)
}

/**
 * Verifies HMAC, expiry, and v1 payload (same contract as `verifyTokenPayload` in `lib/session.ts`).
 */
export async function verifySessionTokenEdge(
  token: string,
  secret: string,
): Promise<boolean> {
  const last = token.lastIndexOf(".")
  if (last <= 0) return false
  const payloadB64 = token.slice(0, last)
  const sigHex = token.slice(last + 1)
  if (sigHex.length !== 64 || !/^[0-9a-f]+$/i.test(sigHex)) return false
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const expectedSig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64)),
  )
  const expectedHex = [...expectedSig].map(b => b.toString(16).padStart(2, "0")).join("")
  if (expectedHex.length !== sigHex.length) return false
  let diff = 0
  for (let i = 0; i < sigHex.length; i++) {
    diff |= sigHex.charCodeAt(i) ^ expectedHex.charCodeAt(i)
  }
  if (diff !== 0) return false
  type Payload = { v?: number; exp?: number; em?: string }
  let payload: Payload
  try {
    payload = JSON.parse(base64UrlToJson(payloadB64)) as Payload
  } catch {
    return false
  }
  if (payload.v !== 1 || typeof payload.exp !== "number" || typeof payload.em !== "string" || !payload.em) {
    return false
  }
  const now = Math.floor(Date.now() / 1000)
  if (now >= payload.exp) return false
  return true
}

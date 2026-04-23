/**
 * Auth0 SDK mounts `/auth/login`; query params are forwarded to `/authorize` (except `returnTo`).
 *
 * - `screen_hint=signup` — New Universal Login: open sign-up instead of sign-in.
 * - `prompt=login` — do not silently reuse an existing Auth0 session; without this, users
 *   often see only “Authorize app” / consent instead of the registration screen.
 */
export const AUTH0_LOGIN_HREF = "/auth/login"
export const AUTH0_SIGNUP_HREF = "/auth/login?screen_hint=signup&prompt=login"

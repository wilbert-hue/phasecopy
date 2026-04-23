import { redirect } from "next/navigation"
import { AUTH0_SIGNUP_HREF } from "@/lib/auth0-routes"

export default function SignUpPage() {
  redirect(AUTH0_SIGNUP_HREF)
}
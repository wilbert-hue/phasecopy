import type React from "react"
import { getDemoNotAfterMs } from "@/lib/demo-window"
import { DemoCountdown } from "./demo-countdown"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const notAfterMs = getDemoNotAfterMs()
  return (
    <div className="font-mono text-[15px] sm:text-[16px] antialiased leading-relaxed">
      {notAfterMs != null && <DemoCountdown notAfterMs={notAfterMs} />}
      {children}
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"

function formatLeft(ms: number) {
  if (ms <= 0) return { line: "0d 0h 0m 0s", done: true as const }
  const totalS = Math.floor(ms / 1000)
  const s = totalS % 60
  const m = Math.floor(totalS / 60) % 60
  const h = Math.floor(totalS / 3600) % 24
  const d = Math.floor(totalS / 86400)
  return {
    line: `${d}d ${h}h ${m}m ${s}s`,
    done: false as const,
  }
}

type Props = { notAfterMs: number }

export function DemoCountdown({ notAfterMs }: Props) {
  const router = useRouter()
  const endedRef = useRef(false)
  const [label, setLabel] = useState(() => formatLeft(notAfterMs - Date.now()).line)
  const [expired, setExpired] = useState(() => notAfterMs <= Date.now())

  const onExpire = useCallback(() => {
    if (endedRef.current) return
    endedRef.current = true
    setExpired(true)
    void fetch("/api/auth/logout", { method: "POST" })
    router.replace("/login?returnTo=%2Fdashboard&reason=demo_ended")
  }, [router])

  useEffect(() => {
    if (notAfterMs <= Date.now()) {
      onExpire()
      return
    }
    const t = setInterval(() => {
      const left = notAfterMs - Date.now()
      setLabel(formatLeft(left).line)
      if (left <= 0) {
        clearInterval(t)
        onExpire()
      }
    }, 1000)
    return () => clearInterval(t)
  }, [notAfterMs, onExpire])

  if (expired) {
    return (
      <div
        className="border-b border-[#c45c5c]/40 bg-[#f8e8e8] px-4 py-2 text-center font-mono text-[12px] uppercase tracking-widest"
        style={{ color: "#7a1f1f" }}
      >
        Demo access has ended. Redirecting…
      </div>
    )
  }

  return (
    <div
      className="border-b border-[rgba(42,143,156,0.4)] z-[60] relative"
      style={{
        background: "linear-gradient(90deg, rgba(27, 73, 101, 0.08) 0%, rgba(42, 143, 156, 0.12) 50%, rgba(27, 73, 101, 0.08) 100%)",
      }}
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-center">
        <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "#1B4965" }}>
          Demo access time remaining
        </span>
        <span
          className="font-mono text-sm tabular-nums font-medium tracking-tight"
          style={{ color: "#1E6080" }}
          aria-live="polite"
        >
          {label}
        </span>
      </div>
    </div>
  )
}

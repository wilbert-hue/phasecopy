"use client"

import { useMemo } from "react"
import type { Trial } from "@/app/dashboard/page"
import { Activity, Users, Clock, Beaker, Pill, DollarSign } from "lucide-react"

interface KPICardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
}

function KPICard({ label, value, sub, icon }: KPICardProps) {
  return (
    <div className="border border-border bg-background/60 backdrop-blur-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="text-muted-foreground/50">{icon}</span>
      </div>
      <div>
        <p className="font-[var(--font-bebas)] text-3xl tracking-wider">{value}</p>
        {sub && (
          <p className="font-mono text-[10px] text-muted-foreground mt-1">{sub}</p>
        )}
      </div>
    </div>
  )
}

export function DashboardKPIs({ trials }: { trials: Trial[] }) {
  const stats = useMemo(() => {
    const totalEnrollment = trials.reduce((s, t) => s + (t.enrollment || 0), 0)
    const avgDuration = trials.length
      ? (trials.reduce((s, t) => s + (t.durationYears || 0), 0) / trials.length).toFixed(1)
      : "0"
    const uniqueMolecules = new Set(trials.map(t => t.molecule).filter(Boolean)).size
    const uniqueIndications = new Set(trials.map(t => t.indication).filter(Boolean)).size
    const avgAdherence = trials.filter(t => t.adherenceRate != null)
    const adherence = avgAdherence.length
      ? (avgAdherence.reduce((s, t) => s + t.adherenceRate!, 0) / avgAdherence.length).toFixed(1)
      : "N/A"
    const priceTrials = trials.filter(t => t.drugPrice)
    const avgPrice = priceTrials.length
      ? (priceTrials.reduce((s, t) => {
          const p = parseFloat(t.drugPrice.replace(/[$,]/g, ""))
          return s + (isNaN(p) ? 0 : p)
        }, 0) / priceTrials.length).toFixed(0)
      : "N/A"

    return { totalEnrollment, avgDuration, uniqueMolecules, uniqueIndications, adherence, avgPrice }
  }, [trials])

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <KPICard
        label="Total Trials"
        value={trials.length.toLocaleString()}
        sub="Filtered results"
        icon={<Activity className="h-4 w-4" />}
      />
      <KPICard
        label="Total Enrollment"
        value={stats.totalEnrollment.toLocaleString()}
        sub="Participants across trials"
        icon={<Users className="h-4 w-4" />}
      />
      <KPICard
        label="Avg Duration"
        value={`${stats.avgDuration} yr`}
        sub="Mean trial duration"
        icon={<Clock className="h-4 w-4" />}
      />
      <KPICard
        label="Molecules"
        value={stats.uniqueMolecules.toLocaleString()}
        sub="Unique compounds"
        icon={<Beaker className="h-4 w-4" />}
      />
      <KPICard
        label="Avg Adherence"
        value={stats.adherence === "N/A" ? "N/A" : `${stats.adherence}%`}
        sub="Patient compliance"
        icon={<Pill className="h-4 w-4" />}
      />
      <KPICard
        label="Avg Drug Price"
        value={stats.avgPrice === "N/A" ? "N/A" : `$${Number(stats.avgPrice).toLocaleString()}`}
        sub="Average per dose"
        icon={<DollarSign className="h-4 w-4" />}
      />
    </div>
  )
}

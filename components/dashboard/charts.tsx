"use client"

import { useMemo } from "react"
import type { Trial } from "@/app/dashboard/page"
import { normalizePhase } from "@/app/dashboard/page"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from "recharts"

const COLORS = [
  "#1B4965", "#1E6080", "#2A8F9C", "#3AAFA9", "#4FBDBA",
  "#266B80", "#34969E", "#48B5AD", "#1A5276", "#2E8B8B",
]

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-background/60 backdrop-blur-sm p-5">
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
        {title}
      </h3>
      {children}
    </div>
  )
}

const customTooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.95)",
  border: "1px solid #e0e0e0",
  borderRadius: 0,
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "11px",
  padding: "8px 12px",
}

export function DashboardCharts({ trials }: { trials: Trial[] }) {
  const phaseData = useMemo(() => {
    const map = new Map<string, number>()
    trials.forEach(t => {
      const p = normalizePhase(t.phase)
      map.set(p, (map.get(p) || 0) + 1)
    })
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [trials])

  const techData = useMemo(() => {
    const map = new Map<string, number>()
    trials.forEach(t => {
      if (t.technology) map.set(t.technology, (map.get(t.technology) || 0) + 1)
    })
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name: name.length > 25 ? name.slice(0, 22) + "..." : name, value, fullName: name }))
  }, [trials])

  const enrollmentByPhase = useMemo(() => {
    const map = new Map<string, number>()
    trials.forEach(t => {
      const p = normalizePhase(t.phase)
      map.set(p, (map.get(p) || 0) + (t.enrollment || 0))
    })
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [trials])

  const timelineData = useMemo(() => {
    const map = new Map<string, number>()
    trials.forEach(t => {
      if (t.startDate) {
        const year = t.startDate.slice(0, 4)
        if (year && !isNaN(Number(year))) {
          map.set(year, (map.get(year) || 0) + 1)
        }
      }
    })
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([year, count]) => ({ year, count }))
  }, [trials])

  const topIndications = useMemo(() => {
    const map = new Map<string, number>()
    trials.forEach(t => {
      if (t.indication) map.set(t.indication, (map.get(t.indication) || 0) + 1)
    })
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({
        name: name.length > 30 ? name.slice(0, 27) + "..." : name.charAt(0) + name.slice(1).toLowerCase(),
        value,
        fullName: name,
      }))
  }, [trials])

  const routeData = useMemo(() => {
    const map = new Map<string, number>()
    trials.forEach(t => {
      if (t.routeOfAdmin) {
        const primary = t.routeOfAdmin.split(",")[0].trim()
        if (primary) map.set(primary, (map.get(primary) || 0) + 1)
      }
    })
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }))
  }, [trials])

  if (trials.length === 0) {
    return (
      <div className="border border-border p-12 text-center">
        <p className="font-mono text-sm text-muted-foreground">No trials match the current filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Phase Distribution */}
      <ChartCard title="Trials by Phase">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={phaseData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {phaseData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend
                wrapperStyle={{ fontFamily: "var(--font-mono, monospace)", fontSize: "10px" }}
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Technology Breakdown */}
      <ChartCard title="Top Technologies">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={techData} layout="vertical" margin={{ left: 10, right: 16, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)" }} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 9, fontFamily: "var(--font-mono, monospace)" }}
              />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="value" fill="#1B4965" barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Enrollment by Phase */}
      <ChartCard title="Enrollment by Phase">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enrollmentByPhase} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fontFamily: "var(--font-mono, monospace)" }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)" }} />
              <Tooltip contentStyle={customTooltipStyle} formatter={(v: number) => v.toLocaleString()} />
              <Bar dataKey="value" fill="#2A8F9C" barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Timeline */}
      <ChartCard title="Trials Started Over Time">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 9, fontFamily: "var(--font-mono, monospace)" }} />
              <YAxis tick={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)" }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#1E6080"
                fill="#1E6080"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Top Indications */}
      <ChartCard title="Top Indications">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topIndications} layout="vertical" margin={{ left: 10, right: 16, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)" }} />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 9, fontFamily: "var(--font-mono, monospace)" }}
              />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="value" fill="#3AAFA9" barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Route of Administration */}
      <ChartCard title="Route of Administration">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={routeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {routeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend
                wrapperStyle={{ fontFamily: "var(--font-mono, monospace)", fontSize: "10px" }}
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  )
}

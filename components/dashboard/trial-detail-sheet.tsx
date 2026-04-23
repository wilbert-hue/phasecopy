"use client"

import type { Trial } from "@/app/dashboard/page"
import { normalizePhase } from "@/app/dashboard/page"
import {
  X,
  FlaskConical,
  Users,
  Calendar,
  Activity,
  Pill,
  Target,
  DollarSign,
  MapPin,
  Clock,
  TrendingUp,
  Beaker,
  Stethoscope,
  Building2,
  LineChart,
} from "lucide-react"
import { useEffect } from "react"

interface TrialDetailSheetProps {
  trial: Trial | null
  onClose: () => void
}

function Field({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  if (!value || value === "—") return null
  return (
    <div className="py-2.5">
      <dt className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </dt>
      <dd className="font-mono text-xs leading-relaxed text-foreground/90">{value}</dd>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <div
      className="relative rounded-lg border border-border/60 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${accent}0d 0%, transparent 60%)`,
      }}
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <div
          className="flex items-center justify-center w-7 h-7 rounded"
          style={{ background: `${accent}1a`, color: accent }}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <h3 className="font-[var(--font-bebas)] text-base tracking-widest" style={{ color: accent }}>
          {title}
        </h3>
      </div>
      <div className="px-4 pb-3 divide-y divide-border/40">{children}</div>
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  accent: string
}) {
  return (
    <div
      className="relative rounded-lg border border-border/60 p-3 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${accent}14 0%, transparent 100%)`,
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-[2px]"
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
      />
      <div className="flex items-center gap-2 mb-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" style={{ color: accent }} />
        <span className="font-mono text-[9px] uppercase tracking-widest">{label}</span>
      </div>
      <div className="font-[var(--font-bebas)] text-2xl tracking-wide leading-none" style={{ color: accent }}>
        {value}
      </div>
    </div>
  )
}

export function TrialDetailSheet({ trial, onClose }: TrialDetailSheetProps) {
  useEffect(() => {
    if (!trial) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [trial, onClose])

  if (!trial) return null

  const priceVal = trial.drugPrice?.replace(/[$,]/g, "")
  const priceNum = priceVal ? parseFloat(priceVal) : null

  // Accent palette
  const C = {
    primary: "#1B4965",
    deep: "#1E6080",
    teal: "#2A8F9C",
    mint: "#3AAFA9",
    accent: "#4FBDBA",
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed inset-y-0 right-0 z-[70] w-full max-w-xl bg-background border-l border-border overflow-y-auto overscroll-contain"
        onWheel={e => e.stopPropagation()}
      >
        {/* Hero header with gradient */}
        <div
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.deep} 50%, ${C.teal} 100%)`,
          }}
        >
          {/* Diagonal texture */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, #fff 0, #fff 1px, transparent 1px, transparent 12px)",
            }}
          />
          {/* Glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(50% 60% at 80% 20%, rgba(79,189,186,0.35), transparent 70%)",
            }}
          />

          <div className="relative px-6 pt-5 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/70">
                  Trial Detail
                </span>
                <h2 className="font-[var(--font-bebas)] text-3xl tracking-wider text-white mt-0.5">
                  {trial.nctId}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded border border-white/25 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Molecule highlight */}
            {trial.molecule && (
              <div className="mb-4">
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/60">
                  Molecule
                </span>
                <div className="font-[var(--font-bebas)] text-xl tracking-wide text-white">
                  {trial.molecule}
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/95 text-[#1B4965] px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider font-semibold">
                <Activity className="h-3 w-3" />
                {normalizePhase(trial.phase)}
              </span>
              {trial.technology && trial.technology.toLowerCase() !== "not specified" && (
                <span className="rounded-full bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider border border-white/20">
                  <span className="opacity-60 mr-1">Tech:</span>
                  {trial.technology}
                </span>
              )}
              {trial.biologicType && trial.biologicType.toLowerCase() !== "not specified" && (
                <span className="rounded-full bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider border border-white/20">
                  <span className="opacity-60 mr-1">Type:</span>
                  {trial.biologicType}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5">
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {trial.enrollment ? (
              <KpiCard
                icon={Users}
                label="Enrollment"
                value={
                  trial.enrollment >= 1000
                    ? `${(trial.enrollment / 1000).toFixed(1)}K`
                    : trial.enrollment.toLocaleString()
                }
                accent={C.primary}
              />
            ) : null}
            {trial.durationYears ? (
              <KpiCard
                icon={Clock}
                label="Duration"
                value={`${trial.durationYears}y`}
                accent={C.deep}
              />
            ) : null}
            {trial.arms ? (
              <KpiCard icon={FlaskConical} label="Arms" value={String(trial.arms)} accent={C.teal} />
            ) : null}
            {trial.adherenceRate != null ? (
              <KpiCard
                icon={TrendingUp}
                label="Adherence"
                value={`${trial.adherenceRate}%`}
                accent={C.mint}
              />
            ) : null}
          </div>

          {/* Therapeutic Profile */}
          <Section icon={Stethoscope} title="Therapeutic Profile" accent={C.primary}>
            <Field label="Approved Biologics" value={trial.approvedBiologics} />
            <Field
              label="Indication"
              value={
                trial.indication
                  ? trial.indication.charAt(0) + trial.indication.slice(1).toLowerCase()
                  : null
              }
            />
            <Field label="Disease Condition" value={trial.diseaseCondition} />
            <Field label="Pharmacological Class" value={trial.pharmClass} />
          </Section>

          {/* Market forecast (US$ Mn) */}
          <Section icon={LineChart} title="Market Forecast" accent={C.teal}>
            <Field label="2023 (US$ Mn)" value={trial.marketForecast2023} />
            <Field label="2024 (US$ Mn)" value={trial.marketForecast2024} />
            <Field label="2025 (US$ Mn)" value={trial.marketForecast2025} />
            <Field label="2026 (US$ Mn)" value={trial.marketForecast2026} />
            <Field label="2027 (US$ Mn)" value={trial.marketForecast2027} />
          </Section>

          {/* Trial Design */}
          <Section icon={Beaker} title="Trial Design & Dosing" accent={C.deep}>
            <Field label="Trial Design" value={trial.trialDesign} />
            <Field label="Route of Administration" value={trial.routeOfAdmin} />
            <Field label="Administration Type" value={trial.adminType} />
            <Field label="Age Group" value={trial.age} />
            <Field label="Dosage / Strength" value={trial.dosageStrength} />
            <Field label="Dosing Frequency" value={trial.dosingFrequency} />
          </Section>

          {/* Timeline */}
          <Section icon={Calendar} title="Dates & Timeline" accent={C.teal}>
            <Field label="Study Start" value={trial.startDate} />
            <Field label="Primary Completion" value={trial.primaryCompletionDate} />
            <Field label="Study Completion" value={trial.completionDate} />
            <Field label="Est. Launch Date" value={trial.estLaunchDate} />
            <Field label="Approval Year" value={trial.approvalYear} />
          </Section>

          {/* Outcomes */}
          <Section icon={Target} title="Outcomes & Endpoints" accent={C.mint}>
            <Field label="Primary End Point" value={trial.primaryEndPoint} />
            <Field label="Est. Incidence (2025)" value={
              trial.incidence2025 ? trial.incidence2025.toLocaleString() : null
            } />
            <Field
              label="Endpoints"
              value={
                trial.endpoints ? (
                  <ul className="space-y-1">
                    {trial.endpoints
                      .split(" || ")
                      .filter(Boolean)
                      .slice(0, 10)
                      .map((ep, i) => (
                        <li key={i} className="flex gap-2 text-[11px]">
                          <span style={{ color: C.mint }}>▸</span>
                          <span>{ep.trim()}</span>
                        </li>
                      ))}
                  </ul>
                ) : null
              }
            />
          </Section>

          {/* Pricing */}
          {(priceNum || trial.drugPrice || trial.drugBrandSwitch) && (
            <Section icon={DollarSign} title="Pricing & Alternatives" accent={C.accent}>
              <Field
                label="Drug Price"
                value={
                  priceNum ? (
                    <span className="flex items-center gap-2">
                      <span className="font-[var(--font-bebas)] text-xl" style={{ color: C.accent }}>
                        ${priceNum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-muted-foreground text-[10px]">(listed)</span>
                    </span>
                  ) : (
                    trial.drugPrice || null
                  )
                }
              />
              <Field label="Drug/Brand Alternatives" value={trial.drugBrandSwitch} />
            </Section>
          )}

          {/* Sponsor & Meta */}
          <Section icon={Building2} title="Sponsor & Locations" accent={C.primary}>
            <Field label="Sponsor" value={trial.sponsor} />
            <Field
              label="Other Locations"
              value={
                trial.locationOther ? (
                  <span className="inline-flex items-start gap-1.5">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <span>{trial.locationOther}</span>
                  </span>
                ) : null
              }
            />
            <Field label="No. of Related Trials" value={trial.numTrials || null} />
            <Field label="ATC Code" value={trial.atcCode} />
          </Section>
        </div>
      </div>
    </>
  )
}

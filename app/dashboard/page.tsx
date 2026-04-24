"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import trialsRaw from "@/app/data/trials.json"
import { DashboardKPIs } from "@/components/dashboard/kpi-cards"
import { DashboardCharts } from "@/components/dashboard/charts"
import { TrialsTable } from "@/components/dashboard/trials-table"
import { DashboardFilters } from "@/components/dashboard/filters"
import { TrialDetailSheet } from "@/components/dashboard/trial-detail-sheet"
import { ComparisonPanel } from "@/components/dashboard/comparison-panel"
import { PageSection } from "@/components/page-section"
import { ArrowLeft, User as UserIcon, Search as SearchIcon, FileText, Trash2, X, LogOut } from "lucide-react"

interface ViewedTrialEntry {
  nctId: string
  molecule: string
  indication: string
  at: number
}

const HISTORY_KEY = "phase-xs:user-history"
const MAX_HISTORY = 20

export interface Trial {
  nctId: string
  phase: string
  enrollment: number
  startDate: string
  primaryCompletionDate: string
  completionDate: string
  durationYears: number
  arms: number
  estLaunchDate: number | null
  dosingFrequency: string
  molecule: string
  approvedBiologics: string
  numTrials: number
  atcCode: string
  endpoints: string
  adherenceRate: number | null
  drugBrandSwitch: string
  indication: string
  incidence2025: number | null
  approvalYear: string
  drugPrice: string
  /** Price Source URL from master spreadsheet (drugs.com etc.) */
  drugPriceUrl: string
  dosageStrength: string
  adverseEffect: string
  locationOther: string
  sponsor: string
  biologicType: string
  age: string
  pharmClass: string
  trialDesign: string
  routeOfAdmin: string
  technology: string
  diseaseCondition: string
  adminType: string
  primaryEndPoint: string
  marketForecast2023: string
  marketForecast2024: string
  marketForecast2025: string
  marketForecast2026: string
  marketForecast2027: string
  /** Payor / access (from source spreadsheet) */
  reimbursement?: string
}

const trials: Trial[] = trialsRaw as Trial[]

export interface Filters {
  search: string
  phases: string[]
  technologies: string[]
  indications: string[]
  trialDesigns: string[]
  routeOfAdmin: string[]
  adminType: string[]
}

const defaultFilters: Filters = {
  search: "",
  phases: [],
  technologies: [],
  indications: [],
  trialDesigns: [],
  routeOfAdmin: [],
  adminType: [],
}

function normalizePhase(p: string): string {
  if (!p || p === "Unknown") return "Unknown"
  return p
    .replace(/EARLY_PHASE1/g, "Early Phase 1")
    .replace(/PHASE1/g, "Phase 1")
    .replace(/PHASE2/g, "Phase 2")
    .replace(/PHASE3/g, "Phase 3")
    .replace(/PHASE4/g, "Phase 4")
    .replace(/ \/ /g, " / ")
    .replace(/, /g, " / ")
}

export { normalizePhase }

export default function DashboardPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [selectedTrial, setSelectedTrialState] = useState<Trial | null>(null)

  // User history (searches + viewed trials), persisted in localStorage
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [viewedHistory, setViewedHistory] = useState<ViewedTrialEntry[]>([])
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Strip legacy Clerk query params (?__clerk…) from bookmarks / old history.
  useEffect(() => {
    const url = new URL(window.location.href)
    let changed = false
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith("__clerk")) {
        url.searchParams.delete(key)
        changed = true
      }
    }
    if (changed) {
      const next = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : "") + url.hash
      window.history.replaceState(window.history.state, "", next)
    }
  }, [])

  // Load history once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setSearchHistory(parsed.searches || [])
        setViewedHistory(parsed.viewed || [])
      }
    } catch {}
  }, [])

  // Persist history whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify({ searches: searchHistory, viewed: viewedHistory }),
      )
    } catch {}
  }, [searchHistory, viewedHistory])

  // Debounced recording of search terms
  useEffect(() => {
    const term = filters.search.trim()
    if (!term) return
    const id = setTimeout(() => {
      setSearchHistory(prev => {
        const next = [term, ...prev.filter(s => s.toLowerCase() !== term.toLowerCase())]
        return next.slice(0, MAX_HISTORY)
      })
    }, 600)
    return () => clearTimeout(id)
  }, [filters.search])

  // Wrap selectedTrial setter to record viewed reports
  const setSelectedTrial = useCallback((t: Trial | null) => {
    setSelectedTrialState(t)
    if (t) {
      setViewedHistory(prev => {
        const entry: ViewedTrialEntry = {
          nctId: t.nctId,
          molecule: t.molecule,
          indication: t.indication,
          at: Date.now(),
        }
        const next = [entry, ...prev.filter(v => v.nctId !== t.nctId)]
        return next.slice(0, MAX_HISTORY)
      })
    }
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [userMenuOpen])

  const clearHistory = () => {
    setSearchHistory([])
    setViewedHistory([])
  }

  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => setFilters(defaultFilters), [])

  const matchesTerm = useCallback((t: Trial, s: string) => {
    const ls = s.toLowerCase()
    return (
      t.nctId.toLowerCase().includes(ls) ||
      t.molecule.toLowerCase().includes(ls) ||
      t.indication.toLowerCase().includes(ls) ||
      t.sponsor.toLowerCase().includes(ls) ||
      t.diseaseCondition.toLowerCase().includes(ls) ||
      t.technology.toLowerCase().includes(ls) ||
      (t.reimbursement?.toLowerCase() ?? "").includes(ls)
    )
  }, [])

  // Parse comma-separated search into comparison terms
  const searchTerms = useMemo(
    () => filters.search.split(",").map(s => s.trim()).filter(Boolean),
    [filters.search],
  )
  const isComparing = searchTerms.length >= 2

  const passesNonSearchFilters = useCallback((t: Trial) => {
    if (filters.phases.length && !filters.phases.includes(normalizePhase(t.phase))) return false
    if (filters.technologies.length && !filters.technologies.includes(t.technology)) return false
    if (filters.indications.length && !filters.indications.some(ind => t.indication.toUpperCase().includes(ind.toUpperCase()))) return false
    if (filters.trialDesigns.length && !filters.trialDesigns.includes(t.trialDesign)) return false
    if (filters.routeOfAdmin.length && !filters.routeOfAdmin.some(r => t.routeOfAdmin.includes(r))) return false
    if (filters.adminType.length && !filters.adminType.includes(t.adminType)) return false
    return true
  }, [filters])

  const filteredTrials = useMemo(() => {
    return trials.filter(t => {
      if (!passesNonSearchFilters(t)) return false
      if (searchTerms.length === 0) return true
      // Union match across all terms (so table/count shows every matched trial)
      return searchTerms.some(term => matchesTerm(t, term))
    })
  }, [searchTerms, passesNonSearchFilters, matchesTerm])

  // Per-term groups for comparison mode
  const comparisonGroups = useMemo(() => {
    if (!isComparing) return []
    return searchTerms.map(term => ({
      term,
      trials: trials.filter(t => passesNonSearchFilters(t) && matchesTerm(t, term)),
    }))
  }, [isComparing, searchTerms, passesNonSearchFilters, matchesTerm])

  // Precompute filter options from full dataset
  const filterOptions = useMemo(() => {
    const phases = [...new Set(trials.map(t => normalizePhase(t.phase)))].filter(Boolean).sort()
    const technologies = [...new Set(trials.map(t => t.technology))].filter(Boolean).sort()
    // Top 30 indications by frequency
    const indMap = new Map<string, number>()
    trials.forEach(t => {
      if (t.indication) indMap.set(t.indication, (indMap.get(t.indication) || 0) + 1)
    })
    const indications = [...indMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(e => e[0])
    const trialDesigns = [...new Set(trials.map(t => t.trialDesign))].filter(Boolean).sort()
    const routes = [...new Set(trials.flatMap(t => t.routeOfAdmin.split(", ").map(r => r.trim())))].filter(Boolean).sort()
    const adminTypes = [...new Set(trials.map(t => t.adminType))].filter(Boolean).sort()
    return { phases, technologies, indications, trialDesigns, routes, adminTypes }
  }, [])

  const activeFilterCount = [
    filters.phases.length,
    filters.technologies.length,
    filters.indications.length,
    filters.trialDesigns.length,
    filters.routeOfAdmin.length,
    filters.adminType.length,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-bg fixed inset-0 opacity-20" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
            <div className="flex min-h-[4.25rem] py-2 items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </Link>
                <div className="h-4 w-px bg-border" />
                <h1 className="font-[var(--font-bebas)] text-3xl tracking-wider">
                  PHASE-XS
                </h1>
                <span className="hidden sm:inline-block font-mono text-[12px] uppercase tracking-widest text-muted-foreground border border-border px-2 py-0.5">
                  Clinical Trials Dashboard
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[12px] text-muted-foreground">
                  {filteredTrials.length.toLocaleString()} / {trials.length.toLocaleString()} trials
                </span>
                <a
                  href="/api/auth/logout"
                  className="inline-flex items-center gap-1.5 rounded border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-[rgba(42,143,156,0.6)] transition-colors"
                >
                  <LogOut className="h-3 w-3" />
                  Sign out
                </a>

                {/* User / history menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    aria-label="User history"
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground hover:text-foreground hover:border-[rgba(42,143,156,0.6)] transition-colors"
                  >
                    <UserIcon className="h-4 w-4" />
                    {(searchHistory.length > 0 || viewedHistory.length > 0) && (
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#2A8F9C]" />
                    )}
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto overscroll-contain rounded-md border border-border bg-background/95 backdrop-blur-xl shadow-2xl z-50"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                        <span className="font-mono text-[12px] uppercase tracking-widest text-muted-foreground">
                          Your Activity
                        </span>
                        <div className="flex items-center gap-1">
                          {(searchHistory.length > 0 || viewedHistory.length > 0) && (
                            <button
                              type="button"
                              onClick={clearHistory}
                              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Clear history"
                            >
                              <Trash2 className="h-3 w-3" />
                              Clear
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setUserMenuOpen(false)}
                            className="inline-flex items-center justify-center rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Close"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Searches */}
                      <div className="px-3 py-2">
                        <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
                          <SearchIcon className="h-3 w-3" />
                          <span className="font-mono text-[11px] uppercase tracking-widest">
                            Recent Searches
                          </span>
                        </div>
                        {searchHistory.length === 0 ? (
                          <p className="font-mono text-[12px] text-muted-foreground/70 pl-4">
                            No searches yet
                          </p>
                        ) : (
                          <ul className="space-y-0.5">
                            {searchHistory.map((s, i) => (
                              <li key={`${s}-${i}`} className="group/item flex items-center rounded hover:bg-muted">
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateFilter("search", s)
                                    setUserMenuOpen(false)
                                  }}
                                  className="flex-1 text-left truncate px-2 py-1 font-mono text-sm text-foreground/90 hover:text-foreground transition-colors"
                                >
                                  {s}
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Remove search ${s}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSearchHistory(prev => prev.filter(x => x !== s))
                                  }}
                                  className="mr-1 inline-flex items-center justify-center rounded p-0.5 text-muted-foreground/60 opacity-0 group-hover/item:opacity-100 hover:text-foreground hover:bg-background transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="border-t border-border" />

                      {/* Viewed reports */}
                      <div className="px-3 py-2">
                        <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span className="font-mono text-[11px] uppercase tracking-widest">
                            Viewed Reports
                          </span>
                        </div>
                        {viewedHistory.length === 0 ? (
                          <p className="font-mono text-[12px] text-muted-foreground/70 pl-4">
                            No reports viewed yet
                          </p>
                        ) : (
                          <ul className="space-y-0.5">
                            {viewedHistory.map(v => {
                              const trial = trials.find(t => t.nctId === v.nctId)
                              return (
                                <li key={v.nctId}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (trial) setSelectedTrial(trial)
                                      setUserMenuOpen(false)
                                    }}
                                    className="w-full text-left rounded px-2 py-1 hover:bg-muted transition-colors"
                                  >
                                    <div className="font-mono text-sm text-foreground/90 truncate">
                                      {v.nctId}
                                    </div>
                                    <div className="font-mono text-[11px] text-muted-foreground truncate">
                                      {v.molecule || "—"} · {v.indication || "—"}
                                    </div>
                                  </button>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          {/* Filters — highest z so dropdowns sit above everything */}
          <div className="relative z-40">
            <PageSection page="dashboard" variant="filters" className="p-4 sm:p-5">
              <DashboardFilters
                filters={filters}
                filterOptions={filterOptions}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                activeFilterCount={activeFilterCount}
              />
            </PageSection>
          </div>

          <PageSection
            page="dashboard"
            variant="data"
            className="relative z-0 mt-6 space-y-6"
          >
            {isComparing && <ComparisonPanel groups={comparisonGroups} />}
            <DashboardKPIs trials={filteredTrials} />
            <DashboardCharts trials={filteredTrials} />
          </PageSection>

          <PageSection page="dashboard" variant="table" className="relative z-0 mt-6">
            <TrialsTable
              trials={filteredTrials}
              onSelectTrial={setSelectedTrial}
            />
          </PageSection>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-4 mt-6">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
            <p className="font-mono text-[12px] uppercase tracking-widest text-muted-foreground">
              PHASE-XS / US Clinical Trials Database / {trials.length.toLocaleString()} Records
            </p>
          </div>
        </footer>
      </div>

      {/* Trial Detail Sheet */}
      <TrialDetailSheet trial={selectedTrial} onClose={() => setSelectedTrial(null)} />
    </div>
  )
}


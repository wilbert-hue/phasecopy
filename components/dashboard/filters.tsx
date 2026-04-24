"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Filters } from "@/app/dashboard/page"
import { Search, X, ChevronDown } from "lucide-react"

interface FilterOptions {
  phases: string[]
  technologies: string[]
  indications: string[]
  trialDesigns: string[]
  routes: string[]
  adminTypes: string[]
}

interface DashboardFiltersProps {
  filters: Filters
  filterOptions: FilterOptions
  updateFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  resetFilters: () => void
  activeFilterCount: number
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
  accent = "#2563EB",
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (val: string[]) => void
  accent?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const btnRef = useRef<HTMLButtonElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  const filtered = search
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [open])

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="group w-full flex flex-col text-left font-mono text-sm transition-colors relative overflow-hidden rounded-md shadow-sm"
        style={{
          border: `1px solid ${accent}50`,
          background: `linear-gradient(165deg, ${accent}20 0%, ${accent}0a 45%, ${accent}06 100%)`,
          color: accent,
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = `linear-gradient(165deg, ${accent}2e 0%, ${accent}16 50%, ${accent}0c 100%)`
          e.currentTarget.style.borderColor = `${accent}aa`
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = `linear-gradient(165deg, ${accent}20 0%, ${accent}0a 45%, ${accent}06 100%)`
          e.currentTarget.style.borderColor = `${accent}50`
        }}
      >
        <div
          className="h-1 w-full shrink-0"
          style={{
            background: `linear-gradient(90deg, ${accent}, ${accent}99, ${accent}40)`,
            boxShadow: `inset 0 -1px 0 ${accent}30`,
          }}
        />
        <div className="flex items-center justify-between gap-2 px-3 py-2 w-full min-h-[2.5rem]">
          <span className="truncate text-left font-medium">
            {selected.length ? `${label} (${selected.length})` : label}
          </span>
          <span style={{ color: accent }}>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </span>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[998]" onClick={() => { setOpen(false); setSearch("") }} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                ...dropdownStyle,
                borderColor: `${accent}40`,
                boxShadow: `0 10px 40px -10px ${accent}30`,
              }}
              className="z-[999] border-2 bg-background/95 backdrop-blur-sm shadow-xl max-h-64 overflow-hidden flex flex-col rounded-md"
            >
                {options.length > 8 && (
                <div
                  className="p-2 border-b"
                  style={{ borderColor: `${accent}25`, background: `${accent}08` }}
                >
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                </div>
              )}
              <div className="overflow-y-auto p-1">
                {filtered.length === 0 && (
                  <p className="px-2 py-3 font-mono text-[12px] text-muted-foreground text-center">No matches</p>
                )}
                {filtered.map(option => (
                  <label
                    key={option}
                    className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors"
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `${accent}14`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "transparent"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(option)}
                      onChange={() => {
                        onChange(
                          selected.includes(option)
                            ? selected.filter(s => s !== option)
                            : [...selected, option]
                        )
                      }}
                      className="h-3 w-3 rounded border-border"
                      style={{ accentColor: accent }}
                    />
                    <span className="font-mono text-sm truncate">{option}</span>
                  </label>
                ))}
              </div>
              {selected.length > 0 && (
                <button
                  onClick={() => onChange([])}
                  className="border-t p-2 font-mono text-[12px] uppercase tracking-wider w-full text-center transition-colors"
                  style={{ borderColor: `${accent}30`, color: accent, background: `${accent}0a` }}
                >
                  Clear selection
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DashboardFilters({
  filters,
  filterOptions,
  updateFilter,
  resetFilters,
  activeFilterCount,
}: DashboardFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Search row */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 border border-border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search by NCT ID, molecule, indication, sponsor, technology…  (use commas to compare: e.g. roche, pfizer)"
            value={filters.search}
            onChange={e => updateFilter("search", e.target.value)}
            className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground/50"
          />
          {filters.search && (
            <button onClick={() => updateFilter("search", "")} className="text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="font-mono text-[12px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Filter dropdowns — distinct accent per control (aligns with report section palette) */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-lg border border-border/70 overflow-hidden"
        style={{
          background:
            "linear-gradient(125deg, rgba(37,99,235,0.07) 0%, rgba(109,40,217,0.06) 25%, rgba(180,83,9,0.06) 50%, rgba(14,116,144,0.07) 75%, rgba(4,120,87,0.05) 100%)",
        }}
      >
        <MultiSelect
          label="Phase"
          accent="#2563EB"
          options={filterOptions.phases}
          selected={filters.phases}
          onChange={v => updateFilter("phases", v)}
        />
        <MultiSelect
          label="Technology"
          accent="#6D28D9"
          options={filterOptions.technologies}
          selected={filters.technologies}
          onChange={v => updateFilter("technologies", v)}
        />
        <MultiSelect
          label="Indication"
          accent="#BE123C"
          options={filterOptions.indications}
          selected={filters.indications}
          onChange={v => updateFilter("indications", v)}
        />
        <MultiSelect
          label="Trial Design"
          accent="#B45309"
          options={filterOptions.trialDesigns}
          selected={filters.trialDesigns}
          onChange={v => updateFilter("trialDesigns", v)}
        />
        <MultiSelect
          label="Route of Admin"
          accent="#0E7490"
          options={filterOptions.routes}
          selected={filters.routeOfAdmin}
          onChange={v => updateFilter("routeOfAdmin", v)}
        />
        <MultiSelect
          label="Administration"
          accent="#047857"
          options={filterOptions.adminTypes}
          selected={filters.adminType}
          onChange={v => updateFilter("adminType", v)}
        />
      </div>
    </div>
  )
}

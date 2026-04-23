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
  accent = "#2A8F9C",
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
        className="w-full flex items-center justify-between gap-2 px-3 py-2 font-mono text-xs transition-colors"
        style={{
          border: `1px solid ${accent}66`,
          background: `${accent}0f`,
          color: accent,
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = `${accent}1f`
          e.currentTarget.style.borderColor = accent
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = `${accent}0f`
          e.currentTarget.style.borderColor = `${accent}66`
        }}
      >
        <span className="truncate text-left">
          {selected.length ? `${label} (${selected.length})` : label}
        </span>
        <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
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
              style={dropdownStyle}
              className="z-[999] border border-border bg-background shadow-xl max-h-64 overflow-hidden flex flex-col"
            >
              {options.length > 8 && (
                <div className="p-2 border-b border-border">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs outline-none placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                </div>
              )}
              <div className="overflow-y-auto p-1">
                {filtered.length === 0 && (
                  <p className="px-2 py-3 font-mono text-[10px] text-muted-foreground text-center">No matches</p>
                )}
                {filtered.map(option => (
                  <label
                    key={option}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 cursor-pointer"
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
                      className="h-3 w-3 accent-[oklch(0.40_0.08_230)]"
                    />
                    <span className="font-mono text-[11px] truncate">{option}</span>
                  </label>
                ))}
              </div>
              {selected.length > 0 && (
                <button
                  onClick={() => onChange([])}
                  className="border-t border-border p-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-full text-center"
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
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search by NCT ID, molecule, indication, sponsor, technology…  (use commas to compare: e.g. roche, pfizer)"
            value={filters.search}
            onChange={e => updateFilter("search", e.target.value)}
            className="w-full bg-transparent font-mono text-xs outline-none placeholder:text-muted-foreground/50"
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
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Filter dropdowns — always visible */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4 border border-[#2A8F9C]/30 bg-[#2A8F9C]/[0.03]">
              <MultiSelect
                label="Phase"
                accent="#1B4965"
                options={filterOptions.phases}
                selected={filters.phases}
                onChange={v => updateFilter("phases", v)}
              />
              <MultiSelect
                label="Technology"
                accent="#1E6080"
                options={filterOptions.technologies}
                selected={filters.technologies}
                onChange={v => updateFilter("technologies", v)}
              />
              <MultiSelect
                label="Indication"
                accent="#2A8F9C"
                options={filterOptions.indications}
                selected={filters.indications}
                onChange={v => updateFilter("indications", v)}
              />
              <MultiSelect
                label="Trial Design"
                accent="#3AAFA9"
                options={filterOptions.trialDesigns}
                selected={filters.trialDesigns}
                onChange={v => updateFilter("trialDesigns", v)}
              />
              <MultiSelect
                label="Route of Admin"
                accent="#4FBDBA"
                options={filterOptions.routes}
                selected={filters.routeOfAdmin}
                onChange={v => updateFilter("routeOfAdmin", v)}
              />
        <MultiSelect
          label="Administration"
          accent="#62B6CB"
          options={filterOptions.adminTypes}
          selected={filters.adminType}
          onChange={v => updateFilter("adminType", v)}
        />
      </div>
    </div>
  )
}

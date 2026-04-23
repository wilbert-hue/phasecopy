"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const metrics = [
  {
    date: "Phase 3",
    title: "707K+ Enrolled",
    note: "Total participants enrolled across all tracked trials — the largest segment in late-stage studies.",
    accent: "#1B4965",
    accentLight: "rgba(27, 73, 101, 0.08)",
  },
  {
    date: "Oncology",
    title: "Top Indication",
    note: "Leukemia, lymphoma, and solid tumors dominate the trial landscape with 40%+ of all studies.",
    accent: "#1E6080",
    accentLight: "rgba(30, 96, 128, 0.08)",
  },
  {
    date: "mAb",
    title: "Leading Tech",
    note: "Monoclonal antibodies represent the dominant technology platform across all phases.",
    accent: "#2A8F9C",
    accentLight: "rgba(42, 143, 156, 0.08)",
  },
  {
    date: "92.3%",
    title: "Adherence Rate",
    note: "Average patient compliance across all tracked trials — a key indicator of protocol feasibility.",
    accent: "#3AAFA9",
    accentLight: "rgba(58, 175, 169, 0.08)",
  },
]

export function SignalsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (!sectionRef.current || !cursorRef.current) return

    const section = sectionRef.current
    const cursor = cursorRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      gsap.to(cursor, {
        x: x,
        y: y,
        duration: 0.5,
        ease: "power3.out",
      })
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    section.addEventListener("mousemove", handleMouseMove)
    section.addEventListener("mouseenter", handleMouseEnter)
    section.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      section.removeEventListener("mousemove", handleMouseMove)
      section.removeEventListener("mouseenter", handleMouseEnter)
      section.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !cardsRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      )

      const cards = cardsRef.current?.querySelectorAll("article")
      if (cards) {
        gsap.fromTo(
          cards,
          { x: -100, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="metrics" ref={sectionRef} className="relative py-32 pl-6 md:pl-28">
      {/* Cursor — c3 */}
      <div
        ref={cursorRef}
        className={cn(
          "pointer-events-none absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-50",
          "w-5 h-5 rounded-full transition-opacity duration-300",
          isHovering ? "opacity-100" : "opacity-0",
        )}
        style={{ background: "#2A8F9C", border: "1px solid #4FBDBA" }}
      />

      {/* Section header */}
      <div ref={headerRef} className="mb-16 pr-6 md:pr-12">
        {/* Label — c4 */}
        <span
          className="font-mono text-[10px] uppercase tracking-[0.3em]"
          style={{ color: "#3AAFA9" }}
        >
          01 / Key Metrics
        </span>
        {/* Heading — c1 */}
        <h2
          className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight"
          style={{ color: "#1B4965" }}
        >
          AT A GLANCE
        </h2>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={(el) => {
          scrollRef.current = el
          cardsRef.current = el
        }}
        className="flex gap-8 overflow-x-auto pb-8 pr-12 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} index={index} />
        ))}
      </div>

      {/* Stats grid — moved from Data Sources section */}
      <div className="mt-24 pr-6 md:pr-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        <div>
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] mb-4" style={{ color: "#1B4965" }}>
            Coverage
          </h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs" style={{ color: "#3d6070" }}>3,049 Trials</li>
            <li className="font-mono text-xs" style={{ color: "#3d6070" }}>1,246 Molecules</li>
            <li className="font-mono text-xs" style={{ color: "#3d6070" }}>1,085 Indications</li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] mb-4" style={{ color: "#1E6080" }}>
            Phases
          </h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs" style={{ color: "#3d6070" }}>Early Phase 1</li>
            <li className="font-mono text-xs" style={{ color: "#3d6070" }}>Phase 1 – 4</li>
            <li className="font-mono text-xs" style={{ color: "#3d6070" }}>Combined Phases</li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] mb-4" style={{ color: "#2A8F9C" }}>
            Technologies
          </h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs" style={{ color: "#3d6070" }}>Monoclonal Antibodies</li>
            <li className="font-mono text-xs" style={{ color: "#3d6070" }}>CAR-T / Cell Therapy</li>
            <li className="font-mono text-xs" style={{ color: "#3d6070" }}>ADCs & Biosimilars</li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] mb-4" style={{ color: "#3AAFA9" }}>
            Region
          </h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs" style={{ color: "#3d6070" }}>United States</li>
            <li className="font-mono text-xs" style={{ color: "#3d6070" }}>Global Collaborators</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

function MetricCard({
  metric,
  index,
}: {
  metric: { date: string; title: string; note: string; accent: string; accentLight: string }
  index: number
}) {
  return (
    <article
      className={cn(
        "group relative flex-shrink-0 w-80",
        "transition-transform duration-500 ease-out",
        "hover:-translate-y-2",
      )}
    >
      <div className="relative bg-card border border-border/50 md:border-t md:border-l md:border-r-0 md:border-b-0 p-8 overflow-hidden">
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(to right, ${metric.accent}, transparent)`,
          }}
        />

        {/* Hover background glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${metric.accentLight} 0%, transparent 70%)`,
          }}
        />

        <div className="flex items-baseline justify-between mb-8 relative">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: metric.accent }}
          >
            No. {String(index + 1).padStart(2, "0")}
          </span>
          <time
            className="font-mono text-[10px] font-medium"
            style={{ color: metric.accent, opacity: 0.7 }}
          >
            {metric.date}
          </time>
        </div>

        <h3
          className="font-[var(--font-bebas)] text-4xl tracking-tight mb-4 transition-colors duration-300"
          style={{ color: metric.accent }}
        >
          {metric.title}
        </h3>

        <div
          className="w-12 h-[2px] mb-6 group-hover:w-full transition-all duration-500"
          style={{
            background: `linear-gradient(to right, ${metric.accent}, transparent)`,
          }}
        />

        <p className="font-mono text-xs leading-relaxed relative" style={{ color: "#3d6070" }}>{metric.note}</p>

        <div className="absolute bottom-0 right-0 w-6 h-6 overflow-hidden">
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-background rotate-45 translate-x-4 translate-y-4 border-t border-l border-border/30" />
        </div>
      </div>

      {/* Hover shadow */}
      <div
        className="absolute inset-0 -z-10 translate-x-1 translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: metric.accentLight }}
      />
    </article>
  )
}

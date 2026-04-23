import { HeroSection } from "@/components/hero-section"
import { SignalsSection } from "@/components/signals-section"
import { WorkSection } from "@/components/work-section"
import { PrinciplesSection } from "@/components/principles-section"
import { WhyCmiSection } from "@/components/why-cmi-section"
import { KeyStatsSection } from "@/components/key-stats-section"
import { CredibilitySection } from "@/components/credibility-section"
import { ClienteleSection } from "@/components/clientele-section"
import { ColophonSection } from "@/components/colophon-section"
import { Footer } from "@/components/footer"
import { SideNav } from "@/components/side-nav"
import { ContactTab } from "@/components/contact-tab"
import { AnimatedBackground } from "@/components/animated-background"

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <SideNav />
      <ContactTab />
      <AnimatedBackground />

      <div className="relative z-10">
        <HeroSection />
        <SignalsSection />
        <WorkSection />
        <PrinciplesSection />
        <CredibilitySection />
        <ClienteleSection />
        <WhyCmiSection />
        <KeyStatsSection />
        <ColophonSection />
        <Footer />
      </div>
    </main>
  )
}

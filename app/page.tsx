import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { MarqueeBand } from "@/components/marquee-band"
import { AboutSection } from "@/components/about-section"
import { PhilosophySection } from "@/components/philosophy-section"
import { ServicesSection } from "@/components/services-section"
import { FaqSection } from "@/components/faq-section"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { BetaQualificationChecker } from "@/components/beta-qualification-checker"

export default function Home() {
  return (
    <>
      <Header />
      <BetaQualificationChecker />
      <main>
        <HeroSection />
        <MarqueeBand />
        <AboutSection />
        <PhilosophySection />
        <ServicesSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}

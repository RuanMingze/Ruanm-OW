import { ArrowDown } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(0 0% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 50%) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div
          data-aos="fade-up"
          className="mb-6"
        >
          <img
            src="/logo.png"
            alt="Ruanm Studio Logo"
            className="h-20 w-auto mx-auto"
          />
        </div>

        <h1
          data-aos="fade-up"
          data-aos-delay="150"
          className="text-5xl font-bold leading-tight tracking-tight text-primary md:text-7xl lg:text-8xl text-balance"
        >
          {'用户体验至上的'}
          <br />
          {'好产品'}
        </h1>

        <p
          data-aos="fade-up"
          data-aos-delay="300"
          className="mt-8 max-w-xl mx-auto text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          {'我们相信，伟大的产品源于对用户的深刻理解。以设计驱动创新，以体验定义价值。'}
        </p>

        <div
          data-aos="fade-up"
          data-aos-delay="450"
          className="mt-12 flex items-center justify-center gap-4"
        >
          <a
            href="#about"
            className="inline-flex items-center rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300"
          >
            {'了解更多'}
          </a>
          <a
            href="#contact"
            className="inline-flex items-center rounded-full border border-border px-8 py-3.5 text-sm font-medium text-primary hover:bg-accent transition-all duration-300"
          >
            {'联系我们'}
          </a>
        </div>
      </div>

      <a
        href="#about"
        data-aos="fade"
        data-aos-delay="600"
        className="absolute bottom-10 text-muted-foreground hover:text-primary transition-colors"
        aria-label="Scroll down"
      >
        <ArrowDown size={20} className="animate-bounce" />
      </a>
    </section>
  )
}

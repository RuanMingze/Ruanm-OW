import { Mail } from "lucide-react"

export function CtaSection() {
  return (
    <section id="contact" className="py-32 px-6 lg:px-8 bg-card/30">
      <div className="mx-auto max-w-3xl text-center">
        <p
          data-aos="fade-up"
          className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6"
        >
          {'联系我们'}
        </p>
        <h2
          data-aos="fade-up"
          data-aos-delay="100"
          className="text-3xl font-bold tracking-tight text-primary md:text-5xl text-balance"
        >
          {'有想法？一起聊聊'}
        </h2>
        <p
          data-aos="fade-up"
          data-aos-delay="200"
          className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          {'无论是新的产品构想，还是现有产品的体验优化，我们都期待与您交流。让我们一起创造有意义的数字体验。'}
        </p>

        <div data-aos="fade-up" data-aos-delay="300" className="mt-12">
          <a
            href="mailto:xmt20160124@outlook.com"
            className="inline-flex items-center gap-3 rounded-full bg-primary px-10 py-4 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300"
          >
            <Mail size={18} />
            {'发送邮件'}
          </a>
          <p className="mt-6 text-sm text-muted-foreground">
            xmt20160124@outlook.com
          </p>
        </div>
      </div>
    </section>
  )
}

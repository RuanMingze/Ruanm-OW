'use client'

import { useEffect, useRef, useState } from 'react'

function StatCard({ stat, idx }: { stat: { value: string; label: string }; idx: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return
      
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setMousePosition({ x, y })
    }

    const card = cardRef.current
    if (card) {
      card.addEventListener('mousemove', handleMouseMove)
      card.addEventListener('mouseenter', () => setIsHovered(true))
      card.addEventListener('mouseleave', () => setIsHovered(false))
    }

    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove)
        card.removeEventListener('mouseenter', () => setIsHovered(true))
        card.removeEventListener('mouseleave', () => setIsHovered(false))
      }
    }
  }, [])

  return (
    <div
      ref={cardRef}
      key={stat.label}
      data-aos="zoom-in"
      data-aos-delay={300 + idx * 100}
      className="relative text-center p-6 rounded-2xl bg-card border border-border transition-all duration-300 hover:shadow-lg"
    >
      {isHovered && (
        <div 
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(224, 112, 32, 0.15), transparent 60%)`,
            opacity: 1,
            borderRadius: '1rem'
          }}
        />
      )}
      <div className="relative z-10 text-2xl font-bold text-primary md:text-3xl">
        {stat.value}
      </div>
      <div className="relative z-10 mt-2 text-sm text-muted-foreground">
        {stat.label}
      </div>
    </div>
  )
}

export function AboutSection() {
  return (
    <section id="about" className="py-32 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
          <div>
            <p
              data-aos="fade-up"
              className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6"
            >
              {'关于我们'}
            </p>
            <h2
              data-aos="fade-up"
              data-aos-delay="100"
              className="text-3xl font-bold tracking-tight text-primary md:text-5xl text-balance"
            >
              {'做有温度的产品，让技术服务于人'}
            </h2>
          </div>

          <div data-aos="fade-up" data-aos-delay="200" className="space-y-6">
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              {'Ruanm 成立于对用户体验的执着追求之上。我们不只是开发产品——我们精心打磨每一个交互细节，让每个使用者都能感受到产品背后的用心。'}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              {'从构思到上线，我们始终将用户放在第一位。好的产品不需要解释，它自然而然地融入生活，成为不可或缺的一部分。'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-24 grid grid-cols-2 gap-8 md:grid-cols-4">
          {
            [
              { value: "100%", label: "用心投入" },
              { value: "∞", label: "对细节的追求" },
              { value: "7×24", label: "持续优化" },
              { value: "以人为本", label: "核心理念" },
            ].map((stat, i) => (
              <StatCard key={stat.label} stat={stat} idx={i} />
            ))
          }
        </div>
      </div>
    </section>
  )
}

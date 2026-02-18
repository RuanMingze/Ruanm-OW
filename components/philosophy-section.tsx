'use client'

import { Eye, Layers, Sparkles, Heart } from "lucide-react"
import { useEffect, useRef, useState } from 'react'
import { useTheme } from "next-themes"

const principles = [
  {
    icon: Eye,
    title: "洞察本质",
    description: "深入理解用户的真实需求，而不仅仅是表面的诉求。通过细致的观察和研究，发现产品改进的关键点。",
  },
  {
    icon: Layers,
    title: "极简设计",
    description: "少即是多。去掉一切不必要的元素，让产品的核心价值以最纯粹的方式呈现给用户。",
  },
  {
    icon: Sparkles,
    title: "细节之美",
    description: "每一个像素、每一帧动画、每一次交互都经过精心设计。伟大的体验藏在无数微小的细节之中。",
  },
  {
    icon: Heart,
    title: "以人为本",
    description: "技术是手段，人才是目的。我们创造的每一款产品，都是为了让人们的生活变得更加美好。",
  },
]

function PrincipleCard({ principle, idx }: { principle: any; idx: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const isDark = mounted && theme === 'dark'

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
      key={principle.title}
      data-aos="fade-up"
      data-aos-delay={150 + idx * 100}
      className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-muted-foreground/30 hover:bg-accent/50"
    >
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(224, 112, 32, 0.15), transparent 60%)`,
            opacity: 1
          }}
        />
      )}
      <div className="relative z-10 mb-6 inline-flex items-center justify-center rounded-xl bg-accent p-3">
        <principle.icon size={24} className="text-primary" />
      </div>
      <h3 className="relative z-10 text-lg font-semibold text-primary mb-3">{principle.title}</h3>
      <p className="relative z-10 text-sm leading-relaxed text-muted-foreground">{principle.description}</p>
    </div>
  )
}

export function PhilosophySection() {
  return (
    <section id="philosophy" className="py-32 px-6 lg:px-8 bg-card/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <p
            data-aos="fade-up"
            className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6"
          >
            {'产品理念'}
          </p>
          <h2
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-3xl font-bold tracking-tight text-primary md:text-5xl text-balance"
          >
            {'我们如何思考产品'}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {principles.map((p, i) => (
            <PrincipleCard key={p.title} principle={p} idx={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
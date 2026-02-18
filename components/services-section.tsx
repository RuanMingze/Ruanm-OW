'use client'

import { ArrowRight } from "lucide-react"
import { useEffect, useRef, useState } from 'react'
import { useTheme } from "next-themes"

const services = [
  {
    number: "01",
    title: "产品策略",
    description: "从商业目标到用户需求，制定清晰的产品路线图，确保每一步都走在正确的方向上。",
  },
  {
    number: "02",
    title: "体验设计",
    description: "以用户为中心的设计流程，从用户研究、信息架构到交互设计和视觉呈现，打造流畅的产品体验。",
  },
  {
    number: "03",
    title: "技术实现",
    description: "采用前沿技术栈，注重代码质量和性能优化，将设计完美转化为高质量的数字产品。",
  },
  {
    number: "04",
    title: "持续迭代",
    description: "产品上线只是起点。通过数据分析和用户反馈，持续优化产品体验，追求卓越。",
  },
]

function ServiceCard({ service, idx }: { service: any; idx: number }) {
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
      key={service.number}
      data-aos="fade-left"
      data-aos-delay={200 + idx * 100}
      className="group relative flex flex-col gap-6 border border-border bg-card rounded-lg py-8 px-6 transition-all duration-300 md:flex-row md:items-center md:gap-12 hover:pl-4"
    >
      {isHovered && (
        <div 
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(224, 112, 32, 0.15), transparent 60%)`,
            opacity: 1
          }}
        />
      )}
      <span className="relative z-10 text-sm font-medium text-muted-foreground md:w-12">{service.number}</span>
      <h3 className="relative z-10 text-xl font-semibold text-primary md:w-48 md:text-2xl">{service.title}</h3>
      <p className="relative z-10 flex-1 text-base leading-relaxed text-muted-foreground">{service.description}</p>
    </div>
  )
}

export function ServicesSection() {
  return (
    <section id="services" className="py-32 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20">
          <p
            data-aos="fade-up"
            className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6"
          >
            {'我们的服务'}
          </p>
          <h2
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-3xl font-bold tracking-tight text-primary md:text-5xl text-balance"
          >
            {'从想法到现实'}
          </h2>
        </div>

        <div className="space-y-4">
          {services.map((s, i) => (
            <ServiceCard key={s.number} service={s} idx={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
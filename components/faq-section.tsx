'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTheme } from "next-themes"

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: '你们提供哪些类型的服务？',
      answer: '我们提供从产品策略、体验设计到技术实现和持续迭代的全方位服务。无论您是需要从零开始构建产品，还是优化现有产品的用户体验，我们都能为您提供专业的支持。'
    },
    {
      question: '项目周期通常需要多长时间？',
      answer: '项目周期因具体需求而异。小型项目可能在1-2个月内完成，而复杂的大型项目可能需要3-6个月或更长时间。我们会在项目启动前进行详细评估，并提供合理的时间预估。'
    },
    {
      question: '如何确保项目质量和交付时间？',
      answer: '我们采用敏捷开发方法论，定期进行进度检查和质量评估。每个项目都有专门的项目经理负责协调和监控，确保项目按时高质量交付。同时，我们注重与客户的沟通，及时反馈进展情况。'
    },
    {
      question: '你们如何处理项目的后期维护和迭代？',
      answer: '我们将产品上线视为合作的开始，而非结束。我们提供持续的技术支持和迭代服务，通过数据分析和用户反馈，不断优化产品体验。我们可以根据客户需求，提供不同层级的维护和迭代方案。'
    },
    {
      question: '如何开始一个项目合作？',
      answer: '首先，我们会安排一次初步的沟通，了解您的需求和目标。然后，我们会进行详细的需求分析和评估，制定项目计划和报价。在达成合作意向后，我们会签订正式合同并启动项目。整个过程透明公开，确保双方对项目有清晰的理解。'
    }
  ]

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-32 px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-20">
          <p
            data-aos="fade-up"
            className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6"
          >
            常见问题
          </p>
          <h2
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-3xl font-bold tracking-tight text-primary md:text-5xl text-balance"
          >
            你可能想知道
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FaqCard 
              key={index} 
              faq={faq} 
              index={index}
              isOpen={openIndex === index}
              onToggle={() => toggleFaq(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqCard({ faq, index, isOpen, onToggle }: { faq: any; index: number; isOpen: boolean; onToggle: () => void }) {
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
      data-aos="fade-up"
      data-aos-delay={100 + index * 100}
      className="group relative rounded-lg border border-border bg-card overflow-hidden transition-all duration-300 hover:border-muted-foreground/30 hover:bg-accent/50"
    >
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-lg transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(224, 112, 32, 0.15), transparent 60%)`,
            opacity: 1
          }}
        />
      )}
      <div className="relative z-10">
        <button
          onClick={onToggle}
          className="w-full flex justify-between items-center p-6 text-left font-medium text-primary hover:bg-card/50 transition-colors"
        >
          <span>{faq.question}</span>
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            {isOpen ? (
              <ChevronUp size={20} className="text-primary" />
            ) : (
              <ChevronDown size={20} className="text-primary" />
            )}
          </div>
        </button>
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="p-6 pt-0 text-muted-foreground">
            <p>{faq.answer}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

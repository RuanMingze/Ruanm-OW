'use client'

import { useEffect, useRef, useState } from 'react'
import { ReactNode } from 'react'

interface CardWithGlowEffectProps {
  children: ReactNode
  className?: string
}

export function CardWithGlowEffect({ children, className = '' }: CardWithGlowEffectProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      
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
      className={`relative ${className}`}
    >
      {isHovered && (
        <div 
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(224, 112, 32, 0.15), transparent 60%)`,
            opacity: 1,
            borderRadius: '0.75rem'
          }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

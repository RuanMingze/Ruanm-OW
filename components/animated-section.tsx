"use client"

import { useEffect, useRef } from "react"

export function AnimatedSection({ children, className = "", id = "" }: { children: React.ReactNode; className?: string; id?: string }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && sectionRef.current) {
      const elements = sectionRef.current.querySelectorAll('[data-aos]')
      elements.forEach(el => {
        el.setAttribute('data-aos', el.getAttribute('data-aos') || '')
        if (el.hasAttribute('data-aos-delay')) {
          el.setAttribute('data-aos-delay', el.getAttribute('data-aos-delay') || '')
        }
      })
    }
  }, [])

  return (
    <section ref={sectionRef as any} id={id} className={className}>
      {children}
    </section>
  )
}

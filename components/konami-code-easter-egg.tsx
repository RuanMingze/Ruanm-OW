'use client'

import { useState, useEffect } from 'react'

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA'
]

export function KonamiCodeEasterEgg() {
  const [inputSequence, setInputSequence] = useState<string[]>([])
  const [triggered, setTriggered] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setInputSequence((prev: string[]) => {
        const newSequence = [...prev, event.code].slice(-KONAMI_CODE.length)
        
        if (newSequence.join(',') === KONAMI_CODE.join(',')) {
          setTriggered(true)
          setShowMessage(true)
          setTimeout(() => setShowMessage(false), 3000)
          return []
        }
        
        return newSequence
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (triggered) {
      document.body.style.transition = 'transform 0.5s ease-in-out'
      document.body.style.transform = 'rotate(360deg)'
      
      setTimeout(() => {
        document.body.style.transform = 'rotate(0deg)'
      }, 500)

      const colors = ['#e07020', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9']
      let colorIndex = 0
      
      const colorInterval = setInterval(() => {
        Array.from(document.querySelectorAll('h1, h2, h3, p, span, a')).forEach((el) => {
          ;(el as HTMLElement).style.transition = 'color 0.3s ease'
          ;(el as HTMLElement).style.color = colors[colorIndex % colors.length]
        })
        
        Array.from(document.querySelectorAll('img')).forEach((el) => {
          ;(el as HTMLElement).style.transition = 'filter 0.3s ease'
          ;(el as HTMLElement).style.filter = `drop-shadow(0 0 8px ${colors[colorIndex % colors.length]})`
        })
        
        colorIndex++
      }, 300)

      setTimeout(() => {
        clearInterval(colorInterval)
        Array.from(document.querySelectorAll('h1, h2, h3, p, span, a')).forEach((el) => {
          ;(el as HTMLElement).style.color = ''
        })
        Array.from(document.querySelectorAll('img')).forEach((el) => {
          ;(el as HTMLElement).style.filter = ''
        })
        setTriggered(false)
      }, 124000)
    }
  }, [triggered])

  if (!showMessage) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-lg shadow-2xl animate-bounce">
        <p className="text-2xl font-bold">
          你发现了隐藏的宝藏！
        </p>
        <p className="text-sm mt-2 opacity-90">
          恭喜你找到了 Konami Code 彩蛋
        </p>
      </div>
    </div>
  )
}

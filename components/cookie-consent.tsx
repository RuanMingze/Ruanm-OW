'use client'

import { useState, useEffect } from 'react'
import { X, Cookie as CookieIcon } from 'lucide-react'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAccepted, setHasAccepted] = useState(false)

  useEffect(() => {
    const checkCookieConsent = () => {
      const consent = localStorage.getItem('cookie-consent')
      if (!consent) {
        setIsVisible(true)
      } else {
        setHasAccepted(consent === 'accepted')
      }
    }

    checkCookieConsent()
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setCookie('cookie-consent', 'accepted', 365)
    setHasAccepted(true)
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setCookie('cookie-consent', 'declined', 365)
    setIsVisible(false)
  }

  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="w-96 bg-card border border-border rounded-xl shadow-2xl p-5 relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center">
              <CookieIcon className="w-6 h-6 text-primary" />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-base font-bold text-primary mb-2">
                Cookie 使用说明
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                我们使用 Cookie 来改善您的浏览体验、分析网站使用情况并提供个性化内容。
                您可以选择接受或拒绝 Cookie。
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleAccept}
                className="w-full bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
              >
                接受 Cookie
              </button>
              <button
                onClick={handleDecline}
                className="w-full bg-secondary text-secondary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-secondary/80 transition-colors text-sm"
              >
                拒绝 Cookie
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              了解更多信息请查看
              <a href={`${basePath}/privacy`} className="text-primary hover:underline ml-1">
                隐私政策
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

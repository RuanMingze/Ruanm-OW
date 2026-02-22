"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    setIsAnimating(true)
    setTheme(theme === "dark" ? "light" : "dark")
    setTimeout(() => setIsAnimating(false), 500)
  }

  if (!mounted) {
    return (
      <button
        className="flex items-center justify-center rounded-full border border-border px-4 py-2 text-primary hover:bg-accent transition-colors duration-300"
        aria-label="切换主题"
      >
        <div className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center justify-center rounded-full border border-border px-4 py-2 text-primary hover:bg-accent transition-all duration-300 ${
        isAnimating ? 'scale-110' : 'scale-100'
      }`}
      aria-label="切换主题"
    >
      <div className={`relative w-5 h-5 transition-all duration-500 ${isAnimating ? 'rotate-180' : 'rotate-0'}`}>
        {theme === "dark" ? (
          <Sun className="absolute inset-0 w-5 h-5 transition-all duration-500" />
        ) : (
          <Moon className="absolute inset-0 w-5 h-5 transition-all duration-500" />
        )}
      </div>
    </button>
  )
}

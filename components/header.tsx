"use client"

import { useState, useEffect } from "react"
import { Menu, X, Search, X as CloseIcon, LogIn, User } from "lucide-react"
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import supabase from '@/lib/supabase'
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
console.log('Header - NEXT_PUBLIC_BASE_PATH:', process.env.NEXT_PUBLIC_BASE_PATH)
console.log('Header - basePath:', basePath)

const navLinks = [
  { label: "关于", href: "#about" },
  { label: "理念", href: "#philosophy" },
  { label: "服务", href: "#services" },
  { label: "产品", href: "/products" },
  { label: "联系", href: "#contact" },
  { label: "Issue", href: "/issue" },
]

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<any>(null)
  const [userAvatar, setUserAvatar] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const userProfileStr = localStorage.getItem('userProfile')
      if (userProfileStr) {
        const userProfileData = JSON.parse(userProfileStr)
        const mockUser = {
          id: userProfileData.id || 'local-user',
          email: userProfileData.email,
          user_metadata: {
            username: userProfileData.name
          }
        }
        setUser(mockUser)
        setUserAvatar(userProfileData.avatar_url || '')
        return
      }
      
      const { data } = await supabase.auth.getSession()
      const session = data?.session
      
      if (session?.user) {
        setUser(session.user)
        
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('avatar_url')
            .eq('email', session.user.email)
            .single()
          
          if (profile?.avatar_url) {
            setUserAvatar(profile.avatar_url)
          }
        } catch (err) {
          console.warn('获取用户头像失败:', err)
        }
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4 lg:px-8">
        <a href={`${basePath}/`} className="flex items-center gap-3">
          <img
            src={`${basePath}/logo.png`}
            alt="Ruanm Logo"
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold tracking-tight text-primary">
            Ruanm
          </span>
        </a>

        <nav className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-8 hidden md:flex" aria-label="Main navigation">
            {navLinks.map((link: any) => {
              if (link.label === "产品" && pathname === `${basePath}/products`) return null
              if (link.label === "Issue" && pathname === `${basePath}/issue`) return null
              
              let href
              if (link.href.startsWith('#')) {
                if (pathname === `${basePath}/products` || pathname === `${basePath}/feedback`) {
                  href = `${basePath}/${link.href}`
                } else {
                  href = link.href
                }
              } else {
                href = `${basePath}${link.href}`
              }
              
              return (
                <a
                  key={link.href}
                  href={href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  {link.label}
                </a>
              )
            })}
          </nav>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center justify-center rounded-full border border-border px-4 py-2 text-primary hover:bg-accent transition-colors duration-300"
            aria-label="搜索产品"
          >
            <Search size={18} />
          </button>
          <ThemeToggle />
          {mounted && user ? (
            <a
              href={`${basePath}/user`}
              className="relative flex items-center justify-center w-10 h-10 rounded-full border border-border overflow-hidden hover:bg-accent transition-colors duration-300"
              aria-label="用户中心"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="用户头像"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const fallback = target.parentElement?.querySelector('.fallback-avatar')
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex'
                    }
                  }}
                />
              ) : null}
              <div className={`fallback-avatar absolute inset-0 flex items-center justify-center bg-primary/10 ${userAvatar ? 'hidden' : 'flex'}`}>
                <User size={18} className="text-primary" />
              </div>
            </a>
          ) : (
            <a
              href={`${basePath}/login`}
              className="flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm text-primary hover:bg-accent transition-colors duration-300"
              aria-label="登录"
            >
              <LogIn size={16} />
              登录
            </a>
          )}
          <a
            href={`${basePath}/feedback`}
            className="inline-flex items-center rounded-full border border-border px-5 py-2 text-sm text-primary hover:bg-accent transition-colors duration-300"
          >
            取得联系
          </a>
        </div>

        {searchOpen && (
          <div className="absolute top-full left-0 right-0 border-b border-border bg-background/95 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `${basePath}/products?search=${encodeURIComponent(searchQuery)}`
                    }
                  }}
                  placeholder="搜索产品..."
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (searchQuery.trim()) {
                      window.location.href = `${basePath}/products?search=${encodeURIComponent(searchQuery)}`
                    }
                  }}
                  className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  搜索
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          className="md:hidden text-primary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <nav className="flex flex-col px-6 py-6 gap-4" aria-label="Mobile navigation">
            {navLinks.map((link: any) => {
              if (link.label === "产品" && pathname === `${basePath}/products`) return null
              if (link.label === "Issue" && pathname === `${basePath}/issue`) return null
              let href
              if (link.href.startsWith('#')) {
                if (pathname === `${basePath}/products`) {
                  href = `${basePath}/${link.href}`
                } else {
                  href = link.href
                }
              } else {
                href = `${basePath}${link.href}`
              }
              
              return (
                <a
                  key={link.href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              )
            })}
            {mounted && user ? (
              <a
                href={`${basePath}/user`}
                onClick={() => setMobileOpen(false)}
                className="relative mt-2 inline-flex items-center justify-center w-10 h-10 rounded-full border border-border overflow-hidden hover:bg-accent transition-colors"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="用户头像"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const fallback = target.parentElement?.querySelector('.mobile-fallback-avatar')
                      if (fallback) {
                        (fallback as HTMLElement).style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div className={`mobile-fallback-avatar absolute inset-0 flex items-center justify-center bg-primary/10 ${userAvatar ? 'hidden' : 'flex'}`}>
                  <User size={18} className="text-primary" />
                </div>
              </a>
            ) : (
              <a
                href={`${basePath}/login`}
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm text-primary hover:bg-accent transition-colors"
              >
                <LogIn size={18} />
                登录
              </a>
            )}
            <div className="mt-2">
              <ThemeToggle />
            </div>
            <a
              href={`${basePath}/feedback`}
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm text-primary hover:bg-accent transition-colors"
            >
              取得联系
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Menu, X, Search, X as CloseIcon, LogIn, User } from "lucide-react"
import { usePathname } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pyywrxrmtehucmkpqkdi.supabase.co'
const supabaseKey = 'sb_publishable_Ztie93n2pi48h_rAIuviyA_ftjAIDuj'
const supabase = createClient(supabaseUrl, supabaseKey)

const navLinks = [
  { label: "关于", href: "#about" },
  { label: "理念", href: "#philosophy" },
  { label: "服务", href: "#services" },
  { label: "产品", href: "/products" },
  { label: "联系", href: "#contact" },
]

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4 lg:px-8">
        <a href="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Ruanm Logo"
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold tracking-tight text-primary">
            Ruanm
          </span>
        </a>

        <nav className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-8 hidden md:flex" aria-label="Main navigation">
          {navLinks.map((link) => {
            if (link.label === "产品" && pathname === '/products') return null
            const href = pathname === '/products' && link.href.startsWith('#') 
              ? `/${link.href}` 
              : link.href.startsWith('#') && pathname !== '/' 
              ? `/${link.href}`
              : link.href
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
          {mounted && user ? (
            <a
              href="/user"
              className="flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm text-primary hover:bg-accent transition-colors duration-300"
              aria-label="用户中心"
            >
              <User size={16} />
              {user.user_metadata?.username || user.email?.split('@')[0] || '用户'}
            </a>
          ) : (
            <a
              href="/login"
              className="flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm text-primary hover:bg-accent transition-colors duration-300"
              aria-label="登录"
            >
              <LogIn size={16} />
              登录
            </a>
          )}
          <a
            href="mailto:xmt20160124@outlook.com"
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
                      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
                    }
                  }}
                  placeholder="搜索产品..."
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (searchQuery.trim()) {
                      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
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
            {navLinks.map((link) => {
              if (link.label === "产品" && pathname === '/products') return null
              const href = pathname === '/products' && link.href.startsWith('#') 
                ? `/${link.href}` 
                : link.href.startsWith('#') && pathname !== '/' 
                ? `/${link.href}`
                : link.href
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
                href="/user"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm text-primary hover:bg-accent transition-colors"
              >
                <User size={18} />
                {user.user_metadata?.username || user.email?.split('@')[0] || '用户'}
              </a>
            ) : (
              <a
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm text-primary hover:bg-accent transition-colors"
              >
                <LogIn size={18} />
                登录
              </a>
            )}
            <a
              href="mailto:xmt20160124@outlook.com"
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

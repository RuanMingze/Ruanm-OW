'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Search, ArrowLeft, AlertCircle } from 'lucide-react'
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function NotFoundPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`${basePath}/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center">
        <div className="max-w-lg w-full text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertCircle size={48} className="text-red-500" />
            </div>
            
            <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl font-bold text-primary mb-4">页面不存在</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              啊呜~这个页面被恐龙吃掉了！
              <br />
              你访问的页面不存在或已被移除。
            </p>
          </div>

          <div className="mb-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索产品..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </form>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-primary hover:bg-card/50 transition-colors font-medium"
            >
              <ArrowLeft size={16} />
              返回上一页
            </button>
            <button
              onClick={() => router.push(`${basePath}/`)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              <Home size={16} />
              返回主页
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
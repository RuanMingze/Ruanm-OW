'use client'

import { useRouter } from 'next/navigation'
import { Shield, Home, ArrowLeft } from 'lucide-react'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function ForbiddenPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 mb-6">
          <Shield size={48} className="text-red-500" />
        </div>
        <h1 className="text-6xl font-bold text-primary mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-primary mb-4">无权限访问</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          您没有权限访问此页面。此页面仅限管理员访问。
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push(`${basePath}/`)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            <Home size={20} />
            返回主页
          </button>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-primary hover:bg-card/50 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            返回上一页
          </button>
        </div>
      </div>
    </div>
  )
}

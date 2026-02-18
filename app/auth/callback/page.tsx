'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, LogIn, Home, Mail } from 'lucide-react'

const supabaseUrl = 'https://pyywrxrmtehucmkpqkdi.supabase.co'
const supabaseKey = 'sb_publishable_Ztie93n2pi48h_rAIuviyA_ftjAIDuj'
const supabase = createClient(supabaseUrl, supabaseKey)

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    handleCallback()
  }, [])

  const handleCallback = async () => {
    try {
      setStatus('loading')
      setMessage('正在处理登录，请稍候...')

      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      if (!data.session) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError || !refreshData.session) {
          throw new Error('登录会话无效')
        }
      }

      setStatus('success')
      setMessage('登录成功！正在跳转...')

      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err: any) {
      console.error('回调处理失败:', err)
      setStatus('error')
      setMessage(err.message || '登录失败，请重试')
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-32">
      <div className="w-full max-w-md">
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-3xl p-12 shadow-2xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-8 flex items-center justify-center gap-3">
              <LogIn size={40} className="text-primary" />
              登录回调
            </h1>

            {status === 'loading' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
                <p className="text-lg text-muted-foreground">
                  {message}
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <CheckCircle size={64} className="text-green-500" />
                </div>
                <p className="text-lg text-muted-foreground">
                  {message}
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <XCircle size={64} className="text-destructive" />
                </div>
                <p className="text-lg text-destructive mb-4">
                  {message}
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                  >
                    <Mail size={18} />
                    重新登录
                  </a>
                  <a
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-accent transition-all duration-300"
                  >
                    <Home size={18} />
                    返回首页
                  </a>
                </div>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                © 2026 Ruanm Studio. 用户体验至上的好产品
              </p>
              <div className="flex items-center justify-center gap-4">
                <a
                  href="/"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  首页
                </a>
                <a
                  href="/contact"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  联系我们
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

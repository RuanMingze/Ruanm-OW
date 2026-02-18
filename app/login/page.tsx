'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Github, User, LogOut } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pyywrxrmtehucmkpqkdi.supabase.co'
const supabaseKey = 'sb_publishable_Ztie93n2pi48h_rAIuviyA_ftjAIDuj'
const supabase = createClient(supabaseUrl, supabaseKey)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkSession()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      router.push('/user')
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim() || !password.trim()) {
      setError('邮箱和密码为必填项')
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (error) throw error

      router.push('/user')
    } catch (err: any) {
      console.error('登录失败:', err)
      if (err.message?.includes('Invalid login credentials')) {
        setError('邮箱或密码错误')
      } else {
        setError('登录失败：' + (err.message || '未知错误'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGithubLogin = async () => {
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      console.error('GitHub登录失败:', err)
      setError('GitHub登录失败：' + (err.message || '未知错误'))
    }
  }

  const handleLogout = async () => {
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setSuccess('退出登录成功！')
    } catch (err: any) {
      console.error('退出失败:', err)
      setError('退出失败：' + (err.message || '未知错误'))
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-32">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              账号登录
            </h1>
            <p className="text-muted-foreground">
              登录您的账号以访问更多功能
            </p>
          </div>

          {user ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 p-6 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={32} className="text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">用户名</p>
                  <p className="font-medium text-primary">
                    {user.email?.split('@')[0] || '未知用户'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {user.email || '未绑定邮箱'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-destructive px-6 py-3 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <LogOut size={18} />
                退出登录
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                  邮箱
                </label>
                <div className="relative">
                  <Mail 
                    size={18} 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock 
                    size={18} 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive text-center">
                    {error}
                  </p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-600 text-center">
                    {success}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    登录中...
                  </>
                ) : (
                  <>
                    <LogOut size={18} className="rotate-180" />
                    登录账号
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">或</span>
                </div>
              </div>

              <div className="relative group">
                <button
                  type="button"
                  disabled
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-muted px-6 py-3 text-sm font-medium text-muted-foreground cursor-not-allowed transition-all duration-300"
                >
                  <Github size={18} />
                  使用GitHub登录
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-popover text-popover-foreground px-3 py-2 rounded-lg text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <p>由于技术原因，此功能暂时不可用</p>
                </div>
              </div>

              <div className="text-center">
                <a
                  href="/register"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  还没有账号？立即注册
                </a>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>登录即表示您同意我们的</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <a href="#" className="text-primary hover:text-primary/80 transition-colors">
              服务条款
            </a>
            <span>和</span>
            <a href="#" className="text-primary hover:text-primary/80 transition-colors">
              隐私政策
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

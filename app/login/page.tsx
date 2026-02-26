'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Github, User, LogOut } from 'lucide-react'
import bcrypt from 'bcryptjs'
import supabase from '@/lib/supabase'
import { Header } from '@/components/header'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mounted, setMounted] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  
  useEffect(() => {
    // 在客户端获取重定向地址
    const searchParams = new URLSearchParams(window.location.search)
    setRedirectUrl(searchParams.get('redirect'))
  }, [])

  useEffect(() => {
    setMounted(true)
    checkSession()
  }, [])
  
  // 登录成功后自动重定向
  useEffect(() => {
    if (loginSuccess && redirectUrl) {
      try {
        // 解码重定向URL
        const decodedRedirectUrl = decodeURIComponent(redirectUrl)
        console.log('登录成功，自动重定向到:', decodedRedirectUrl)
        
        // 检查是否是重定向到授权页面
        const isOAuthRedirect = decodedRedirectUrl.includes('/oauth/authorize')
        
        if (isOAuthRedirect) {
          // 如果是授权页面，立即重定向，不显示登录成功消息
          window.location.href = decodedRedirectUrl
        } else {
          // 延迟一小段时间，让用户看到登录成功的消息
          setTimeout(() => {
            window.location.href = decodedRedirectUrl
          }, 1000)
        }
      } catch (err) {
        console.error('重定向失败:', err)
        // 如果重定向失败，默认去用户中心
        router.push('/user')
      }
    }
  }, [loginSuccess, redirectUrl, router])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim() || !password.trim()) {
      setError('用户名/邮箱和密码为必填项')
      return
    }

    setIsSubmitting(true)

    try {
      let userProfileData = null
      let authSuccess = false

      try {
        console.log('登录 - 准备查询user_profiles，输入:', email.trim())
        
        const supabaseUrl = 'https://pyywrxrmtehucmkpqkdi.supabase.co'
        const supabaseKey = 'sb_publishable_Ztie93n2pi48h_rAIuviyA_ftjAIDuj'
        
        // 先尝试按用户名查询
        let requestUrl = `${supabaseUrl}/rest/v1/user_profiles?select=*&name=eq.${encodeURIComponent(email.trim())}`
        console.log('登录 - 尝试按用户名查询:', requestUrl)
        
        let response = await fetch(requestUrl, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log('登录 - 响应状态:', response.status)
        
        let profile = await response.json()
        console.log('登录 - 从user_profiles读取profile (用户名):', profile)
        
        // 如果用户名查询不到，尝试按全名查询
        if (!profile || profile.length === 0) {
          requestUrl = `${supabaseUrl}/rest/v1/user_profiles?select=*&full_name=eq.${encodeURIComponent(email.trim())}`
          console.log('登录 - 尝试按全名查询:', requestUrl)
          
          response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          })
          
          profile = await response.json()
          console.log('登录 - 从user_profiles读取profile (全名):', profile)
        }
        
        if (profile && profile.length > 0) {
          const passwordMatch = await bcrypt.compare(password.trim(), profile[0].hashed_password)
          console.log('登录 - 密码匹配结果:', passwordMatch)
          if (passwordMatch) {
            userProfileData = profile[0]
            console.log('登录 - 设置userProfileData:', userProfileData)
          }
        }
      } catch (profileError) {
        console.warn('从user_profiles读取失败:', profileError)
      }

      if (!userProfileData) {
        // 如果用户名和全名都查询不到，尝试邮箱登录
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        })

        if (error) throw error
        
        authSuccess = true
        console.log('登录 - Supabase auth登录成功')
      }

      if (userProfileData || authSuccess) {
        if (!userProfileData && authSuccess) {
          try {
            console.log('登录 - auth成功后，尝试从user_profiles读取profile')
            
            const supabaseUrl = 'https://pyywrxrmtehucmkpqkdi.supabase.co'
            const supabaseKey = 'sb_publishable_Ztie93n2pi48h_rAIuviyA_ftjAIDuj'
            const requestUrl = `${supabaseUrl}/rest/v1/user_profiles?select=*&email=eq.${encodeURIComponent(email.trim())}`
            
            console.log('登录 - auth成功后请求URL:', requestUrl)
            
            const response = await fetch(requestUrl, {
              method: 'GET',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              }
            })
            
            console.log('登录 - auth成功后响应状态:', response.status)
            
            const profile = await response.json()
            console.log('登录 - auth成功后读取到的profile:', profile)
            
            if (profile && profile.length > 0) {
              userProfileData = profile[0]
            }
          } catch (profileError) {
            console.warn('读取user_profiles失败:', profileError)
          }
        }

        console.log('登录 - 最终userProfileData:', userProfileData)
        
        if (userProfileData) {
          console.log('登录 - 存储userProfile到localStorage:', userProfileData)
          localStorage.setItem('userProfile', JSON.stringify(userProfileData))
          console.log('登录 - userProfile已存储到localStorage')
        } else {
          console.warn('登录 - userProfileData为空，无法存储到localStorage')
        }

        setUserProfile(userProfileData)
        setLoginSuccess(true)
      } else {
        setError('邮箱或密码错误')
      }
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
          redirectTo: `${window.location.origin}${basePath}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      console.error('GitHub登录失败:', err)
      setError('GitHub登录失败：' + (err.message || '未知错误'))
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      <Header />
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

            {loginSuccess && redirectUrl && redirectUrl.includes('/oauth/authorize') ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-primary mb-2">
                  正在授权...
                </h2>
                <p className="text-muted-foreground">
                  登录成功，正在跳转到授权页面...
                </p>
              </div>
            ) : loginSuccess ? (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-2">
                    登录成功！
                  </h2>
                  <p className="text-muted-foreground">
                    欢迎回来，{userProfile?.name || email.split('@')[0]}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/user')}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                  >
                    <User size={18} />
                    去用户中心
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-accent transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    返回首页
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                    邮箱或用户名
                  </label>
                  <div className="relative">
                    <Mail 
                      size={18} 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="请输入邮箱或用户名"
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
                  <div className="text-right mt-2">
                    <a
                      href={`${basePath}/forgot-password`}
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      忘记密码？
                    </a>
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

                <div className="text-center">
                  <a
                    href={`${basePath}/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
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
              <a href={`${basePath}/terms`} className="text-primary hover:text-primary/80 transition-colors">
                服务条款
              </a>
              <span>和</span>
              <a href={`${basePath}/privacy`} className="text-primary hover:text-primary/80 transition-colors">
                隐私政策
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
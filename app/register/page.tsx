'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, UserPlus, LogIn } from 'lucide-react'
import bcrypt from 'bcryptjs'
import supabase from '@/lib/supabase'
import { Header } from '@/components/header'

// 处理环境变量为空的情况，确保路径拼接安全
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState<string>('')
  const [fullName, setFullName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [generatedCode, setGeneratedCode] = useState<string>('')
  const [countdown, setCountdown] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [mounted, setMounted] = useState<boolean>(false)
  const [isSendingCode, setIsSendingCode] = useState<boolean>(false)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)

  useEffect(() => {
    // 在客户端获取重定向地址
    const searchParams = new URLSearchParams(window.location.search)
    setRedirectUrl(searchParams.get('redirect'))
  }, [])

  useEffect(() => {
    setMounted(true)
    const fetchSession = async () => {
      await checkSession()
    }
    fetchSession()
  }, [])

  // 注册成功后自动重定向
  useEffect(() => {
    if (loginSuccess && redirectUrl) {
      try {
        // 解码重定向URL
        const decodedRedirectUrl = decodeURIComponent(redirectUrl)
        console.log('注册成功，自动重定向到:', decodedRedirectUrl)
        
        // 检查是否是重定向到授权页面
        const isOAuthRedirect = decodedRedirectUrl.includes('/oauth/authorize')
        
        if (isOAuthRedirect) {
          // 如果是授权页面，立即重定向
          window.location.href = decodedRedirectUrl
        }
      } catch (err) {
        console.error('重定向失败:', err)
      }
    }
  }, [loginSuccess, redirectUrl])

  // 倒计时效果
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [countdown])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      router.push('/user')
    }
  }

  // 发送验证码
  const sendVerificationCode = async () => {
    if (countdown > 0) return
    if (!email.trim()) {
      setError('请先输入邮箱')
      return
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('请输入有效的邮箱地址')
      return
    }

    // 检测邮箱后缀，暂时只允许Outlook邮箱
    const outlookRegex = /@outlook\.com$/i
    if (!outlookRegex.test(email.trim())) {
      setError('暂时仅支持Outlook邮箱')
      return
    }

    setIsSendingCode(true)
    setError('')

    try {
      // 生成6位随机验证码
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedCode(code)

      // 调用邮件发送接口
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reply_to: email.trim(),
          subject: '[Ruanm] 注册验证码',
          text: `您的注册验证码是：${code}\n\n此验证码60秒内有效，请尽快完成注册。`,
          html: `<h2>注册验证码</h2><p>您的注册验证码是：<strong>${code}</strong></p><p>此验证码60秒内有效，请尽快完成注册。</p>`
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '发送验证码失败')
      }

      // 开始倒计时
      setCountdown(60)
      setSuccess('验证码已发送，请查看邮箱')
    } catch (err: any) {
      console.error('发送验证码失败:', err)
      setError('发送验证码失败：' + (err.message || '未知错误'))
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim() || !email.trim() || !password.trim() || !verificationCode.trim()) {
      setError('用户名、邮箱、密码、验证码为必填项')
      return
    }

    if (password.length < 6) {
      setError('密码长度至少6位')
      return
    }

    // 验证验证码
    if (verificationCode !== generatedCode) {
      setError('验证码错误')
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}${basePath}/auth/callback`,
          data: {
            username: username.trim(),
            full_name: fullName.trim() || username.trim(),
          },
        },
      })

      if (authError) throw authError

      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password.trim(), saltRounds)

      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          name: username.trim(),
          email: email.trim(),
          hashed_password: hashedPassword,
          has_beta_access: false,
        })

      if (insertError) throw insertError

      // 注册成功后自动登录
      try {
        // 查询用户信息
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', email.trim())
          .single()

        if (profile) {
          // 将用户信息存储到localStorage
          localStorage.setItem('userProfile', JSON.stringify(profile))
          setUserProfile(profile)
          setLoginSuccess(true)
          setSuccess('')
        }
      } catch (loginError) {
        console.error('自动登录失败:', loginError)
        // 自动登录失败不影响注册成功的消息
        setSuccess('注册成功！请登录')
      }

      setUsername('')
      setFullName('')
      setEmail('')
      setPassword('')
      setVerificationCode('')
      setGeneratedCode('')
    } catch (err: unknown) {
      console.error('注册失败:', err)
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      
      if (errorMessage.includes('Email already registered') || errorMessage.includes('User already registered')) {
        setError('该邮箱已注册，请直接登录')
      } else if (errorMessage.includes('Invalid email')) {
        setError('邮箱格式不正确')
      } else {
        setError(`注册失败：${errorMessage}`)
      }
    } finally {
      setIsSubmitting(false)
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
                创建账号
              </h1>
              <p className="text-muted-foreground">
                注册您的账号以访问更多功能
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
                  注册成功，正在跳转到授权页面...
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
                    注册成功！
                  </h2>
                  <p className="text-muted-foreground">
                    欢迎，{userProfile?.name || email.split('@')[0]}
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
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-primary mb-2">
                    用户名
                  </label>
                  <div className="relative">
                    <User 
                      size={18} 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="请输入用户名"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-primary mb-2">
                    全名（选填）
                  </label>
                  <div className="relative">
                    <UserPlus 
                      size={18} 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      id="full_name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="请输入全名（选填）"
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                </div>

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
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-primary mb-2">
                    邮箱验证码
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        id="verificationCode"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="请输入验证码"
                        required
                        maxLength={6}
                        className="w-full pl-4 pr-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={sendVerificationCode}
                      disabled={isSendingCode || countdown > 0}
                      className="px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isSendingCode ? (
                        '发送中...'
                      ) : countdown > 0 ? (
                        `${countdown}秒后重发`
                      ) : (
                        '发送验证码'
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                    密码（至少6位）
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
                      placeholder="请输入密码（至少6位）"
                      required
                      minLength={6}
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
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm text-success text-center">
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
                      注册中...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      注册账号
                    </>
                  )}
                </button>

                <div className="text-center">
                  <a
                    href={`${basePath}/login`}
                    className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                  >
                    <LogIn size={14} />
                    已有账号？前往登录
                  </a>
                </div>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>注册即表示您同意我们的</p>
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
      </div>
    </>
  )
}
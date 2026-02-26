'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, ArrowLeft, Key } from 'lucide-react'
import bcrypt from 'bcryptjs'
import supabase from '@/lib/supabase'
import { Header } from '@/components/header'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [username, setUsername] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [generatedCode, setGeneratedCode] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSendingCode, setIsSendingCode] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [mounted, setMounted] = useState<boolean>(false)
  const [countdown, setCountdown] = useState<number>(0)
  const [step, setStep] = useState<number>(1)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 倒计时效果
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [countdown])

  // 发送验证码
  const sendVerificationCode = async () => {
    if (countdown > 0) return
    if (!username.trim() || !email.trim()) {
      setError('请先输入账户名和邮箱')
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
      // 检查用户是否存在
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('name', username.trim())
        .eq('email', email.trim())
        .single()

      if (profileError || !profile) {
        throw new Error('账户名和邮箱不匹配')
      }

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
          subject: '[Ruanm] 重置密码验证码',
          text: `您的重置密码验证码是：${code}\n\n此验证码60秒内有效，请尽快完成密码重置。`,
          html: `<h2>重置密码验证码</h2><p>您的重置密码验证码是：<strong>${code}</strong></p><p>此验证码60秒内有效，请尽快完成密码重置。</p>`
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

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim() || !email.trim() || !verificationCode.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('所有字段为必填项')
      return
    }

    if (newPassword.length < 6) {
      setError('密码长度至少6位')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    // 验证验证码
    if (verificationCode !== generatedCode) {
      setError('验证码错误')
      return
    }

    setIsSubmitting(true)

    try {
      // 检查用户是否存在
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('name', username.trim())
        .eq('email', email.trim())
        .single()

      if (profileError || !profile) {
        throw new Error('账户名和邮箱不匹配')
      }

      // 加密新密码
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(newPassword.trim(), saltRounds)

      // 更新密码
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          hashed_password: hashedPassword,
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setSuccess('密码重置成功！请使用新密码登录')
      setUsername('')
      setEmail('')
      setVerificationCode('')
      setNewPassword('')
      setConfirmPassword('')
      setGeneratedCode('')

      // 延迟跳转到登录页面
      setTimeout(() => {
        router.push(`${basePath}/login`)
      }, 2000)
    } catch (err: unknown) {
      console.error('重置密码失败:', err)
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError(`重置密码失败：${errorMessage}`)
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
                重置密码
              </h1>
              <p className="text-muted-foreground">
                输入账户信息以重置密码
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-primary mb-2">
                  账户名
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
                    placeholder="请输入账户名"
                    required
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
                <label htmlFor="newPassword" className="block text-sm font-medium text-primary mb-2">
                  新密码（至少6位）
                </label>
                <div className="relative">
                  <Lock 
                    size={18} 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="请输入新密码"
                    required
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary mb-2">
                  确认新密码
                </label>
                <div className="relative">
                  <Key 
                    size={18} 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入新密码"
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
                    重置中...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    重置密码
                  </>
                )}
              </button>

              <div className="text-center">
                <a
                  href={`${basePath}/login`}
                  className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  返回登录
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

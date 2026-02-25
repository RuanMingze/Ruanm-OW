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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    const fetchSession = async () => {
      await checkSession()
    }
    fetchSession()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      router.push('/user')
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('用户名、邮箱、密码为必填项')
      return
    }

    if (password.length < 6) {
      setError('密码长度至少6位')
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

      setSuccess('注册成功！请登录')
      setUsername('')
      setFullName('')
      setEmail('')
      setPassword('')
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-32">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                创建账号
              </h1>
              <p className="text-gray-500">
                注册您的账号以访问更多功能
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-900 mb-2">
                  用户名
                </label>
                <div className="relative">
                  <User 
                    size={18} 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                  />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-900 mb-2">
                  全名（选填）
                </label>
                <div className="relative">
                  <UserPlus 
                    size={18} 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                  />
                  <input
                    id="full_name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="请输入全名（选填）"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  邮箱
                </label>
                <div className="relative">
                  <Mail 
                    size={18} 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                  密码（至少6位）
                </label>
                <div className="relative">
                  <Lock 
                    size={18} 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码（至少6位）"
                    required
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">
                    {error}
                  </p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600 text-center">
                    {success}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                >
                  <LogIn size={14} />
                  已有账号？前往登录
                </a>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>注册即表示您同意我们的</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <a href={`${basePath}/terms`} className="text-blue-600 hover:text-blue-700 transition-colors">
                  服务条款
                </a>
                <span>和</span>
                <a href={`${basePath}/privacy`} className="text-blue-600 hover:text-blue-700 transition-colors">
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
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Mail, Send, User } from 'lucide-react'
import supabase from '@/lib/supabase'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function FeedbackPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
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
        setUser({
          name: userProfileData.name,
          email: userProfileData.email
        })
        setFormData(prev => ({
          ...prev,
          name: userProfileData.name,
          email: userProfileData.email
        }))
        return
      }
      
      const { data } = await supabase.auth.getSession()
      const session = data?.session
      
      if (session?.user) {
        const userProfile = session.user
        setUser({
          name: userProfile.user_metadata?.username || userProfile.email?.split('@')[0] || '',
          email: userProfile.email || ''
        })
        setFormData(prev => ({
          ...prev,
          name: userProfile.user_metadata?.username || userProfile.email?.split('@')[0] || '',
          email: userProfile.email || ''
        }))
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccess('')
    setError('')

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reply_to: formData.email,
          subject: `[反馈] ${formData.subject}`,
          text: `姓名：${formData.name}\n邮箱：${formData.email}\n\n反馈内容：\n${formData.message}`,
          html: `<h2>反馈：${formData.subject}</h2><p><strong>姓名：</strong>${formData.name}</p><p><strong>邮箱：</strong>${formData.email}</p><p><strong>反馈内容：</strong></p><p>${formData.message.replace(/\n/g, '<br />')}</p>`
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '发送邮件失败')
      }

      setSuccess('反馈发送成功！我们会尽快回复您。')
      
      // 重置表单
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: ''
      })
      
    } catch (err: any) {
      console.error('发送反馈失败:', err)
      setError('发送反馈失败：' + (err.message || '未知错误'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12 px-6">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-primary mb-4">
              意见反馈
            </h1>
            <p className="text-lg text-muted-foreground">
              您的意见对我们非常重要，请告诉我们您的想法
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
                  姓名
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="请输入您的姓名"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                  邮箱
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="请输入您的邮箱"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-primary mb-2">
                  主题
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="请输入反馈主题"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-primary mb-2">
                  反馈内容
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="请详细描述您的意见或建议"
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    处理中...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    发送反馈
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                点击发送后，我们会直接收到您的反馈，无需打开邮件客户端
              </p>
            </div>

            {success && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg">
                {success}
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

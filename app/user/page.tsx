'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { User, Mail, LogOut, ExternalLink, Settings, Shield, CheckCircle, Clock, Home } from 'lucide-react'

const supabaseUrl = 'https://pyywrxrmtehucmkpqkdi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eXdyeHJtdGVodWNta3Bxa2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwOTM0NjYsImV4cCI6MjA4NTY2OTQ2Nn0.Xqv6ntl82CtzdMULQxxMXpygFvK54W1mFyQfShYV6Pc'
const supabase = createClient(supabaseUrl, supabaseKey)

const products: Record<string, string> = {
  paperstation: 'PaperStation 浏览器',
  screensaver: 'RuanmScreenSaver 屏保程序',
  toolbox: '阮铭泽工具箱',
  ai: '小R AI助手',
  search: 'ChickRubGo搜索引擎',
}

export default function UserCenterPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [betaQualified, setBetaQualified] = useState(false)
  const [betaApplication, setBetaApplication] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    checkSession()
    checkBetaQualification()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      } else {
        router.push('/login')
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const checkBetaQualification = () => {
    try {
      const applicationStr = localStorage.getItem('betaApplication')
      if (applicationStr) {
        const application = JSON.parse(applicationStr)
        const now = Date.now()
        const threeHours = 3 * 60 * 60 * 1000
        
        if (now - application.timestamp >= threeHours) {
          setBetaQualified(true)
          localStorage.setItem('betaQualified', 'true')
        }
        
        setBetaApplication(application)
      } else {
        const qualified = localStorage.getItem('betaQualified')
        if (qualified === 'true') {
          setBetaQualified(true)
        }
      }
    } catch (err) {
      console.error('检查Beta资格失败:', err)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (err) {
      console.error('登出失败:', err)
    }
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-6 py-32">
      <div className="mx-auto max-w-4xl">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              用户中心
            </h1>
            <p className="text-muted-foreground">
              管理您的账户和访问权限
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={48} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">用户名</p>
              <p className="text-2xl font-bold text-primary">
                {user?.user_metadata?.username || user?.email?.split('@')[0] || '未知用户'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {user?.email || '未绑定邮箱'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Shield size={20} />
                Beta 测试
              </h2>
              {betaQualified ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={20} />
                    <span className="font-medium">已获得 Beta 测试资格</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    恭喜您！您已成功获得 Beta 测试资格，可以开始体验最新功能了。
                  </p>
                  {betaApplication && (
                    <div className="text-sm text-muted-foreground bg-background p-3 rounded-lg">
                      <p className="font-medium mb-1">申请信息：</p>
                      <p>申请产品：{products[betaApplication.product] || betaApplication.product}</p>
                      <p>申请时间：{new Date(betaApplication.timestamp).toLocaleString('zh-CN')}</p>
                    </div>
                  )}
                  <a
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 transition-all duration-300"
                  >
                    <ExternalLink size={18} />
                    访问 Beta 应用
                  </a>
                </div>
              ) : betaApplication ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Clock size={20} />
                    <span className="font-medium">审核中</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    您的 Beta 测试申请正在审核中，请耐心等待。
                  </p>
                  <div className="text-sm text-muted-foreground bg-background p-3 rounded-lg">
                    <p className="font-medium mb-1">申请信息：</p>
                    <p>申请产品：{products[betaApplication.product] || betaApplication.product}</p>
                    <p>申请时间：{new Date(betaApplication.timestamp).toLocaleString('zh-CN')}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    申请我们的 Beta 测试资格，抢先体验最新功能
                  </p>
                  <a
                    href="/beta"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                  >
                    <ExternalLink size={18} />
                    申请 Beta 测试
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex gap-4">
              <a
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-accent transition-all duration-300"
              >
                <Home size={18} />
                返回主页
              </a>
              <button
                onClick={handleLogout}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-6 py-3 text-sm font-medium text-destructive hover:bg-destructive/20 transition-all duration-300"
              >
                <LogOut size={18} />
                退出登录
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>© 2026 Ruanm Studio. 用户体验至上的好产品</p>
        </div>
      </div>
    </div>
  )
}

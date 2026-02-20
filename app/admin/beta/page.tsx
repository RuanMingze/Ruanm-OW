'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Shield, Home, Search, CheckCircle, X, Clock, ArrowLeft, AlertCircle } from 'lucide-react'
import supabase from '@/lib/supabase'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

interface UserProfile {
  id: number
  name: string
  email: string
  avatar_url?: string
  has_beta_access: boolean
  beta_applications?: {
    product: string
    reason: string
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
  }
  created_at: string
  updated_at: string
}

export default function BetaReviewPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    setMounted(true)
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const userProfileStr = localStorage.getItem('userProfile')
      if (userProfileStr) {
        const userProfileData = JSON.parse(userProfileStr)
        setUserProfile(userProfileData)
        
        if (userProfileData.name !== 'Ruanm') {
          router.push('/403')
          return
        }

        const mockUser = {
          id: userProfileData.id || 'local-user',
          email: userProfileData.email,
          user_metadata: { username: userProfileData.name }
        }
        setUser(mockUser)
        setIsAuthorized(true)
        await loadApplications()
        return
      }

      const { data } = await supabase.auth.getSession()
      const session = data?.session
      
      if (!session?.user) {
        router.push('/403')
        return
      }

      setUser(session.user)
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (profile?.name !== 'Ruanm') {
        router.push('/403')
        return
      }

      setUserProfile(profile)
      setIsAuthorized(true)
      await loadApplications()
    } catch (err) {
      console.error('获取用户信息失败:', err)
      router.push(`${basePath}/403`)
    } finally {
      setLoading(false)
    }
  }

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .not('beta_applications', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err: any) {
      console.error('加载Beta申请失败:', err)
      alert('加载Beta申请失败：' + (err.message || '未知错误'))
    }
  }

  const handleApprove = async (userId: number) => {
    try {
      const userToApprove = users.find(u => u.id === userId)
      if (!userToApprove) return

      const updatedApplications = {
        ...userToApprove.beta_applications,
        status: 'approved',
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          beta_applications: updatedApplications,
          has_beta_access: true
        })
        .eq('id', userId)

      if (error) throw error

      alert('已通过该Beta申请')
      await loadApplications()
    } catch (err: any) {
      console.error('通过申请失败:', err)
      alert('通过申请失败：' + (err.message || '未知错误'))
    }
  }

  const handleReject = async (userId: number) => {
    try {
      const userToReject = users.find(u => u.id === userId)
      if (!userToReject) return

      const updatedApplications = {
        ...userToReject.beta_applications,
        status: 'rejected',
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          beta_applications: updatedApplications,
          has_beta_access: false
        })
        .eq('id', userId)

      if (error) throw error

      alert('已撤回该Beta申请')
      await loadApplications()
    } catch (err: any) {
      console.error('撤回申请失败:', err)
      alert('撤回申请失败：' + (err.message || '未知错误'))
    }
  }

  const filteredUsers = users.filter(user => {
    if (!user.beta_applications) return false
    
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.beta_applications?.product?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || user.beta_applications?.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const productNames: Record<string, string> = {
    paperstation: 'PaperStation 浏览器',
    screensaver: 'RuanmScreenSaver 屏保程序',
    toolbox: '阮铭泽工具箱',
    ai: '小R AI助手',
    search: 'ChickRubGo搜索引擎',
  }

  if (!mounted) {
    return null
  }

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            返回管理
          </button>
          <h1 className="text-4xl font-bold text-primary mb-2">Beta权限审核</h1>
          <p className="text-muted-foreground">审核用户的Beta权限申请</p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="搜索用户名、邮箱或产品..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已撤回</option>
          </select>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">用户</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">申请产品</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">申请理由</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">状态</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">申请时间</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      没有找到申请记录
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t border-border hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User size={20} className="text-primary" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-primary">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-primary">
                        {user.beta_applications?.product && (productNames[user.beta_applications.product] || user.beta_applications.product)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-md">
                        <div className="truncate">{user.beta_applications?.reason}</div>
                      </td>
                      <td className="px-6 py-4">
                        {user.beta_applications?.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-xs text-yellow-500">
                            <Clock size={12} />
                            待审核
                          </span>
                        )}
                        {user.beta_applications?.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-xs text-green-500">
                            <CheckCircle size={12} />
                            已通过
                          </span>
                        )}
                        {user.beta_applications?.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-xs text-red-500">
                            <X size={12} />
                            已撤回
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {user.beta_applications?.created_at && new Date(user.beta_applications.created_at).toLocaleString('zh-CN')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.beta_applications?.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(user.id)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors text-sm font-medium"
                            >
                              <CheckCircle size={16} />
                              通过
                            </button>
                            <button
                              onClick={() => handleReject(user.id)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium"
                            >
                              <X size={16} />
                              撤回
                            </button>
                          </div>
                        )}
                        {user.beta_applications?.status === 'approved' && (
                          <button
                            onClick={() => handleReject(user.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium"
                          >
                            <X size={16} />
                            撤回授权
                          </button>
                        )}
                        {user.beta_applications?.status === 'rejected' && (
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors text-sm font-medium"
                          >
                            <CheckCircle size={16} />
                            重新通过
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Shield, Home, Search, CheckCircle, X, Clock, ArrowLeft, AlertCircle } from 'lucide-react'
import supabase from '@/lib/supabase'
import { Header } from '@/components/header'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const isOfficialUser = (userName: string) => {
  if (!userName) return false
  const lowerName = userName.toLowerCase()
  return lowerName === 'ruanm' || lowerName === 'ruanmingze'
}

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
    updated_at?: string
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
  const [productFilter, setProductFilter] = useState<string>('all')
  const [processingId, setProcessingId] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
    checkSession()
  }, [])

  // 添加CSS动画样式
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .user-row {
        transition: background-color 0.2s ease;
      }
      .user-row:hover {
        background-color: rgba(59, 130, 246, 0.05);
      }
      .status-badge {
        transition: all 0.2s ease;
      }
      .action-button {
        transition: all 0.2s ease;
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const checkSession = async () => {
    try {
      const userProfileStr = localStorage.getItem('userProfile')
      if (userProfileStr) {
        const userProfileData = JSON.parse(userProfileStr)
        setUserProfile(userProfileData)
        
        if (!isOfficialUser(userProfileData.name)) {
          router.push(`${basePath}/403`)
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
        router.push(`${basePath}/403`)
        return
      }

      setUser(session.user)
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (!isOfficialUser(profile?.name)) {
        router.push(`${basePath}/403`)
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

  // 显示通知提示
  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div')
    const bgColor = type === 'success' ? '#10b981' : '#ef4444'
    const icon = type === 'success' ? '<CheckCircle size="18" />' : '<AlertCircle size="18" />'
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background-color: ${bgColor};
      color: white;
      border-radius: 8px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      display: flex;
      align-items: center;
      gap: 8px;
    `
    notification.innerHTML = `${icon} ${message}`
    document.body.appendChild(notification)
    
    // 自动关闭提示
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in'
      setTimeout(() => document.body.removeChild(notification), 300)
    }, 3000)
  }

  const handleApprove = async (userId: number) => {
    if (processingId === userId) return
    setProcessingId(userId)
    
    try {
      const userToApprove = users.find(u => u.id === userId)
      if (!userToApprove || !userToApprove.beta_applications) return

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

      showNotification('已成功通过该Beta申请', 'success')
      await loadApplications()
    } catch (err: any) {
      console.error('通过申请失败:', err)
      showNotification(`操作失败：${err.message || '未知错误'}`, 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (userId: number) => {
    if (processingId === userId) return
    setProcessingId(userId)
    
    try {
      const userToReject = users.find(u => u.id === userId)
      if (!userToReject || !userToReject.beta_applications) return

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

      showNotification('已成功撤回该Beta申请', 'success')
      await loadApplications()
    } catch (err: any) {
      console.error('撤回申请失败:', err)
      showNotification(`操作失败：${err.message || '未知错误'}`, 'error')
    } finally {
      setProcessingId(null)
    }
  }

  // 获取所有产品类型
  const getProductTypes = () => {
    const products = new Set<string>()
    users.forEach(user => {
      if (user.beta_applications?.product) {
        products.add(user.beta_applications.product)
      }
    })
    return Array.from(products)
  }

  const filteredUsers = users.filter(user => {
    if (!user.beta_applications) return false
    
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.beta_applications?.product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.beta_applications?.reason?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || user.beta_applications?.status === statusFilter
    
    const matchesProduct = productFilter === 'all' || user.beta_applications?.product === productFilter
    
    return matchesSearch && matchesStatus && matchesProduct
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
    <>
      <Header />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <button
            onClick={() => router.push(`${basePath}/admin`)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            返回管理
          </button>
          <h1 className="text-4xl font-bold text-primary mb-2">Beta权限审核</h1>
          <p className="text-muted-foreground">审核用户的Beta权限申请</p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 flex-wrap">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="搜索用户名、邮箱、产品或理由..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[140px]"
          >
            <option value="all">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已撤回</option>
          </select>
          
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[140px]"
          >
            <option value="all">全部产品</option>
            {getProductTypes().map(product => (
              <option key={product} value={product}>
                {productNames[product] || product}
              </option>
            ))}
          </select>
          
          <div className="flex items-center text-sm text-muted-foreground">
            共 {filteredUsers.length} 条记录 (总计 {users.length} 条)
          </div>
          
          <button
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
              setProductFilter('all')
            }}
            className="px-4 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            重置筛选
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
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
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle size={40} className="text-muted-foreground/50" />
                        <p>没有找到匹配的申请记录</p>
                        <button 
                          onClick={() => {
                            setSearchQuery('')
                            setStatusFilter('all')
                            setProductFilter('all')
                          }}
                          className="text-primary hover:underline text-sm"
                        >
                          清除筛选条件
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t border-border user-row">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = ''
                                e.currentTarget.style.display = 'none'
                                const sibling = e.currentTarget.nextElementSibling as HTMLElement | null
                                if (sibling) {
                                  sibling.style.display = 'flex'
                                }
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User size={20} className="text-primary" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-primary">{user.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail size={12} />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-primary">
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-xs">
                          {user.beta_applications?.product && (productNames[user.beta_applications.product] || user.beta_applications.product)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-md">
                        <div className="relative group">
                          <div className="line-clamp-2">{user.beta_applications?.reason}</div>
                          {user.beta_applications?.reason && user.beta_applications.reason.length > 100 && (
                            <div className="absolute hidden group-hover:block bg-card p-2 rounded-md shadow-lg text-xs z-10 max-w-xs border border-border">
                              {user.beta_applications.reason}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.beta_applications?.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-xs text-yellow-500 status-badge">
                            <Clock size={12} />
                            待审核
                          </span>
                        )}
                        {user.beta_applications?.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-xs text-green-500 status-badge">
                            <CheckCircle size={12} />
                            已通过
                          </span>
                        )}
                        {user.beta_applications?.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-xs text-red-500 status-badge">
                            <X size={12} />
                            已撤回
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            {user.beta_applications?.created_at && new Date(user.beta_applications.created_at).toLocaleString('zh-CN')}
                          </div>
                          {user.beta_applications?.updated_at && (
                            <div className="text-xs text-muted-foreground/70 mt-1">
                              最后更新: {new Date(user.beta_applications.updated_at).toLocaleString('zh-CN')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.beta_applications?.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(user.id)}
                              disabled={processingId === user.id}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors text-sm font-medium action-button"
                            >
                              {processingId === user.id ? (
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              ) : (
                                <>
                                  <CheckCircle size={14} />
                                  通过
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleReject(user.id)}
                              disabled={processingId === user.id}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium action-button"
                            >
                              {processingId === user.id ? (
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              ) : (
                                <>
                                  <X size={14} />
                                  撤回
                                </>
                              )}
                            </button>
                          </div>
                        )}
                        {user.beta_applications?.status === 'approved' && (
                          <button
                            onClick={() => handleReject(user.id)}
                            disabled={processingId === user.id}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium action-button"
                          >
                            {processingId === user.id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            ) : (
                              <>
                                <X size={14} />
                                撤回授权
                              </>
                            )}
                          </button>
                        )}
                        {user.beta_applications?.status === 'rejected' && (
                          <button
                            onClick={() => handleApprove(user.id)}
                            disabled={processingId === user.id}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors text-sm font-medium action-button"
                          >
                            {processingId === user.id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            ) : (
                              <>
                                <CheckCircle size={14} />
                                重新通过
                              </>
                            )}
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
  </>
)
}
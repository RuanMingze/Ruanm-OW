'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Shield, AlertTriangle, Home, Trash2, Search, X, CheckCircle, Clock, ArrowLeft, Award, MessageSquare, UserX } from 'lucide-react'
import supabase from '@/lib/supabase'
import { Header } from '@/components/header'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

interface UserProfile {
  id: number
  name: string
  email: string
  avatar_url?: string
  has_beta_access: boolean
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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
        
        if (!isOfficialUser(userProfileData.name)) {
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
        await loadUsers()
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

      if (!isOfficialUser(profile?.name)) {
        router.push('/403')
        return
      }

      setUserProfile(profile)
      setIsAuthorized(true)
      await loadUsers()
    } catch (err) {
      console.error('获取用户信息失败:', err)
      router.push('/403')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err: any) {
      console.error('加载用户列表失败:', err)
      alert('加载用户列表失败：' + (err.message || '未知错误'))
    }
  }

  const handleDeleteUser = (userId: number) => {
    setDeletingUserId(userId)
    setShowDeleteConfirm(true)
    setDeleteError('')
  }

  const handleDeleteConfirm = async () => {
    try {
      if (!deletingUserId) throw new Error('未选择要删除的用户')
      
      const userToDelete = users.find(u => u.id === deletingUserId)
      if (!userToDelete) {
        throw new Error('用户不存在')
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', deletingUserId)

      if (profileError) throw profileError

      const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()
      const authUser = authUsers?.find(u => u.email === userToDelete.email)
      
      if (authUser) {
        const { error: authError } = await supabase.auth.admin.deleteUser(authUser.id)
        if (authError) throw authError
      }

      alert('用户已成功注销')
      setShowDeleteConfirm(false)
      setDeletingUserId(null)
      await loadUsers()
    } catch (err: any) {
      console.error('注销用户失败:', err)
      setDeleteError('注销用户失败：' + (err.message || '未知错误'))
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setDeletingUserId(null)
    setDeleteError('')
  }

  const isOfficialUser = (userName: string) => {
    if (!userName) return false
    return userName === 'Ruanm' || userName === 'RuanMingze' || userName === 'ruanmingze'
  }

  const isFakeOfficialUser = (userName: string) => {
    if (!userName) return false
    
    const lowerName = userName.toLowerCase()
    const ruanmIndex = lowerName.indexOf('ruanm')
    
    if (ruanmIndex === -1) return false
    
    // 计算Ruanm以外的字符数
    const beforeRuanm = userName.substring(0, ruanmIndex)
    const afterRuanm = userName.substring(ruanmIndex + 5)
    const otherChars = beforeRuanm.length + afterRuanm.length
    
    // Ruanm以外的字符不超过2个，且不是官方用户
    return otherChars <= 2 && !isOfficialUser(userName)
  }

  const hasFakeOfficialUsers = users.some(user => isFakeOfficialUser(user.name))

  const handleDeleteAllFakeUsers = async () => {
    try {
      const fakeUsers = users.filter(user => isFakeOfficialUser(user.name))
      
      if (fakeUsers.length === 0) {
        alert('没有仿官方用户需要清除')
        return
      }

      if (!confirm(`确定要清除 ${fakeUsers.length} 个仿官方用户吗？\n\n此操作不可撤销！`)) {
        return
      }

      for (const fakeUser of fakeUsers) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('id', fakeUser.id)

        if (profileError) {
          console.error(`删除用户 ${fakeUser.name} 失败:`, profileError)
          continue
        }

        const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()
        const authUser = authUsers?.find(u => u.email === fakeUser.email)
        
        if (authUser) {
          const { error: authError } = await supabase.auth.admin.deleteUser(authUser.id)
          if (authError) {
            console.error(`删除认证用户 ${fakeUser.email} 失败:`, authError)
          }
        }
      }

      alert(`已成功清除 ${fakeUsers.length} 个仿官方用户`)
      await loadUsers()
    } catch (err: any) {
      console.error('清除仿官方用户失败:', err)
      alert('清除失败：' + (err.message || '未知错误'))
    }
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft size={20} />
                返回主页
              </button>
              <button
                onClick={() => router.push('/admin/beta')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
              >
                <Award size={20} />
                Beta授权
              </button>
              <button
                onClick={() => router.push('/admin/issue')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
              >
                <MessageSquare size={20} />
                Issue管理
              </button>
              {hasFakeOfficialUsers && (
                <button
                  onClick={handleDeleteAllFakeUsers}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors font-medium"
                >
                  <UserX size={20} />
                  清除仿官方用户
                </button>
              )}
            </div>
            <h1 className="text-4xl font-bold text-primary mb-2">用户管理</h1>
            <p className="text-muted-foreground">管理系统中的所有用户</p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="搜索用户名或邮箱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary">用户</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary">邮箱</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Beta权限</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary">注册时间</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        没有找到用户
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
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  const sibling = e.currentTarget.nextElementSibling as HTMLElement | null
                                  if (sibling) {
                                    sibling.style.display = 'flex'
                                  }
                                }}
                              />
                            ) : null}
                            {!user.avatar_url && (
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User size={20} className="text-primary" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-primary">{user.name}</div>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {isOfficialUser(user.name) && (
                                  <span className="inline-block px-2 py-1 rounded-full bg-green-500/10 text-xs text-green-500">
                                    官方
                                  </span>
                                )}
                                {isFakeOfficialUser(user.name) && (
                                  <span className="inline-block px-2 py-1 rounded-full bg-orange-500/10 text-xs text-orange-500">
                                    仿官方
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                        <td className="px-6 py-4">
                          {user.has_beta_access ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-xs text-green-500">
                              <CheckCircle size={12} />
                              已授权
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                              <X size={12} />
                              未授权
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(user.created_at).toLocaleString('zh-CN')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {!isOfficialUser(user.name) && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                                isFakeOfficialUser(user.name)
                                  ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30'
                                  : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                              }`}
                            >
                              <Trash2 size={16} />
                              注销
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

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
              <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle size={24} className="text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary">确认注销用户</h2>
                </div>

                <p className="text-muted-foreground mb-6">
                  您即将注销用户 <span className="font-medium text-primary">{users.find(u => u.id === deletingUserId)?.name || '未知用户'}</span>。
                </p>
                {deletingUserId && isFakeOfficialUser(users.find(u => u.id === deletingUserId)?.name || '') && (
                  <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <p className="text-orange-500 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      警告：该用户名包含"Ruanm"且其他字符不超过2个，疑似仿冒官方用户，建议立即注销！
                    </p>
                  </div>
                )}
                <p className="text-red-500 mb-6">
                  此操作不可撤销！该用户的所有数据将被永久删除。
                </p>

                {deleteError && (
                  <p className="text-red-500 text-sm mb-4">{deleteError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-6 py-3 rounded-lg border border-border text-primary hover:bg-card/50 transition-colors font-medium"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-6 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
                  >
                    确认注销
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
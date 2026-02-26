'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Search, CheckCircle, Clock, ArrowLeft, AlertCircle, Trash2, Pause, Play, TriangleAlert } from 'lucide-react'
import supabase from '@/lib/supabase'
import { Header } from '@/components/header'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const isOfficialUser = (userName: string) => {
  if (!userName) return false
  return userName === 'Ruanm' || userName === 'RuanMingze' || userName === 'ruanmingze'
}

interface Issue {
  qa_id: string
  question: string
  answer?: string
  category: string
  asker_id: number
  answerer_id?: number
  ispause: boolean
  created_at: string
  updated_at: string
  asker_name?: string
  answerer_name?: string
}

export default function AdminIssuePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [deletingIssueId, setDeletingIssueId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const categories = [
    { value: 'all', label: '全部' },
    { value: 'product_improvement', label: '产品改进' },
    { value: 'question', label: '问题提问' },
    { value: 'feature_request', label: '功能建议' },
    { value: 'bug_report', label: 'Bug反馈' }
  ]

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
        await loadIssues()
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
      await loadIssues()
    } catch (err) {
      console.error('获取用户信息失败:', err)
      router.push(`${basePath}/403`)
    } finally {
      setLoading(false)
    }
  }

  const loadIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('qa_data')
        .select(`
          *,
          asker_profiles:user_profiles!asker_id(name),
          answerer_profiles:user_profiles!answerer_id(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const issuesWithNames = data?.map(issue => ({
        ...issue,
        asker_name: issue.asker_profiles?.name || '匿名用户',
        answerer_name: issue.answerer_profiles?.name || null
      })) || []

      setIssues(issuesWithNames)
    } catch (err: any) {
      console.error('加载Issue失败:', err)
      alert('加载Issue失败：' + (err.message || '未知错误'))
    }
  }

  const handleDeleteIssue = (issueId: string) => {
    setDeletingIssueId(issueId)
    setShowDeleteConfirm(true)
    setDeleteError('')
  }

  const handleDeleteConfirm = async () => {
    if (!deletingIssueId) return
    
    try {
      const { error } = await supabase
        .from('qa_data')
        .delete()
        .eq('qa_id', deletingIssueId)

      if (error) throw error

      // 使用更友好的提示替代alert
      const successNotification = document.createElement('div')
      successNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background-color: #10b981;
        color: white;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
      `
      successNotification.innerHTML = '<div style="display: flex; align-items: center; gap: 8px;"><CheckCircle size="18" /> Issue已成功删除</div>'
      document.body.appendChild(successNotification)
      
      // 自动关闭提示
      setTimeout(() => {
        successNotification.style.animation = 'slideOut 0.3s ease-in'
        setTimeout(() => document.body.removeChild(successNotification), 300)
      }, 3000)

      setShowDeleteConfirm(false)
      setDeletingIssueId(null)
      await loadIssues()
    } catch (err: any) {
      console.error('删除Issue失败:', err)
      setDeleteError('删除Issue失败：' + (err.message || '未知错误'))
    }
  }

  const handleTogglePause = async (issueId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('qa_data')
        .update({
          ispause: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('qa_id', issueId)

      if (error) throw error

      // 使用更友好的提示替代alert
      const statusText = currentStatus ? '恢复' : '暂停'
      const successNotification = document.createElement('div')
      successNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background-color: #3b82f6;
        color: white;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
      `
      successNotification.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;"><CheckCircle size="18" /> Issue已成功${statusText}</div>`
      document.body.appendChild(successNotification)
      
      // 自动关闭提示
      setTimeout(() => {
        successNotification.style.animation = 'slideOut 0.3s ease-in'
        setTimeout(() => document.body.removeChild(successNotification), 300)
      }, 3000)

      await loadIssues()
    } catch (err: any) {
      console.error('暂停/恢复Issue失败:', err)
      alert('操作失败：' + (err.message || '未知错误'))
    }
  }

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.answer && issue.answer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      issue.asker_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && !issue.ispause) ||
      (statusFilter === 'paused' && issue.ispause)
    
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

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
      .issue-row {
        transition: background-color 0.2s ease;
      }
      .issue-row:hover {
        background-color: rgba(59, 130, 246, 0.05);
      }
      .status-badge {
        transition: all 0.2s ease;
      }
      .action-button {
        transition: all 0.2s ease;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

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
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push(`${basePath}/admin`)}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft size={20} />
              返回用户管理
            </button>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">Issue 管理</h1>
          <p className="text-muted-foreground">管理系统中的所有Issue</p>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="搜索Issue内容、提问者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[120px]"
            >
              <option value="all">全部</option>
              <option value="active">进行中</option>
              <option value="paused">已暂停</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[120px]"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            共 {filteredIssues.length} 条记录 (总计 {issues.length} 条)
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary/5">
                <tr>
                  <th className="w-2/5 px-6 py-4 text-left text-sm font-semibold text-primary">问题</th>
                  <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-primary">提问者</th>
                  <th className="w-1/12 px-6 py-4 text-left text-sm font-semibold text-primary">分类</th>
                  <th className="w-1/12 px-6 py-4 text-left text-sm font-semibold text-primary">状态</th>
                  <th className="w-1/12 px-6 py-4 text-left text-sm font-semibold text-primary">创建时间</th>
                  <th className="w-1/12 px-6 py-4 text-left text-sm font-semibold text-primary">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle size={40} className="text-muted-foreground/50" />
                        <p>没有找到匹配的Issue</p>
                        <button 
                          onClick={() => {
                            setSearchQuery('')
                            setStatusFilter('all')
                            setCategoryFilter('all')
                          }}
                          className="text-primary hover:underline text-sm"
                        >
                          清除筛选条件
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((issue) => (
                    <tr key={issue.qa_id} className="border-t border-border issue-row">
                      <td className="px-6 py-4">
                        <div className="max-w-full">
                          <p className="text-sm text-foreground whitespace-pre-wrap break-words font-medium">
                            {issue.question}
                          </p>
                          {issue.answer && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                                <span className="text-xs font-medium text-primary/70">回答：</span>
                                {issue.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User size={16} className="text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-primary">{issue.asker_name}</div>
                            {isOfficialUser(issue.asker_name || '') && (
                              <span className="inline-block mt-1 px-2 py-1 rounded-full bg-green-500/10 text-xs text-green-500">
                                官方
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-xs text-primary">
                          {categories.find(cat => cat.value === issue.category)?.label || issue.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {issue.ispause ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-xs text-yellow-500 status-badge">
                            <Pause size={12} />
                            已暂停
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-xs text-green-500 status-badge">
                            <CheckCircle size={12} />
                            进行中
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(issue.created_at).toLocaleString('zh-CN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTogglePause(issue.qa_id, issue.ispause)}
                            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium action-button ${
                              issue.ispause
                                ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                            }`}
                            aria-label={issue.ispause ? '恢复Issue' : '暂停Issue'}
                          >
                            {issue.ispause ? (
                              <>
                                <Play size={14} />
                                恢复
                              </>
                            ) : (
                              <>
                                <Pause size={14} />
                                暂停
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteIssue(issue.qa_id)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium action-button"
                            aria-label="删除Issue"
                          >
                            <Trash2 size={14} />
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <TriangleAlert size={24} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-primary">确认删除Issue</h2>
              </div>

              <p className="text-muted-foreground mb-6">
                您即将删除这条Issue记录，此操作不可撤销。请确认是否继续？
              </p>

              {deleteError && (
                <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeletingIssueId(null)
                    setDeleteError('')
                  }}
                  className="flex-1 px-6 py-3 rounded-lg border border-border text-primary hover:bg-card/50 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-6 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
                >
                  确认删除
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
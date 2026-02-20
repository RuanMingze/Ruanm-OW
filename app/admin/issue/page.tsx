'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Search, CheckCircle, Clock, ArrowLeft, AlertCircle, Trash2, Pause, Play, TriangleAlert } from 'lucide-react'
import supabase from '@/lib/supabase'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

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
        
        if (userProfileData.name !== 'Ruanm') {
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

      if (profile?.name !== 'Ruanm') {
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
    try {
      const { error } = await supabase
        .from('qa_data')
        .delete()
        .eq('qa_id', deletingIssueId)

      if (error) throw error

      alert('Issue已删除')
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
          ispause: !currentStatus
        })
        .eq('qa_id', issueId)

      if (error) throw error

      alert(currentStatus ? 'Issue已恢复' : 'Issue已暂停')
      await loadIssues()
    } catch (err: any) {
      console.error('暂停/恢复Issue失败:', err)
      alert('操作失败：' + (err.message || '未知错误'))
    }
  }

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.answer && issue.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && !issue.ispause) ||
      (statusFilter === 'paused' && issue.ispause)
    
    return matchesSearch && matchesStatus
  })

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
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="搜索Issue..."
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
              <option value="all">全部</option>
              <option value="active">进行中</option>
              <option value="paused">已暂停</option>
            </select>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
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
                      没有找到Issue
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((issue) => (
                    <tr key={issue.qa_id} className="border-t border-border hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="max-w-full">
                          <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                            {issue.question}
                          </p>
                          {issue.answer && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
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
                            {issue.asker_name === 'Ruanm' && (
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
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-xs text-yellow-500">
                            <Pause size={12} />
                            已暂停
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-xs text-green-500">
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
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              issue.ispause
                                ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                            }`}
                          >
                            {issue.ispause ? (
                              <>
                                <Play size={16} />
                                恢复
                              </>
                            ) : (
                              <>
                                <Pause size={16} />
                                暂停
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteIssue(issue.qa_id)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium"
                          >
                            <Trash2 size={16} />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <TriangleAlert size={24} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-primary">确认删除Issue</h2>
              </div>

              <p className="text-muted-foreground mb-6">
                您即将删除一条Issue。此操作不可撤销！
              </p>

              {deleteError && (
                <p className="text-red-500 text-sm mb-4">{deleteError}</p>
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
  )
}

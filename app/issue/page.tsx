'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Plus, Send, Filter, Search, User, Clock, Tag, CheckCircle, AlertCircle, Home } from 'lucide-react'
import supabase from '@/lib/supabase'
import { Header } from '@/components/header'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const isOfficialUser = (userName: string) => {
  if (!userName) return false
  const lowerName = userName.toLowerCase()
  return lowerName === 'ruanm' || lowerName === 'ruanmingze'
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

function IssueCard({ issue, user, handleAnswerIssue, categories }: { issue: Issue; user: any; handleAnswerIssue: (issueId: string, answer: string) => void; categories: { label: string; value: string }[] }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return
      
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setMousePosition({ x, y })
    }

    const card = cardRef.current
    if (card) {
      card.addEventListener('mousemove', handleMouseMove)
      card.addEventListener('mouseenter', () => setIsHovered(true))
      card.addEventListener('mouseleave', () => setIsHovered(false))
    }

    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove)
        card.removeEventListener('mouseenter', () => setIsHovered(true))
        card.removeEventListener('mouseleave', () => setIsHovered(false))
      }
    }
  }, [])

  return (
    <div
      ref={cardRef}
      key={issue.qa_id}
      className="relative bg-card border border-border rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
    >
      {isHovered && (
        <div 
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(224, 112, 32, 0.15), transparent 60%)`,
            opacity: 1,
            borderRadius: '1rem'
          }}
        />
      )}
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-primary">
                {issue.asker_name}
              </span>
              {isOfficialUser(issue.asker_name || '') && (
                <span className="px-2 py-1 rounded-full bg-green-500/10 text-xs text-green-500">
                  官方
                </span>
              )}
              {issue.ispause && (
                <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-xs text-yellow-500">
                  已暂停
                </span>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={12} />
                {new Date(issue.created_at).toLocaleString('zh-CN')}
              </span>
              <span className="px-2 py-1 rounded-full bg-primary/10 text-xs text-primary">
                {categories.find(cat => cat.value === issue.category)?.label || issue.category}
              </span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
              {issue.question}
            </p>
          </div>
        </div>

        {issue.answer ? (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} className="text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-primary">
                    {issue.answerer_name || '官方回复'}
                  </span>
                  {isOfficialUser(issue.answerer_name || '') && (
                    <span className="px-2 py-1 rounded-full bg-green-500/10 text-xs text-green-500">
                      官方
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(issue.updated_at).toLocaleString('zh-CN')}
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {issue.answer}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {user && !issue.ispause && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex gap-2">
              <textarea
                placeholder={issue.answer ? "补充回答..." : "回答这个问题..."}
                rows={2}
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                id={`answer-${issue.qa_id}`}
              />
              <button
                onClick={() => {
                  const textarea = document.getElementById(`answer-${issue.qa_id}`) as HTMLTextAreaElement
                  if (textarea.value.trim()) {
                    handleAnswerIssue(issue.qa_id, textarea.value)
                    textarea.value = ''
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300"
              >
                <Send size={18} />
                {issue.answer ? '补充' : '回答'}
              </button>
            </div>
          </div>
        )}

        {issue.ispause && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-yellow-500 flex items-center gap-2">
              此Issue已被管理员暂停，将无法回答
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function IssuePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [showNewIssue, setShowNewIssue] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [newIssue, setNewIssue] = useState({
    question: '',
    category: 'product_improvement'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

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
    loadIssues()
  }, [])

  useEffect(() => {
    let filtered = issues

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(issue => issue.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(issue => 
        issue.question.toLowerCase().includes(query) ||
        (issue.answer && issue.answer.toLowerCase().includes(query))
      )
    }

    setFilteredIssues(filtered)
  }, [issues, selectedCategory, searchQuery])

  const checkSession = async () => {
    try {
      const userProfileStr = localStorage.getItem('userProfile')
      if (userProfileStr) {
        const userProfileData = JSON.parse(userProfileStr)
        setUser(userProfileData)
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
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

      const issuesWithNames = data?.map(issue => {
        let askerName = issue.asker_profiles?.name || '匿名用户'
        let answererName = issue.answerer_profiles?.name || null
        
        // 如果当前用户就是发布者，使用当前用户的名字
        if (user && issue.asker_id === user.id) {
          askerName = user.name || '匿名用户'
        }
        
        // 如果当前用户就是回答者，使用当前用户的名字
        if (user && issue.answerer_id === user.id) {
          answererName = user.name || '匿名用户'
        }
        
        return {
          ...issue,
          asker_name: askerName,
          answerer_name: answererName
        }
      }) || []

      setIssues(issuesWithNames)
    } catch (err) {
      console.error('加载问答失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setIsSubmitting(true)

    try {
      if (!user) {
        setSubmitError('请先登录')
        setIsSubmitting(false)
        return
      }

      const { error } = await supabase
        .from('qa_data')
        .insert({
          question: newIssue.question.trim(),
          category: newIssue.category,
          asker_id: user.id
        })

      if (error) throw error

      setNewIssue({ question: '', category: 'product_improvement' })
      setShowNewIssue(false)
      await loadIssues()
    } catch (err: any) {
      console.error('提交问题失败:', err)
      setSubmitError('提交失败：' + (err.message || '未知错误'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnswerIssue = async (issueId: string, answer: string) => {
    try {
      if (!user) {
        alert('请先登录')
        return
      }

      const trimmedAnswer = answer.trim()

      if (!trimmedAnswer) {
        alert('回答内容不能为空')
        return
      }

      const { data: currentIssue } = await supabase
        .from('qa_data')
        .select('answer')
        .eq('qa_id', issueId)
        .single()

      let finalAnswer = trimmedAnswer
      if (currentIssue?.answer) {
        finalAnswer = `${currentIssue.answer}\n\n--- 补充回答 ---\n\n${trimmedAnswer}`
      }

      const { error } = await supabase
        .from('qa_data')
        .update({
          answer: finalAnswer,
          answerer_id: user.id
        })
        .eq('qa_id', issueId)

      if (error) throw error

      await loadIssues()
    } catch (err: any) {
      console.error('回答问题失败:', err)
      alert('回答失败：' + (err.message || '未知错误'))
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-32">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">
                Issue 中心
              </h1>
              <p className="text-muted-foreground">
                提问、回答问题、改进产品建议
              </p>
            </div>
            <a
              href={`${basePath}/`}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-2 text-sm font-medium text-primary hover:bg-accent transition-all duration-300"
            >
              <Home size={18} />
              返回主页
            </a>
          </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索问题..."
                className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {user && (
            <button
              onClick={() => setShowNewIssue(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300"
            >
              <Plus size={18} />
              提交新 Issue
            </button>
          )}
        </div>

        {showNewIssue && (
          <div className="mb-8 bg-card border border-border rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">
                提交新 Issue
              </h2>
              <button
                onClick={() => setShowNewIssue(false)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitIssue} className="space-y-6">
              {submitError && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle size={16} />
                    {submitError}
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-primary mb-2">
                  类型
                </label>
                <select
                  id="category"
                  value={newIssue.category}
                  onChange={(e) => setNewIssue({ ...newIssue, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {categories.filter(cat => cat.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="question" className="block text-sm font-medium text-primary mb-2">
                  内容
                </label>
                <textarea
                  id="question"
                  value={newIssue.question}
                  onChange={(e) => setNewIssue({ ...newIssue, question: e.target.value })}
                  placeholder="请详细描述您的问题、建议或改进意见..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowNewIssue(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-accent transition-all duration-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      提交中...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      提交
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground mb-2">
              暂无 Issue
            </p>
            <p className="text-sm text-muted-foreground">
              成为第一个提问的人吧！
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.qa_id}
                issue={issue}
                user={user}
                handleAnswerIssue={handleAnswerIssue}
                categories={categories}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  )
}
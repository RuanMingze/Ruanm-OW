'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Copy, ExternalLink, Shield, Key } from 'lucide-react'
import supabase from '@/lib/supabase'
import { Header } from '@/components/header'

export default function AppsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAppName, setNewAppName] = useState('')
  const [newAppDescription, setNewAppDescription] = useState('')
  const [newAppRedirectUri, setNewAppRedirectUri] = useState('')
  const [newAppScopes, setNewAppScopes] = useState('read write')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      console.log('[Apps] 开始检查用户会话...')
      
      // 先检查本地存储
      const userProfileStr = localStorage.getItem('userProfile')
      console.log('[Apps] 本地存储用户信息:', userProfileStr)
      
      if (userProfileStr) {
        const userProfileData = JSON.parse(userProfileStr)
        console.log('[Apps] 解析用户信息成功:', userProfileData)
        setUser(userProfileData)
        await loadApps(userProfileData.id)
        setLoading(false)
        return
      }
      
      // 如果本地存储没有，检查Supabase会话
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[Apps] Supabase会话状态:', session)
      
      if (!session) {
        console.log('[Apps] 未找到会话，跳转到登录页')
        router.push('/login')
        return
      }
      
      // 尝试从user_profiles表获取用户资料
      try {
        const supabaseUrl = 'https://pyywrxrmtehucmkpqkdi.supabase.co'
        const supabaseKey = 'sb_publishable_Ztie93n2pi48h_rAIuviyA_ftjAIDuj'
        const email = session.user.email
        
        if (!email) {
          throw new Error('无法获取用户邮箱')
        }
        
        const requestUrl = `${supabaseUrl}/rest/v1/user_profiles?select=*&email=eq.${encodeURIComponent(email)}&apikey=${supabaseKey}`
        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const userProfiles = await response.json()
          if (userProfiles && userProfiles.length > 0) {
            const userProfileData = userProfiles[0]
            localStorage.setItem('userProfile', JSON.stringify(userProfileData))
            setUser(userProfileData)
            await loadApps(userProfileData.id.toString())
            setLoading(false)
            return
          }
        }
      } catch (err) {
        console.error('[Apps] 获取用户资料失败:', err)
      }
      
      // 如果无法获取用户资料，跳转到登录页
      console.log('[Apps] 无法获取用户资料，跳转到登录页')
      router.push('/login')
    } catch (err) {
      console.error('[Apps] 检查会话失败:', err)
      console.error('[Apps] 错误详情:', JSON.stringify(err, null, 2))
      router.push('/login')
    }
  }

  const loadApps = async (userId: string) => {
    try {
      console.log('[Apps] 开始加载应用列表，用户ID:', userId)
      
      const supabaseUrl = 'https://pyywrxrmtehucmkpqkdi.supabase.co'
      const supabaseKey = 'sb_publishable_Ztie93n2pi48h_rAIuviyA_ftjAIDuj'
      const requestUrl = `${supabaseUrl}/rest/v1/oauth_applications?select=*&user_id=eq.${userId}&apikey=${supabaseKey}`
      
      console.log('[Apps] 请求URL:', requestUrl)
      
      const headers = {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
      
      console.log('[Apps] 请求头:', headers)
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: headers
      })
      
      console.log('[Apps] 响应状态:', response.status)
      console.log('[Apps] 响应头:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Apps] 加载应用列表错误:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const appsData = await response.json()
      console.log('[Apps] 加载到的应用数据:', appsData)
      console.log('[Apps] 应用数量:', appsData.length)
      
      setApps(appsData)
    } catch (err: any) {
      console.error('[Apps] 加载应用列表失败:', err)
      console.error('[Apps] 错误详情:', JSON.stringify(err, null, 2))
      setError('加载应用列表失败：' + (err.message || '未知错误'))
    }
  }

  const handleCreateApp = async () => {
    if (!newAppName.trim() || !newAppRedirectUri.trim()) {
      setError('应用名称和回调地址不能为空')
      return
    }

    setCreating(true)
    setError('')
    setSuccess('')

    try {
      const clientId = generateClientId()
      const clientSecret = generateClientSecret()

      const supabaseUrl = 'https://pyywrxrmtehucmkpqkdi.supabase.co'
      const supabaseKey = 'sb_publishable_Ztie93n2pi48h_rAIuviyA_ftjAIDuj'
      const requestUrl = `${supabaseUrl}/rest/v1/oauth_applications`
      
      const appData = {
        client_id: clientId,
        client_secret: clientSecret,
        name: newAppName.trim(),
        description: newAppDescription.trim() || null,
        redirect_uri: newAppRedirectUri.trim(),
        scopes: newAppScopes.trim(),
        user_id: user.id
      }
      
      console.log('[Apps] 创建应用，数据:', appData)
      console.log('[Apps] 用户ID:', user.id)
      
      const headers = {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(appData)
      })
      
      console.log('[Apps] 创建应用响应状态:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Apps] 创建应用错误:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      setSuccess('应用创建成功！')
      setShowCreateModal(false)
      setNewAppName('')
      setNewAppDescription('')
      setNewAppRedirectUri('')
      setNewAppScopes('read write')

      await loadApps(user.id)

      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err: any) {
      console.error('[Apps] 创建应用失败:', err)
      setError('创建应用失败：' + (err.message || '未知错误'))
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteApp = async (appId: number) => {
    if (!confirm('确定要删除这个应用吗？删除后，所有使用此应用的令牌都将失效。')) {
      return
    }

    try {
      const supabaseUrl = 'https://pyywrxrmtehucmkpqkdi.supabase.co'
      const supabaseKey = 'sb_publishable_Ztie93n2pi48h_rAIuviyA_ftjAIDuj'
      const requestUrl = `${supabaseUrl}/rest/v1/oauth_applications?id=eq.${appId}`
      
      console.log('[Apps] 删除应用，应用ID:', appId)
      
      const headers = {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
      
      const response = await fetch(requestUrl, {
        method: 'DELETE',
        headers: headers
      })
      
      console.log('[Apps] 删除应用响应状态:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Apps] 删除应用错误:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      setApps(apps.filter((app: any) => app.id !== appId))
      setSuccess('应用删除成功！')

      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err: any) {
      console.error('[Apps] 删除应用失败:', err)
      setError('删除应用失败：' + (err.message || '未知错误'))
    }
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('已复制到剪贴板！')
    setTimeout(() => {
      setSuccess('')
    }, 2000)
  }

  const generateClientId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const generateClientSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let result = ''
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-primary">应用管理</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus size={20} />
                创建应用
              </button>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
                <p>{success}</p>
              </div>
            )}

            {apps.length === 0 ? (
              <div className="bg-muted/50 rounded-lg p-12 text-center">
                <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-primary mb-2">还没有应用</h2>
                <p className="text-muted-foreground mb-6">
                  创建OAuth应用后，其他开发者可以使用您的API来访问用户数据
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus size={20} />
                  创建第一个应用
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {apps.map((app: any) => (
                  <div key={app.id} className="bg-card rounded-lg p-6 shadow-lg border border-border">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-primary">{app.name}</h3>
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {app.description && (
                      <p className="text-muted-foreground text-sm mb-4">{app.description}</p>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Client ID</label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 bg-muted px-2 py-1 rounded text-xs font-mono break-all">{app.client_id}</code>
                          <button
                            onClick={() => handleCopyToClipboard(app.client_id)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Client Secret</label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 bg-muted px-2 py-1 rounded text-xs font-mono break-all">{app.client_secret}</code>
                          <button
                            onClick={() => handleCopyToClipboard(app.client_secret)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">回调地址</label>
                        <p className="text-sm text-primary mt-1 break-all">{app.redirect_uri}</p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">权限范围</label>
                        <p className="text-sm text-primary mt-1">{app.scopes}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border">
                      <a
                        href={`/docs/oauth?client_id=${app.client_id}`}
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink size={16} />
                        查看文档
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 创建应用模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">创建新应用</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  应用名称 <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="输入应用名称"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  应用描述
                </label>
                <textarea
                  value={newAppDescription}
                  onChange={(e) => setNewAppDescription(e.target.value)}
                  placeholder="输入应用描述（可选）"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  回调地址 <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={newAppRedirectUri}
                  onChange={(e) => setNewAppRedirectUri(e.target.value)}
                  placeholder="https://your-app.com/callback"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  用户授权后将被重定向到此地址
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  权限范围
                </label>
                <input
                  type="text"
                  value={newAppScopes}
                  onChange={(e) => setNewAppScopes(e.target.value)}
                  placeholder="read write"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  空格分隔的权限列表，如：read write profile
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-primary hover:bg-muted transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateApp}
                disabled={creating || !newAppName.trim() || !newAppRedirectUri.trim()}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? '创建中...' : '创建应用'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

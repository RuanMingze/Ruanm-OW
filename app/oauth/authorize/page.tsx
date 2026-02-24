'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, AlertCircle } from 'lucide-react'
import supabase from '@/lib/supabase'

export default function OAuthAuthorizePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [authorizing, setAuthorizing] = useState(false)
  const [error, setError] = useState('')
  const [clientInfo, setClientInfo] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  const clientId = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const responseType = searchParams.get('response_type') || 'code'
  const scope = searchParams.get('scope') || 'read write'
  const state = searchParams.get('state')

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?redirect=' + encodeURIComponent(window.location.href))
        return
      }
      setUser(session.user)

      // 获取客户端应用信息
      const { data: appData } = await supabase
        .from('oauth_applications')
        .select('*')
        .eq('client_id', clientId)
        .single()

      if (!appData) {
        setError('无效的客户端ID')
        setLoading(false)
        return
      }

      // 验证重定向URI
      if (appData.redirect_uri !== redirectUri) {
        setError('无效的重定向URI')
        setLoading(false)
        return
      }

      setClientInfo(appData)
      setLoading(false)
    } catch (err) {
      console.error('检查会话失败:', err)
      setError('授权失败，请重试')
      setLoading(false)
    }
  }

  const handleAuthorize = async () => {
    if (!user || !clientInfo) return

    setAuthorizing(true)
    setError('')

    try {
      // 生成授权码
      const code = generateAuthorizationCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10分钟后过期

      // 获取本地存储的用户资料，使用数字ID
      const userProfileStr = localStorage.getItem('userProfile')
      let userId: number | undefined
      
      if (userProfileStr) {
        try {
          const userProfile = JSON.parse(userProfileStr)
          userId = userProfile.id
          console.log('授权 - 使用本地存储的用户ID:', userId)
        } catch (err) {
          console.error('解析userProfile失败:', err)
        }
      }
      
      if (!userId) {
        throw new Error('无法获取用户ID')
      }

      // 保存授权码到数据库
      const { error: insertError } = await supabase
        .from('oauth_authorization_codes')
        .insert({
          code,
          client_id: clientId,
          user_id: userId,
          redirect_uri: redirectUri,
          scopes: scope,
          expires_at: expiresAt.toISOString()
        })

      if (insertError) {
        throw insertError
      }

      // 重定向到客户端应用
      if (!redirectUri) {
        throw new Error('缺少重定向URI')
      }
      const redirectUrl = new URL(redirectUri)
      redirectUrl.searchParams.set('code', code)
      if (state) {
        redirectUrl.searchParams.set('state', state)
      }
      
      // 添加完整的userProfile到重定向参数
      try {
        const userProfileStr = localStorage.getItem('userProfile')
        if (userProfileStr) {
          const userProfile = JSON.parse(userProfileStr)
          // 移除敏感信息
          const safeUserProfile = {
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            avatar_url: userProfile.avatar_url,
            has_beta_access: userProfile.has_beta_access
          }
          // 将用户资料转换为JSON并编码
          const userProfileParam = encodeURIComponent(JSON.stringify(safeUserProfile))
          redirectUrl.searchParams.set('user_profile', userProfileParam)
          console.log('授权 - 添加用户资料到重定向参数')
        }
      } catch (err) {
        console.error('添加用户资料到重定向参数失败:', err)
      }
      
      window.location.href = redirectUrl.toString()
    } catch (err: any) {
      console.error('授权失败:', err)
      setError('授权失败：' + (err.message || '未知错误'))
      setAuthorizing(false)
    }
  }

  const handleCancel = () => {
    if (!redirectUri) {
      setError('缺少重定向URI')
      return
    }
    const redirectUrl = new URL(redirectUri)
    redirectUrl.searchParams.set('error', 'access_denied')
    redirectUrl.searchParams.set('error_description', '用户取消了授权')
    if (state) {
      redirectUrl.searchParams.set('state', state)
    }
    
    window.location.href = redirectUrl.toString()
  }

  const generateAuthorizationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card rounded-lg p-8 shadow-lg">
          <div className="flex justify-center mb-6">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-center text-primary mb-2">授权失败</h1>
          <p className="text-center text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card rounded-lg p-8 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary mb-2">授权访问</h1>
          <p className="text-muted-foreground mb-4">
            应用 <span className="font-semibold text-primary">{clientInfo?.name}</span> 请求访问您的账户
          </p>
          {clientInfo?.description && (
            <p className="text-sm text-muted-foreground mb-6">{clientInfo.description}</p>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-2">请求的权限</h3>
            <div className="space-y-2">
              {scope.split(' ').map((s: string) => (
                <div key={s} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-primary">
                      {s === 'read' && '读取您的资料信息'}
                      {s === 'write' && '修改您的资料信息'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>注意：</strong>授权后，该应用将能够访问您的账户信息。请确保您信任此应用。
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleAuthorize}
            disabled={authorizing}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authorizing ? '授权中...' : '授权'}
          </button>
          <button
            onClick={handleCancel}
            disabled={authorizing}
            className="w-full border border-border bg-background text-primary py-3 rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          授权后，该应用将能够访问您的账户信息直到您撤销授权
        </p>
      </div>
    </div>
  )
}

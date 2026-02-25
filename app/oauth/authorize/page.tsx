'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle } from 'lucide-react'
import supabase from '@/lib/supabase'

export default function OAuthAuthorizePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorizing, setAuthorizing] = useState(false)
  const [error, setError] = useState('')
  const [clientInfo, setClientInfo] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [redirectUri, setRedirectUri] = useState<string | null>(null)
  const [responseType, setResponseType] = useState<string>('code')
  const [scope, setScope] = useState<string>('read write')
  const [state, setState] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [finalRedirectUrl, setFinalRedirectUrl] = useState<string>('')

  useEffect(() => {
    // 在客户端获取查询参数
    const searchParams = new URLSearchParams(window.location.search)
    setClientId(searchParams.get('client_id'))
    // 解码重定向URI，因为它在传递时被编码了
    const encodedRedirectUri = searchParams.get('redirect_uri')
    const decodedRedirectUri = encodedRedirectUri ? decodeURIComponent(encodedRedirectUri) : null
    setRedirectUri(decodedRedirectUri)
    console.log('授权 - 获取并重定向URI:', {
      encoded: encodedRedirectUri,
      decoded: decodedRedirectUri
    })
    setResponseType(searchParams.get('response_type') || 'code')
    setScope(searchParams.get('scope') || 'read write')
    setState(searchParams.get('state'))
  }, [])

  useEffect(() => {
    if (clientId) {
      checkSession()
    }
  }, [clientId])

  const checkSession = async () => {
    try {
      console.log('授权 - 开始检查会话')
      
      // 先检查本地存储的用户资料
      const userProfileStr = localStorage.getItem('userProfile')
      console.log('授权 - 本地存储用户资料:', userProfileStr)
      
      if (userProfileStr) {
        try {
          const userProfileData = JSON.parse(userProfileStr)
          console.log('授权 - 解析用户资料成功:', userProfileData)
          setUser(userProfileData)
          
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
          console.log('授权 - 验证重定向URI:', {
            appRedirectUri: appData.redirect_uri,
            requestRedirectUri: redirectUri
          })
          
          // 支持完全匹配和前缀匹配
          const isValidRedirectUri = redirectUri ? (
            appData.redirect_uri === redirectUri ||
            (appData.redirect_uri.endsWith('/') && redirectUri.startsWith(appData.redirect_uri)) ||
            (!appData.redirect_uri.endsWith('/') && redirectUri.startsWith(appData.redirect_uri + '/')) ||
            // 特别处理：如果应用只设置了协议（如ruanmow://），则任何该协议的URI都有效
            (appData.redirect_uri.includes('://') && 
             appData.redirect_uri.split('://')[1] === '' && 
             redirectUri.startsWith(appData.redirect_uri))
          ) : false
          
          if (!isValidRedirectUri) {
            setError('无效的重定向URI')
            setLoading(false)
            return
          }
          
          console.log('授权 - 重定向URI验证通过')

          setClientInfo(appData)
          setLoading(false)
          console.log('授权 - 会话检查成功，使用本地存储的用户资料')
          return
        } catch (parseError) {
          console.error('授权 - 解析用户资料失败:', parseError)
          // 解析失败，继续检查Supabase会话
        }
      }
      
      // 如果本地存储没有，检查Supabase会话
      console.log('授权 - 检查Supabase会话')
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.log('授权 - 未找到会话，跳转到登录页')
        router.push('/login?redirect=' + encodeURIComponent(window.location.href))
        return
      }
      setUser(session.user)
      console.log('授权 - Supabase会话检查成功')

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
      console.log('授权 - 验证重定向URI (Supabase会话):', {
        appRedirectUri: appData.redirect_uri,
        requestRedirectUri: redirectUri
      })
      
      // 支持完全匹配和前缀匹配
      const isValidRedirectUri = redirectUri ? (
        appData.redirect_uri === redirectUri ||
        (appData.redirect_uri.endsWith('/') && redirectUri.startsWith(appData.redirect_uri)) ||
        (!appData.redirect_uri.endsWith('/') && redirectUri.startsWith(appData.redirect_uri + '/')) ||
        // 特别处理：如果应用只设置了协议（如ruanmow://），则任何该协议的URI都有效
        (appData.redirect_uri.includes('://') && 
         appData.redirect_uri.split('://')[1] === '' && 
         redirectUri.startsWith(appData.redirect_uri))
      ) : false
      
      if (!isValidRedirectUri) {
        setError('无效的重定向URI')
        setLoading(false)
        return
      }
      
      console.log('授权 - 重定向URI验证通过')

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
      
      let finalRedirectUrl: string
      
      try {
        // 尝试使用URL对象（支持http/https等标准协议）
        const redirectUrl = new URL(redirectUri)
        redirectUrl.searchParams.set('code', code)
        if (state) {
          redirectUrl.searchParams.set('state', state)
        }
        
        // 添加完整的userProfile到重定向参数
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
        
        finalRedirectUrl = redirectUrl.toString()
        console.log('授权 - 使用URL对象处理重定向URI:', finalRedirectUrl)
      } catch (urlError) {
        // URL对象创建失败，使用字符串拼接（支持自定义协议如app://）
        console.log('授权 - 使用字符串拼接处理自定义协议:', redirectUri)
        
        const params = new URLSearchParams()
        params.set('code', code)
        if (state) {
          params.set('state', state)
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
            params.set('user_profile', userProfileParam)
          }
        } catch (err) {
          console.error('添加用户资料到重定向参数失败:', err)
        }
        
        const paramsString = params.toString()
        // 确保即使是简单的app://也能正确处理
        if (!redirectUri || redirectUri.trim() === '') {
          throw new Error('重定向URI不能为空')
        }
        finalRedirectUrl = redirectUri + (redirectUri.includes('?') ? '&' : '?') + paramsString
        console.log('授权 - 使用字符串拼接处理后的重定向URI:', finalRedirectUrl)
      }
      
      console.log('授权 - 最终重定向URL:', finalRedirectUrl)
      
      // 设置成功消息和最终重定向URL
      setFinalRedirectUrl(finalRedirectUrl)
      setShowSuccessMessage(true)
      
      // 1秒后自动跳转
      setTimeout(() => {
        window.location.href = finalRedirectUrl
      }, 1000)
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
    
    let finalRedirectUrl: string
    
    try {
      // 尝试使用URL对象（支持http/https等标准协议）
      const redirectUrl = new URL(redirectUri)
      redirectUrl.searchParams.set('error', 'access_denied')
      redirectUrl.searchParams.set('error_description', '用户取消了授权')
      if (state) {
        redirectUrl.searchParams.set('state', state)
      }
      finalRedirectUrl = redirectUrl.toString()
      console.log('授权 - 取消授权，使用URL对象处理重定向URI:', finalRedirectUrl)
    } catch (urlError) {
      // URL对象创建失败，使用字符串拼接（支持自定义协议如app://）
      console.log('授权 - 取消授权时使用字符串拼接处理自定义协议:', redirectUri)
      
      const params = new URLSearchParams()
      params.set('error', 'access_denied')
      params.set('error_description', '用户取消了授权')
      if (state) {
        params.set('state', state)
      }
      
      const paramsString = params.toString()
      // 确保即使是简单的app://也能正确处理
      if (!redirectUri || redirectUri.trim() === '') {
        setError('重定向URI不能为空')
        return
      }
      finalRedirectUrl = redirectUri + (redirectUri.includes('?') ? '&' : '?') + paramsString
      console.log('授权 - 取消授权，使用字符串拼接处理后的重定向URI:', finalRedirectUrl)
    }
    
    console.log('授权 - 取消授权，最终重定向URL:', finalRedirectUrl)
    window.location.href = finalRedirectUrl
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

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card rounded-lg p-8 shadow-lg">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-center text-primary mb-2">授权成功</h1>
          <p className="text-center text-muted-foreground mb-4">
            授权已成功完成，将在 1 秒后自动跳转到授权的应用
          </p>
          <p className="text-center text-muted-foreground mb-6">
            如果没有自动跳转，请
            <a 
              href={finalRedirectUrl} 
              className="text-primary hover:underline ml-1"
            >
              点击这里
            </a>
            手动跳转
          </p>
          <button
            onClick={() => window.location.href = finalRedirectUrl}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            立即跳转
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

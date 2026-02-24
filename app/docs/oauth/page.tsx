'use client'

import { useState, useRef } from 'react'
import { ChevronDown, ChevronRight, BookOpen, Layers, Search, X, Home, Key, Shield, RefreshCw, Code, Zap, Copy, Check } from 'lucide-react'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

interface DocumentItem {
  id: string
  title: string
  sections: {
    id: string
    title: string
    content: string
  }[]
}

function OAuthDocsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set())
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const toggleDoc = (docId: string) => {
    setExpandedDocs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(docId)) {
        newSet.delete(docId)
      } else {
        newSet.add(docId)
      }
      return newSet
    })
  }

  const selectSection = (docId: string, sectionId: string) => {
    setActiveSection(`${docId}-${sectionId}`)
    setTimeout(() => {
      const element = document.getElementById(`${docId}-${sectionId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const copyToClipboard = async (code: string, codeId: string) => {
    console.log('开始复制代码:', {
      codeId,
      codeLength: code.length,
      hasClipboardAPI: !!navigator.clipboard
    })
    
    try {
      // 检查是否支持Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        console.log('使用Clipboard API复制')
        await navigator.clipboard.writeText(code)
        console.log('Clipboard API复制成功')
      } else {
        // 降级方案：创建临时textarea元素
        console.log('使用降级方案复制')
        const textArea = document.createElement('textarea')
        textArea.value = code
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        console.log('降级方案复制结果:', successful)
        
        document.body.removeChild(textArea)
        
        if (!successful) {
          throw new Error('降级方案复制失败')
        }
      }
      
      setCopiedCode(codeId)
      console.log('复制成功，设置copiedCode状态:', codeId)
      setTimeout(() => {
        setCopiedCode(null)
        console.log('重置copiedCode状态')
      }, 2000)
    } catch (err: any) {
      console.error('复制失败:', {
        error: err,
        message: err.message,
        stack: err.stack
      })
    }
  }

  const documents: DocumentItem[] = [
    {
      id: 'oauth',
      title: 'OAuth 2.0 授权系统',
      sections: [
        {
          id: 'quickstart',
          title: '快速入门',
          content: `
## 概述

Ruanm 官网提供完整的 OAuth 2.0 授权系统，允许第三方应用安全地访问用户数据。

### OAuth 2.0 流程

OAuth 2.0 是一个开放标准，用于授权第三方应用访问用户资源，而无需共享用户密码。

### 主要特点

- **安全性**：用户密码不与第三方应用共享
- **可控性**：用户可以随时撤销授权
- **标准化**：遵循 OAuth 2.0 标准
- **灵活性**：支持多种授权模式

## 快速开始

### 1. 创建 OAuth 应用

访问 [应用管理页面](/apps) 创建您的第一个 OAuth 应用。

创建应用后，您将获得：
- **Client ID**：用于标识您的应用
- **Client Secret**：用于验证应用身份
- **重定向 URI**：授权后用户将被重定向的地址

### 2. 获取用户授权

引导用户访问授权页面：

\`\`\`text
https://ruanm.pages.dev/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=read write
\`\`\`

### 3. 获取访问令牌

用户授权后，使用授权码换取访问令牌：

\`\`\`javascript
const response = await fetch('https://ruanm.pages.dev/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: 'AUTHORIZATION_CODE',
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    redirect_uri: 'YOUR_REDIRECT_URI'
  })
})

const { access_token, refresh_token } = await response.json()
\`\`\`

### 4. 使用 API

使用访问令牌调用受保护的 API：

\`\`\`javascript
const response = await fetch('https://ruanm.pages.dev/api/protected', {
  headers: {
    'Authorization': \`Bearer \${access_token}\`
  }
})
\`\`\`
          `
        },
        {
          id: 'authorization',
          title: '授权流程',
          content: `
## 授权码模式

授权码模式是最安全的 OAuth 2.0 授权方式，适用于服务器端应用。

### 流程图解

1. **用户访问**：用户点击授权链接
2. **用户登录**：用户登录并授权应用
3. **获取授权码**：应用收到授权码
4. **换取令牌**：应用使用授权码换取访问令牌
5. **访问 API**：应用使用访问令牌访问资源

### 请求参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|--------|------|
| response_type | string | 是 | 固定为 \`code\` |
| client_id | string | 是 | 应用的 Client ID |
| redirect_uri | string | 是 | 授权后的重定向地址 |
| scope | string | 否 | 请求的权限范围，如 \`read write\` |
| state | string | 否 | 用于防止 CSRF 攻击 |

### 授权响应

成功授权后，用户将被重定向到您的重定向 URI，并附带以下参数：

\`\`\`text
YOUR_REDIRECT_URI?code=AUTHORIZATION_CODE&state=YOUR_STATE&user_profile=USER_PROFILE_JSON
\`\`\`

### 回调参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| code | string | 是 | 授权码，用于换取访问令牌 |
| state | string | 否 | 与请求中相同的state参数，用于防止CSRF攻击 |
| user_profile | string | 是 | 完整的用户资料，JSON格式编码 |

### user_profile参数格式

\`\`\`json
{
  "id": 1,
  "name": "user",
  "email": "user@example.com",
  "avatar_url": "https://example.com/avatar.png",
  "has_beta_access": true
}
\`\`\`

### 参数含义

- **id**：用户数字ID
- **name**：用户名称
- **email**：用户邮箱
- **avatar_url**：用户头像URL
- **has_beta_access**：是否有beta访问权限

## 令牌端点

使用授权码换取访问令牌：

### 请求格式

\`\`\`javascript
POST /oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "AUTHORIZATION_CODE",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "redirect_uri": "YOUR_REDIRECT_URI"
}
\`\`\`

### 响应格式

\`\`\`json
{
  "access_token": "ACCESS_TOKEN",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "REFRESH_TOKEN",
  "scope": "read write"
}
\`\`\`

### 令牌使用

访问令牌有效期为 1 小时，过期后需要使用刷新令牌获取新的访问令牌。
          `
        },
        {
          id: 'refresh',
          title: '刷新令牌',
          content: `
## 刷新令牌流程

当访问令牌过期时，使用刷新令牌获取新的访问令牌。

### 请求格式

\`\`\`javascript
POST /oauth/token
Content-Type: application/json

{
  "grant_type": "refresh_token",
  "refresh_token": "REFRESH_TOKEN",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET"
}
\`\`\`

### 响应格式

\`\`\`json
{
  "access_token": "NEW_ACCESS_TOKEN",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "NEW_REFRESH_TOKEN",
  "scope": "read write"
}
\`\`\`

### 注意事项

- 刷新令牌只能使用一次
- 使用后会获得新的刷新令牌
- 旧的刷新令牌会立即失效
          `
        },
        {
          id: 'scopes',
          title: '权限范围',
          content: `
## 可用权限

### read 权限

允许应用读取用户的基本信息，包括：
- 用户名
- 邮箱
- 头像 URL
- 创建时间

### write 权限

允许应用修改用户信息，包括：
- 修改用户名
- 修改邮箱
- 修改头像 URL

### 完全访问

同时拥有 \`read\` 和 \`write\` 权限的应用可以完全访问和修改用户数据。

## 权限请求

在授权请求中，使用 \`scope\` 参数指定需要的权限：

\`\`\`text
scope=read write
\`\`\`

多个权限用空格分隔：

\`\`\`text
scope=read
\`\`\`
          `
        },
        {
          id: 'security',
          title: '安全最佳实践',
          content: `
## 保护 Client Secret

- **不要泄露**：Client Secret 是敏感信息，不要在前端代码中暴露
- **服务器端使用**：只在服务器端使用 Client Secret
- **定期轮换**：定期更换 Client Secret 以提高安全性

## 使用 HTTPS

- **强制 HTTPS**：所有 OAuth 请求必须使用 HTTPS
- **验证证书**：确保 SSL 证书有效
- **防止中间人攻击**：使用 TLS 加密

## 状态管理

- **存储令牌**：安全地存储访问令牌和刷新令牌
- **令牌过期**：在令牌过期前使用刷新令牌
- **撤销授权**：提供用户撤销授权的界面

## 错误处理

- **优雅降级**：处理 API 错误时提供友好的错误信息
- **重试机制**：对于临时性错误实现自动重试
- **日志记录**：记录所有 OAuth 相关操作以便调试
          `
        },
        {
          id: 'examples',
          title: '代码示例',
          content: `
## JavaScript 示例

### 完整授权流程

\`\`\`javascript
// 1. 构建授权 URL
const authUrl = new URL('https://ruanm.pages.dev/oauth/authorize')
authUrl.searchParams.set('client_id', 'YOUR_CLIENT_ID')
authUrl.searchParams.set('redirect_uri', 'YOUR_REDIRECT_URI')
authUrl.searchParams.set('response_type', 'code')
authUrl.searchParams.set('scope', 'read write')
authUrl.searchParams.set('state', generateRandomState())

// 2. 重定向用户到授权页面
window.location.href = authUrl.toString()

// 3. 处理授权回调
const urlParams = new URLSearchParams(window.location.search)
const code = urlParams.get('code')

if (code) {
  // 4. 使用授权码换取访问令牌
  const tokenResponse = await fetch('https://yourdomain.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET',
      redirect_uri: 'YOUR_REDIRECT_URI'
    })
  })

  const { access_token, refresh_token } = await tokenResponse.json()

  // 5. 存储令牌
  localStorage.setItem('oauth_access_token', access_token)
  localStorage.setItem('oauth_refresh_token', refresh_token)

  // 6. 使用访问令牌调用 API
  const apiResponse = await fetch('https://ruanm.pages.dev/api/user', {
    headers: {
      'Authorization': \`Bearer \${access_token}\`
    }
  })

  const userData = await apiResponse.json()
  console.log('用户数据:', userData)
}
\`\`\`

### 刷新令牌

\`\`\`javascript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('oauth_refresh_token')

  const response = await fetch('https://ruanm.pages.dev/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET'
    })
  })

  const { access_token, refresh_token: newRefreshToken } = await response.json()

  localStorage.setItem('oauth_access_token', access_token)
  localStorage.setItem('oauth_refresh_token', newRefreshToken)

  return access_token
}
\`\`\`

### API 调用

\`\`\`javascript
async function callApi(endpoint, options = {}) {
  let accessToken = localStorage.getItem('oauth_access_token')

  if (!accessToken) {
    throw new Error('未找到访问令牌')
  }

  const response = await fetch('https://ruanm.pages.dev/api' + endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': 'Bearer ' + accessToken
    }
  })

  if (response.status === 401) {
    accessToken = await refreshAccessToken()
    localStorage.setItem('oauth_access_token', accessToken)

    return callApi(endpoint, options)
  }

  return response.json()
}
\`\`\`
          `
        },
        {
          id: 'troubleshooting',
          title: '故障排除',
          content: `
## 常见问题

### 授权失败

**问题**：用户拒绝授权
**解决**：检查重定向 URI 是否正确，确保用户理解授权内容

### 令牌无效

**问题**：访问令牌已过期或无效
**解决**：使用刷新令牌获取新的访问令牌

### Client Secret 错误

**问题**：Client ID 或 Client Secret 不正确
**解决**：检查应用管理页面中的凭证是否正确

### 重定向错误

**问题**：重定向 URI 不匹配
**解决**：确保重定向 URI 与创建应用时设置的一致

### 权限不足

**问题**：应用请求的权限不足
**解决**：在授权请求中包含所需的权限范围

## 调试技巧

### 查看日志

在浏览器控制台中查看详细的错误信息：

\`\`\`javascript
console.log('OAuth 授权码:', code)
console.log('访问令牌:', accessToken)
console.log('错误信息:', error)
\`\`\`

### 测试端点

使用 curl 或 Postman 测试 OAuth 端点：

\`\`\`bash
# 测试令牌端点
curl -X POST https://ruanm.pages.dev/oauth/token \\
  -H "Content-Type: application/json" \\
  -d '{\n    "grant_type": "authorization_code",\n    "code": "AUTHORIZATION_CODE",\n    "client_id": "YOUR_CLIENT_ID",\n    "client_secret": "YOUR_CLIENT_SECRET",\n    "redirect_uri": "YOUR_REDIRECT_URI"\n  }'
\`\`\`

### 检查授权状态

在应用管理页面查看已授权的应用和令牌状态。
          `
        }
      ]
    }
  ]

  const filteredDocuments = searchQuery
    ? documents.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.sections.some(section => 
          section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : documents

  return (
    <div className="min-h-screen bg-background text-primary">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">OAuth 2.0 文档</h1>
          </div>
          <a
            href={`${basePath}/docs`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>返回文档中心</span>
          </a>
        </div>

        <div className="flex gap-8">
          <div className="w-72 flex-shrink-0">
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索 OAuth 文档..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                />
                <Search className="absolute right-3 top-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="bg-card rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => toggleDoc(doc.id)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">{doc.title}</h3>
                    </div>
                    {expandedDocs.has(doc.id) ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  {expandedDocs.has(doc.id) && (
                    <div className="border-t border-border">
                      {doc.sections.map((section) => (
                        <div key={section.id} className="border-b border-border last:border-b-0">
                          <button
                            onClick={() => selectSection(doc.id, section.id)}
                            className={`w-full text-left px-6 py-4 hover:bg-muted transition-colors ${
                              activeSection === `${doc.id}-${section.id}` ? 'bg-muted' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{section.title}</span>
                              {activeSection === `${doc.id}-${section.id}` && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-card rounded-lg border border-border min-h-[600px]">
            {activeSection ? (
              <div className="p-8">
                {documents.map((doc) => 
                  doc.sections.map((section) => 
                    activeSection === `${doc.id}-${section.id}` && (
                      <div key={`${doc.id}-${section.id}`}>
                        <h2 className="text-2xl font-bold mb-6 text-primary">{section.title}</h2>
                        <div className="prose prose-sm max-w-none text-primary">
                          {(() => {
                            const elements = []
                            let inCodeBlock = false
                            let inTable = false
                            let currentCode = ''
                            let currentLanguage = 'text'
                            let tableRows: string[] = []
                            
                            section.content.split('\n').forEach((line, index) => {
                              if (line.startsWith('```')) {
                                if (inCodeBlock) {
                                  const codeId = `code-${index}-${Date.now()}`
                                  elements.push(
                                    <div key={codeId} className="my-4 relative group">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <Code className="w-4 h-4 text-primary" />
                                          <span className="text-sm text-muted-foreground">{currentLanguage}</span>
                                        </div>
                                        <button
                                          onClick={() => copyToClipboard(currentCode.trim(), codeId)}
                                          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors text-sm opacity-0 group-hover:opacity-100"
                                        >
                                          {copiedCode === codeId ? (
                                            <>
                                              <Check className="w-4 h-4 text-green-500" />
                                              <span className="text-green-500">已复制</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-4 h-4" />
                                              <span>复制</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      <pre className="bg-background border border-border rounded-lg p-4 overflow-x-auto">
                                        <code className="text-sm">{currentCode}</code>
                                      </pre>
                                    </div>
                                  )
                                  inCodeBlock = false
                                  currentCode = ''
                                  currentLanguage = 'text'
                                } else {
                                  currentLanguage = line.match(/```(\w+)/)?.[1] || 'text'
                                  inCodeBlock = true
                                  currentCode = '' // 重置代码内容
                                }
                              } else if (inCodeBlock) {
                                currentCode += line + '\n'
                              } else if (line.startsWith('|')) {
                                if (!inTable) {
                                  inTable = true
                                  tableRows = []
                                }
                                tableRows.push(line)
                              } else if (inTable) {
                                if (tableRows.length > 0) {
                                  const validRows = tableRows.filter(row => {
                                    const trimmed = row.trim()
                                    if (!trimmed.startsWith('|')) return false
                                    const hasContent = trimmed.replace(/[|\s\-:]/g, '').length > 0
                                    const isSeparator = /^\|\s*\-+\s*(\|\s*\-+\s*)*\|$/.test(trimmed)
                                    return hasContent && !isSeparator
                                  })
                                  
                                  if (validRows.length > 0) {
                                    elements.push(
                                      <table key={`table-${index}`} className="w-full my-4 border-collapse border border-border">
                                        <tbody>
                                          {validRows.map((row, rowIndex) => {
                                            const cells = row.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim())
                                            if (cells.length > 0) {
                                              return (
                                                <tr key={rowIndex} className="border-b border-border">
                                                  {cells.map((cell, cellIndex) => (
                                                    <td key={cellIndex} className="px-4 py-2 text-sm border-r border-border last:border-r-0">
                                                      {cell}
                                                    </td>
                                                  ))}
                                                </tr>
                                              )
                                            }
                                            return null
                                          })}
                                        </tbody>
                                      </table>
                                    )
                                  }
                                }
                                inTable = false
                                tableRows = []
                                
                                if (line.startsWith('## ')) {
                                  elements.push(
                                    <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-primary">
                                      {line.replace('## ', '')}
                                    </h3>
                                  )
                                } else if (line.startsWith('### ')) {
                                  elements.push(
                                    <h4 key={index} className="text-lg font-semibold mt-4 mb-2 text-primary">
                                      {line.replace('### ', '')}
                                    </h4>
                                  )
                                } else if (line.startsWith('- **')) {
                                  elements.push(
                                    <li key={index} className="list-disc list-inside ml-4 my-2 text-sm">
                                      <span className="text-primary">{line.replace('- ', '')}</span>
                                    </li>
                                  )
                                } else if (line.trim()) {
                                  elements.push(
                                    <p key={index} className="mb-2 text-sm leading-relaxed">
                                      {line}
                                    </p>
                                  )
                                }
                              } else if (line.startsWith('## ')) {
                                elements.push(
                                  <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-primary">
                                    {line.replace('## ', '')}
                                  </h3>
                                )
                              } else if (line.startsWith('### ')) {
                                elements.push(
                                  <h4 key={index} className="text-lg font-semibold mt-4 mb-2 text-primary">
                                    {line.replace('### ', '')}
                                  </h4>
                                )
                              } else if (line.startsWith('- **')) {
                                elements.push(
                                  <li key={index} className="list-disc list-inside ml-4 my-2 text-sm">
                                    <span className="text-primary">{line.replace('- ', '')}</span>
                                  </li>
                                )
                              } else if (line.trim()) {
                                elements.push(
                                  <p key={index} className="mb-2 text-sm leading-relaxed">
                                    {line}
                                  </p>
                                )
                              }
                            })
                            
                            if (inTable && tableRows.length > 0) {
                              const validRows = tableRows.filter(row => {
                                 const trimmed = row.trim()
                                 if (!trimmed.startsWith('|')) return false
                                 const hasContent = trimmed.replace(/[|\s\-:]/g, '').length > 0
                                 const isSeparator = /^\|\s*\-+\s*(\|\s*\-+\s*)*\|$/.test(trimmed)
                                 return hasContent && !isSeparator
                               })
                              
                              if (validRows.length > 0) {
                                elements.push(
                                  <table key={`table-end`} className="w-full my-4 border-collapse border border-border">
                                     <tbody>
                                       {validRows.map((row, rowIndex) => {
                                         const cells = row.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim())
                                         if (cells.length > 0) {
                                           return (
                                             <tr key={rowIndex} className="border-b border-border">
                                               {cells.map((cell, cellIndex) => (
                                                 <td key={cellIndex} className="px-4 py-2 text-sm border-r border-border last:border-r-0">
                                                   {cell}
                                                 </td>
                                               ))}
                                             </tr>
                                           )
                                         }
                                         return null
                                       })}
                                    </tbody>
                                  </table>
                                )
                              }
                            }
                            
                            return elements
                          })()}
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">选择文档章节</h3>
                  <p className="text-sm text-muted-foreground">从左侧菜单选择一个章节开始浏览</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OAuthDocsPage

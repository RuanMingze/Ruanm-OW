import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface AIRequest {
  model?: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const openRouterApiKey = process.env.OPENROUTER_API_KEY

    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY 环境变量未设置' },
        { status: 500 }
      )
    }

    let body: AIRequest
    try {
      const rawBody = await request.text()
      console.log('接收到的请求体:', rawBody)

      if (!rawBody) {
        return NextResponse.json(
          { error: '请求体不能为空' },
          { status: 400 }
        )
      }

      body = JSON.parse(rawBody)
    } catch (parseError) {
      console.error('解析请求体失败:', parseError)
      return NextResponse.json(
        { error: '请求体不是有效的JSON格式' },
        { status: 400 }
      )
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: '缺少必要参数：messages' },
        { status: 400 }
      )
    }

    const model = body.model || 'deepseek/deepseek-v3.2'

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://ruanmgjx.dpdns.org',
        'X-Title': 'Ruanm',
      },
      body: JSON.stringify({
        model,
        messages: body.messages,
        temperature: body.temperature,
        max_tokens: body.max_tokens,
        stream: body.stream || false,
      }),
    })

    let openRouterResponse
    try {
      const rawResponse = await response.text()
      console.log('OpenRouter API 响应:', rawResponse)

      if (!rawResponse) {
        throw new Error('OpenRouter API 返回空响应')
      }

      openRouterResponse = JSON.parse(rawResponse)
    } catch (parseError) {
      console.error('解析 OpenRouter API 响应失败:', parseError)
      return NextResponse.json(
        { error: '解析 OpenRouter API 响应失败' },
        { status: 500 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: '调用 AI 服务失败', details: openRouterResponse },
        { status: response.status }
      )
    }

    return NextResponse.json(openRouterResponse, { status: 200 })
  } catch (error) {
    console.error('调用 AI 服务时发生错误:', error)
    return NextResponse.json(
      { error: '调用 AI 服务时发生内部错误' },
      { status: 500 }
    )
  }
}

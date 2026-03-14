import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

interface ImageRequest {
  model?: string
  prompt: string
  size?: string
  quality?: string
  n?: number
}

// 处理 OPTIONS 预检请求
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}

async function handleRequest(request: NextRequest) {
  try {
    const openRouterApiKey = process.env.OPENROUTER_API_KEY

    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY 环境变量未设置' },
        { status: 500, headers: corsHeaders }
      )
    }

    let prompt: string
    let model: string = 'google/gemini-2.5-flash-image-preview'
    let size: string = '1024x1024'
    let quality: string = 'standard'
    let n: number = 1

    // 检查请求方法
    if (request.method === 'GET') {
      // 从查询参数获取
      const url = new URL(request.url)
      prompt = url.searchParams.get('prompt') || ''
      model = url.searchParams.get('model') || model
      size = url.searchParams.get('size') || size
      quality = url.searchParams.get('quality') || quality
      n = parseInt(url.searchParams.get('n') || '1')
    } else {
      // 从请求体获取
      let body: ImageRequest
      try {
        const rawBody = await request.text()
        console.log('接收到的请求体:', rawBody)

        if (!rawBody) {
          return NextResponse.json(
            { error: '请求体不能为空' },
            { status: 400, headers: corsHeaders }
          )
        }

        body = JSON.parse(rawBody)
      } catch (parseError) {
        console.error('解析请求体失败:', parseError)
        return NextResponse.json(
          { error: '请求体不是有效的JSON格式' },
          { status: 400, headers: corsHeaders }
        )
      }

      prompt = body.prompt
      model = body.model || model
      size = body.size || size
      quality = body.quality || quality
      n = body.n || n
    }

    if (!prompt) {
      return NextResponse.json(
        { error: '缺少必要参数：prompt' },
        { status: 400, headers: corsHeaders }
      )
    }

    const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://ruanmgjx.dpdns.org',
        'X-Title': 'Ruanm',
      },
      body: JSON.stringify({
        model,
        prompt,
        size,
        quality,
        n,
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
        { status: 500, headers: corsHeaders }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: '调用 AI 服务失败', details: openRouterResponse },
        { status: response.status, headers: corsHeaders }
      )
    }

    return NextResponse.json(openRouterResponse, { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error('调用 AI 服务时发生错误:', error)
    return NextResponse.json(
      { error: '调用 AI 服务时发生内部错误' },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request)
}

export async function POST(request: NextRequest) {
  return handleRequest(request)
}

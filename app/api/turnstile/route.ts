import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ success: false, error: '验证码缺失' }, { status: 400 })
    }

    const secretKey = process.env.CF_TURNSTILE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ success: false, error: '服务器配置错误' }, { status: 500 })
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    })

    const result = await response.json()

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: '验证码验证失败' }, { status: 400 })
    }
  } catch (error) {
    console.error('验证验证码时出错:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

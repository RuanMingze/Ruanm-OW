import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { grant_type, code, refresh_token, client_id, client_secret, redirect_uri } = body

    // 验证必需参数
    if (!grant_type) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: '缺少grant_type参数' },
        { status: 400 }
      )
    }

    if (grant_type === 'authorization_code') {
      // 授权码模式
      if (!code || !client_id || !client_secret || !redirect_uri) {
        return NextResponse.json(
          { error: 'invalid_request', error_description: '缺少必需参数' },
          { status: 400 }
        )
      }

      // 验证客户端
      const { data: clientData, error: clientError } = await supabase
        .from('oauth_applications')
        .select('*')
        .eq('client_id', client_id)
        .eq('client_secret', client_secret)
        .single()

      if (clientError || !clientData) {
        return NextResponse.json(
          { error: 'invalid_client', error_description: '无效的客户端凭证' },
          { status: 401 }
        )
      }

      // 验证授权码
      const { data: codeData, error: codeError } = await supabase
        .from('oauth_authorization_codes')
        .select('*')
        .eq('code', code)
        .eq('client_id', client_id)
        .single()

      if (codeError || !codeData) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: '无效的授权码' },
          { status: 400 }
        )
      }

      // 检查授权码是否过期
      if (new Date(codeData.expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: '授权码已过期' },
          { status: 400 }
        )
      }

      // 检查重定向URI是否匹配
      if (codeData.redirect_uri !== redirect_uri) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: '重定向URI不匹配' },
          { status: 400 }
        )
      }

      // 生成访问令牌和刷新令牌
      const accessToken = generateToken(64)
      const refreshToken = generateToken(64)
      const expiresAt = new Date(Date.now() + 3600 * 1000) // 1小时后过期

      // 保存令牌到数据库
      const { error: tokenError } = await supabase
        .from('oauth_tokens')
        .insert({
          access_token: accessToken,
          refresh_token: refreshToken,
          client_id: client_id,
          user_id: codeData.user_id,
          scopes: codeData.scopes,
          expires_at: expiresAt.toISOString()
        })

      if (tokenError) {
        return NextResponse.json(
          { error: 'server_error', error_description: '令牌保存失败' },
          { status: 500 }
        )
      }

      // 删除已使用的授权码
      await supabase
        .from('oauth_authorization_codes')
        .delete()
        .eq('code', code)

      return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: refreshToken,
        scope: codeData.scopes
      })

    } else if (grant_type === 'refresh_token') {
      // 刷新令牌模式
      if (!refresh_token || !client_id || !client_secret) {
        return NextResponse.json(
          { error: 'invalid_request', error_description: '缺少必需参数' },
          { status: 400 }
        )
      }

      // 验证客户端
      const { data: clientData, error: clientError } = await supabase
        .from('oauth_applications')
        .select('*')
        .eq('client_id', client_id)
        .eq('client_secret', client_secret)
        .single()

      if (clientError || !clientData) {
        return NextResponse.json(
          { error: 'invalid_client', error_description: '无效的客户端凭证' },
          { status: 401 }
        )
      }

      // 验证刷新令牌
      const { data: tokenData, error: tokenError } = await supabase
        .from('oauth_tokens')
        .select('*')
        .eq('refresh_token', refresh_token)
        .eq('client_id', client_id)
        .single()

      if (tokenError || !tokenData) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: '无效的刷新令牌' },
          { status: 400 }
        )
      }

      // 生成新的访问令牌和刷新令牌
      const newAccessToken = generateToken(64)
      const newRefreshToken = generateToken(64)
      const expiresAt = new Date(Date.now() + 3600 * 1000) // 1小时后过期

      // 更新令牌
      const { error: updateError } = await supabase
        .from('oauth_tokens')
        .update({
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          expires_at: expiresAt.toISOString()
        })
        .eq('id', tokenData.id)

      if (updateError) {
        return NextResponse.json(
          { error: 'server_error', error_description: '令牌更新失败' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: newRefreshToken,
        scope: tokenData.scopes
      })

    } else {
      return NextResponse.json(
        { error: 'unsupported_grant_type', error_description: '不支持的授权类型' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('令牌端点错误:', error)
    return NextResponse.json(
      { error: 'server_error', error_description: '服务器内部错误' },
      { status: 500 }
    )
  }
}

function generateToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

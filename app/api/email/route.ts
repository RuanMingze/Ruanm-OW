import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// 接口请求参数类型
interface EmailRequest {
  reply_to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 获取环境变量
    const resendApiKey = process.env.RESEND_API_KEY;
    const supportEmail = process.env.RESEND_SUPPORT_EMAIL;

    // 验证环境变量是否存在
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY 环境变量未设置' },
        { status: 500 }
      );
    }

    if (!supportEmail) {
      return NextResponse.json(
        { error: 'RESEND_SUPPORT_EMAIL 环境变量未设置' },
        { status: 500 }
      );
    }

    // 解析请求体
    let body: EmailRequest;
    try {
      // 先获取原始请求体文本，以便在解析失败时查看
      const rawBody = await request.text();
      console.log('接收到的请求体:', rawBody);
      
      if (!rawBody) {
        return NextResponse.json(
          { error: '请求体不能为空' },
          { status: 400 }
        );
      }
      
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('解析请求体失败:', parseError);
      return NextResponse.json(
        { error: '请求体不是有效的JSON格式' },
        { status: 400 }
      );
    }

    // 验证请求参数
    if (!body.reply_to || !body.subject || !body.text) {
      return NextResponse.json(
        { error: '缺少必要参数：reply_to, subject, text' },
        { status: 400 }
      );
    }

    // 调用 Resend API 发送邮件
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'xmt20160124@outlook.com',
        reply_to: body.reply_to,
        subject: body.subject,
        text: body.text,
        html: body.html,
      }),
    });

    // 解析 Resend API 响应
    let resendResponse;
    try {
      // 先获取原始响应文本，以便在解析失败时查看
      const rawResponse = await response.text();
      console.log('Resend API 响应:', rawResponse);
      
      if (!rawResponse) {
        throw new Error('Resend API 返回空响应');
      }
      
      resendResponse = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error('解析 Resend API 响应失败:', parseError);
      return NextResponse.json(
        { error: '解析 Resend API 响应失败' },
        { status: 500 }
      );
    }

    // 检查响应状态
    if (!response.ok) {
      return NextResponse.json(
        { error: '发送邮件失败', details: resendResponse },
        { status: response.status }
      );
    }

    // 返回成功响应
    return NextResponse.json(
      { success: true, message: '邮件发送成功', data: resendResponse },
      { status: 200 }
    );
  } catch (error) {
    console.error('发送邮件时发生错误:', error);
    return NextResponse.json(
      { error: '发送邮件时发生内部错误' },
      { status: 500 }
    );
  }
}

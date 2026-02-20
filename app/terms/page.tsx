'use client'

import { FileText, AlertCircle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { CardWithGlowEffect } from '@/components/card-with-glow-effect'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(0 0% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 50%) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />
      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <a
          href={`${basePath}/`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回主页</span>
        </a>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold">服务条款</h1>
          </div>
          <p className="text-muted-foreground">
            最后更新日期：2026年2月18日
          </p>
        </div>

        <div className="space-y-8">
          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4">接受条款</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                欢迎使用 Ruanm 的产品和服务。通过访问或使用我们的服务，您同意遵守本服务条款。如果您不同意这些条款，请不要使用我们的服务。
              </p>
              <p>
                我们保留随时修改这些条款的权利。修改后的条款将在本页面发布后立即生效。继续使用我们的服务即表示您接受修改后的条款。
              </p>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              服务描述
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Ruanm 提供以下产品和服务：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>PaperStation 浏览器</li>
                <li>RuanmScreenSaver 屏保程序</li>
                <li>阮铭泽工具箱</li>
                <li>小R AI助手</li>
                <li>ChickRubGo 搜索引擎</li>
                <li>相关文档和支持服务</li>
              </ul>
              <p className="mt-4">
                我们保留随时修改、暂停或终止任何服务的权利，恕不另行通知。
              </p>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4">用户责任</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>使用我们的服务时，您同意：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>提供准确、完整和最新的信息</li>
                <li>维护账户安全，对您的账户活动负责</li>
                <li>不与他人共享您的账户凭据</li>
                <li>不干扰或破坏服务的运行</li>
                <li>不传播病毒、恶意软件或其他有害代码</li>
                <li>不侵犯他人的知识产权或隐私权</li>
              </ul>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-500" />
              禁止行为
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>您不得使用我们的服务进行以下活动：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>非法或未经授权的活动</li>
                <li>传播仇恨言论、骚扰或歧视性内容</li>
                <li>侵犯他人的知识产权</li>
                <li>未经授权访问或使用他人的账户</li>
                <li>滥用、操纵或破坏服务</li>
                <li>未经授权收集用户数据</li>
                <li>发布虚假或误导性信息</li>
                <li>违反任何适用的法律法规</li>
              </ul>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4">隐私保护</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                您的隐私对我们很重要。我们的隐私政策说明了我们如何收集、使用和保护您的信息。使用我们的服务即表示您同意我们的隐私政策。
              </p>
              <p>
                请访问我们的隐私政策页面以了解更多信息：<a href={`${basePath}/privacy`} className="text-primary hover:underline">隐私政策</a>
              </p>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4">免责声明</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                我们的服务按"现状"和"可用"基础提供，不提供任何明示或暗示的保证。
              </p>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4">责任限制</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                在法律允许的最大范围内，我们不对以下情况承担责任：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>任何间接、偶然、特殊或后果性损害</li>
                <li>利润损失、数据丢失或业务中断</li>
                <li>因使用或无法使用服务而产生的任何损害</li>
                <li>因第三方行为或不可抗力事件造成的损害</li>
              </ul>
              <p className="mt-4">
                在任何情况下，我们的总责任不超过您为使用服务支付的金额（如有）。
              </p>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4">服务终止</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                我们保留随时暂停或终止您对服务的访问的权利，原因包括但不限于：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>违反本服务条款</li>
                <li>从事欺诈或非法活动</li>
                <li>滥用或破坏服务</li>
                <li>长期不活跃账户</li>
              </ul>
              <p className="mt-4">
                终止后，您对服务的访问权将被立即撤销，我们可能会删除您的账户信息。
              </p>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4">联系我们</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                如果您对本服务条款有任何疑问，请通过以下方式联系我们：
              </p>
              <ul className="list-none space-y-2 ml-4">
                <li>邮箱：xmt20160124@outlook.com</li>
                <li>GitHub：https://github.com/RuanMingze/Ruanm-OW</li>
              </ul>
            </div>
          </CardWithGlowEffect>
        </div>
      </div>
    </div>
  )
}

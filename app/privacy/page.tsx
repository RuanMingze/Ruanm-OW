'use client'

import { Shield, Eye, Cookie, Lock, ArrowLeft } from 'lucide-react'
import { CardWithGlowEffect } from '@/components/card-with-glow-effect'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function PrivacyPolicyPage() {
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
            <Shield className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold">隐私政策</h1>
          </div>
          <p className="text-muted-foreground">
            最后更新日期：2026年2月18日
          </p>
        </div>

        <div className="space-y-8">
          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              信息收集
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                我们重视您的隐私，并致力于保护您的个人信息。本隐私政策说明了我们如何收集、使用和保护您的信息。
              </p>
              <h3 className="text-lg font-semibold text-primary mt-4">我们收集的信息类型</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>账户信息：注册时提供的用户名、邮箱地址</li>
                <li>使用数据：访问日志、产品使用情况、搜索记录</li>
                <li>设备信息：浏览器类型、操作系统、IP地址</li>
                <li>Cookie数据：用于改善用户体验的Cookie信息</li>
              </ul>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" />
              信息使用
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>我们使用收集的信息用于以下目的：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>提供、维护和改进我们的服务</li>
                <li>处理您的请求和交易</li>
                <li>发送您请求的信息和更新</li>
                <li>分析和改进产品性能</li>
                <li>防止欺诈和滥用</li>
              </ul>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6 text-primary" />
              Cookie政策
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                我们使用Cookie和类似技术来收集信息并改善您的体验。Cookie是存储在您设备上的小型文本文件。
              </p>
              <h3 className="text-lg font-semibold text-primary mt-4">Cookie类型</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>必要Cookie：确保网站正常运行</li>
                <li>性能Cookie：收集使用数据以改善性能</li>
                <li>功能Cookie：记住您的偏好设置</li>
                <li>营销Cookie：用于个性化广告（可选）</li>
              </ul>
              <p className="mt-4">
                您可以通过浏览器设置管理Cookie偏好，但请注意，禁用某些Cookie可能会影响网站功能。
              </p>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4">信息共享</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>我们不会出售、交易或租借您的个人信息。我们仅在以下情况下共享信息：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>获得您的明确同意</li>
                <li>为提供服务所必需（如第三方支付处理）</li>
                <li>与可信的第三方服务提供商合作（在保密协议下）</li>
              </ul>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4">数据安全</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                我们采取合理的安全措施来保护您的信息，包括：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>使用加密技术保护数据传输</li>
                <li>实施访问控制和身份验证</li>
                <li>定期进行安全审计和漏洞扫描</li>
                <li>限制员工对个人信息的访问</li>
              </ul>
              <p className="mt-4">
                请注意，没有任何互联网传输或存储方法是100%安全的。虽然我们努力保护您的信息，但我们无法保证绝对安全。
              </p>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4">您的权利</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>您对自己的个人信息享有以下权利：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>访问：查看我们持有的关于您的信息</li>
                <li>更正：更新或更正不准确的信息</li>
                <li>删除：要求删除您的个人信息</li>
                <li>限制：限制我们如何使用您的信息</li>
                <li>反对：反对某些信息处理活动</li>
                <li>数据可携带：以结构化格式获取您的数据</li>
              </ul>
              <p className="mt-4">
                如需行使这些权利，请通过 xmt20160124@outlook.com 联系我们。
              </p>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4">儿童隐私</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                我们的服务不面向12岁以下（不包括12岁）的儿童。我们不会故意收集12岁以下儿童的个人信息。如果我们发现无意中收集了此类信息，我们将立即删除。
              </p>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4">政策变更</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                我们可能会不时更新本隐私政策。重大变更时，我们会通过网站通知您。我们建议您定期查看本政策以了解最新信息。
              </p>
            </div>
          </CardWithGlowEffect>

          <CardWithGlowEffect className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-4">联系我们</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                如果您对本隐私政策有任何疑问或关注，请通过以下方式联系我们：
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

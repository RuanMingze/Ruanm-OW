'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, User, Briefcase, Send, CheckCircle, AlertCircle, Home } from 'lucide-react'

const products = [
  { id: 'paperstation', name: 'PaperStation 浏览器' },
  { id: 'screensaver', name: 'RuanmScreenSaver 屏保程序' },
  { id: 'toolbox', name: '阮铭泽工具箱' },
  { id: 'ai', name: '小R AI助手' },
  { id: 'search', name: 'ChickRubGo搜索引擎' },
]

export default function BetaPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    occupation: '',
    product: '',
    experience: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入您的姓名'
    }

    if (!formData.email.trim()) {
      newErrors.email = '请输入您的邮箱地址'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    if (!formData.product) {
      newErrors.product = '请选择您想要测试的产品'
    }

    if (!formData.experience.trim()) {
      newErrors.experience = '请描述您的测试经验'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitStatus('idle')

    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      
      const applicationData = {
        ...formData,
        timestamp: Date.now(),
      }
      
      localStorage.setItem('betaApplication', JSON.stringify(applicationData))
      
      console.log('Beta测试申请已提交:', formData)
      console.log('模拟发送邮件到: xmt20160124@outlook.com')
    }, 2000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-32 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl text-balance mb-6">
            Beta测试资格申请
          </h1>
          <p className="text-lg text-muted-foreground">
            申请成为我们的Beta测试用户，抢先体验最新功能，帮助我们一起打造更好的产品！
          </p>
        </div>

        {submitStatus === 'success' ? (
          <div className="flex flex-col items-center gap-6 p-12 bg-card rounded-2xl border border-border">
            <CheckCircle size={64} className="text-green-500" />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-4">
                申请已提交！
              </h2>
              <p className="text-muted-foreground mb-6">
                感谢您的申请！我们会尽快审核您的信息，并通过邮件通知您审核结果。
              </p>
              <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                <p className="font-medium mb-2">申请详情：</p>
                <ul className="space-y-1">
                  <li>姓名：{formData.name}</li>
                  <li>邮箱：{formData.email}</li>
                  <li>申请产品：{products.find(p => p.id === formData.product)?.name}</li>
                </ul>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSubmitStatus('idle')
                    setFormData({
                      name: '',
                      email: '',
                      age: '',
                      occupation: '',
                      product: '',
                      experience: '',
                      notes: '',
                    })
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                >
                  提交新的申请
                </button>
                <a
                  href="/user"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-accent transition-all duration-300"
                >
                  <Home size={18} />
                  返回用户中心
                </a>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User 
                      size={18} 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="请输入您的姓名"
                      className={`w-full pl-12 pr-4 py-3 rounded-lg border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
                        errors.name ? 'border-red-500' : 'border-border'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                    邮箱地址 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail 
                      size={18} 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="请输入您的邮箱地址"
                      className={`w-full pl-12 pr-4 py-3 rounded-lg border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
                        errors.email ? 'border-red-500' : 'border-border'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-primary mb-2">
                    年龄（可选）
                  </label>
                  <input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    placeholder="请输入您的年龄"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="occupation" className="block text-sm font-medium text-primary mb-2">
                    职业（可选）
                  </label>
                  <div className="relative">
                    <Briefcase 
                      size={18} 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      id="occupation"
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => handleChange('occupation', e.target.value)}
                      placeholder="请输入您的职业"
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="product" className="block text-sm font-medium text-primary mb-2">
                  想要测试的产品 <span className="text-red-500">*</span>
                </label>
                <select
                  id="product"
                  value={formData.product}
                  onChange={(e) => handleChange('product', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
                    errors.product ? 'border-red-500' : 'border-border'
                  }`}
                >
                  <option value="">请选择产品</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {errors.product && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.product}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-primary mb-2">
                  测试经验 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  placeholder="请描述您之前的测试经验，包括测试过的产品、发现的问题等"
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors resize-none ${
                    errors.experience ? 'border-red-500' : 'border-border'
                  }`}
                />
                {errors.experience && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.experience}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-primary mb-2">
                  其他备注（可选）
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="如果您有其他想说明的内容，请在这里填写"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    提交申请中...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    提交申请
                  </>
                )}
              </button>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-primary mb-3">
                申请须知
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 请确保填写的信息真实有效</li>
                <li>• 我们会通过邮件通知您审核结果</li>
                <li>• Beta测试可能存在不稳定性和bug</li>
                <li>• 测试期间请及时反馈问题和建议</li>
                <li>• 我们尊重您的隐私，不会向第三方分享您的信息</li>
              </ul>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

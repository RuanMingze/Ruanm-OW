'use client'

import { useState, useEffect } from 'react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Activity, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

interface StatusItem {
  id: string
  name: string
  status: 'operational' | 'degraded' | 'down'
  uptime: number
  lastUpdated: string
}

function StatusPage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [uptime, setUptime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [statuses, setStatuses] = useState<StatusItem[]>([])
  const [mounted, setMounted] = useState(false)

  const startDate = new Date('2026-02-17T13:32:00')

  useEffect(() => {
    setMounted(true)
    const now = new Date()
    setCurrentTime(now)
    
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)
      
      const diff = now.getTime() - startDate.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setUptime({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadStatuses()
  }, [])

  const loadStatuses = async () => {
    try {
      const response = await fetch('/statuses.json')
      if (response.ok) {
        const data = await response.json()
        setStatuses(data)
      } else {
        console.error('状态数据加载失败:', response.statusText)
      }
    } catch (error) {
      console.error('获取状态失败:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Activity className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return '正常运行'
      case 'degraded':
        return '性能下降'
      case 'down':
        return '服务中断'
      default:
        return '未知'
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500/10 border-green-500/30'
      case 'degraded':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'down':
        return 'bg-red-500/10 border-red-500/30'
      default:
        return 'bg-gray-500/10 border-gray-500/30'
    }
  }

  const overallStatus = statuses.length > 0 && statuses.every(s => s.status === 'operational') ? 'operational' : 'degraded'

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">系统状态</h1>
              <p className="text-muted-foreground">实时监控系统运行状况</p>
            </div>

            <div className={`rounded-lg border p-6 mb-8 ${getStatusClass(overallStatus)}`}>
              <div className="flex items-center gap-4 mb-4">
                {getStatusIcon(overallStatus)}
                <div>
                  <h2 className="text-2xl font-bold">{getStatusText(overallStatus)}</h2>
                  <p className="text-sm text-muted-foreground">所有系统运行正常</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="border border-border rounded-lg bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold">系统运行时间</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">{uptime.days}</span>
                    <span className="text-muted-foreground">天</span>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="text-2xl font-bold">{uptime.hours}</span>
                      <span className="text-muted-foreground text-sm ml-1">小时</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold">{uptime.minutes}</span>
                      <span className="text-muted-foreground text-sm ml-1">分钟</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold">{uptime.seconds}</span>
                      <span className="text-muted-foreground text-sm ml-1">秒</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    自 2026年2月17日 13:32 起
                  </p>
                </div>
              </div>

              <div className="border border-border rounded-lg bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold">当前时间</h3>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-primary">
                    {mounted && currentTime ? currentTime.toLocaleTimeString('zh-CN', { hour12: false }) : '--:--:--'}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {mounted && currentTime ? currentTime.toLocaleDateString('zh-CN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'long'
                    }) : '加载中...'}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg bg-card">
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-semibold">服务状态</h3>
              </div>
              <div className="divide-y divide-border">
                {statuses.length > 0 ? (
                  statuses.map((item) => (
                    <div key={item.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(item.status)}
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            最后更新: {new Date(item.lastUpdated).toLocaleString('zh-CN')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>暂无状态数据</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default StatusPage

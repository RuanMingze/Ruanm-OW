'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Download, Github, ArrowRight, Monitor, Terminal, Check, Zap, Home, Cpu, FileCode, Settings, Command } from 'lucide-react'
import Link from 'next/link'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const screenshots = [
  { src: `${basePath}/Desktop-Screenshots-1.png`, alt: 'Ruanm 官网桌面版 主界面' },
  { src: `${basePath}/Desktop-Screenshots-2.png`, alt: 'Ruanm 官网桌面版 命令行工具' },
]

const features = [
  {
    icon: Monitor,
    title: '原生桌面体验',
    description: '完整的桌面应用程序界面，提供流畅的用户交互体验'
  },
  {
    icon: Terminal,
    title: '命令行工具',
    description: '支持 ruanm-ow 命令行工具，快速启动应用'
  },
  {
    icon: Check,
    title: '环境变量管理',
    description: '自动配置应用环境变量，智能PATH管理'
  },
  {
    icon: Zap,
    title: '精简模式',
    description: '支持精简版安装，隐藏原生模式入口'
  }
]

const techStack = [
  {
    icon: Cpu,
    name: 'Electron',
    version: '40.6.0',
    description: '跨平台桌面应用框架'
  },
  {
    icon: FileCode,
    name: 'Node.js',
    version: 'Latest',
    description: 'JavaScript 运行时'
  },
  {
    icon: Settings,
    name: 'Inno Setup',
    version: '6.6.1',
    description: 'Windows 安装程序生成器'
  },
  {
    icon: Command,
    name: 'PowerShell',
    version: '7',
    description: 'Windows 环境变量管理'
  }
]

function FeatureCard({ feature, idx }: { feature: any; idx: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return
      
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setMousePosition({ x, y })
    }

    const card = cardRef.current
    if (card) {
      card.addEventListener('mousemove', handleMouseMove)
      card.addEventListener('mouseenter', () => setIsHovered(true))
      card.addEventListener('mouseleave', () => setIsHovered(false))
    }

    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove)
        card.removeEventListener('mouseenter', () => setIsHovered(true))
        card.removeEventListener('mouseleave', () => setIsHovered(false))
      }
    }
  }, [])

  return (
    <div
      ref={cardRef}
      key={feature.title}
      data-aos="fade-up"
      data-aos-delay={idx * 100}
      className="relative group rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(224, 112, 32, 0.15), transparent 60%)`,
            opacity: 1
          }}
        />
      )}
      <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <feature.icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="relative mb-2 text-lg font-semibold">{feature.title}</h3>
      <p className="relative text-sm text-muted-foreground">
        {feature.description}
      </p>
    </div>
  )
}

function TechCard({ tech, idx }: { tech: any; idx: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return
      
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setMousePosition({ x, y })
    }

    const card = cardRef.current
    if (card) {
      card.addEventListener('mousemove', handleMouseMove)
      card.addEventListener('mouseenter', () => setIsHovered(true))
      card.addEventListener('mouseleave', () => setIsHovered(false))
    }

    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove)
        card.removeEventListener('mouseenter', () => setIsHovered(true))
        card.removeEventListener('mouseleave', () => setIsHovered(false))
      }
    }
  }, [])

  return (
    <div
      ref={cardRef}
      key={tech.name}
      data-aos="fade-up"
      data-aos-delay={idx * 100}
      className="relative group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(224, 112, 32, 0.15), transparent 60%)`,
            opacity: 1
          }}
        />
      )}
      <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <tech.icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="relative mb-2 text-lg font-semibold">{tech.name}</h3>
      <p className="relative text-sm text-muted-foreground mb-2">{tech.version}</p>
      <p className="relative text-xs text-muted-foreground">{tech.description}</p>
    </div>
  )
}

export default function DesktopPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const currentIndexRef = useRef(currentIndex)
  const downloadCardRef = useRef<HTMLDivElement>(null)
  const [downloadMousePosition, setDownloadMousePosition] = useState({ x: 0, y: 0 })
  const [isDownloadHovered, setIsDownloadHovered] = useState(false)

  // 同步currentIndex到ref
  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
    setProgress(0)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!downloadCardRef.current) return
      
      const rect = downloadCardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setDownloadMousePosition({ x, y })
    }

    const card = downloadCardRef.current
    if (card) {
      card.addEventListener('mousemove', handleMouseMove)
      card.addEventListener('mouseenter', () => setIsDownloadHovered(true))
      card.addEventListener('mouseleave', () => setIsDownloadHovered(false))
    }

    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove)
        card.removeEventListener('mouseenter', () => setIsDownloadHovered(true))
        card.removeEventListener('mouseleave', () => setIsDownloadHovered(false))
      }
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + (100 / 80)
        if (newProgress >= 100) {
          // 使用ref获取最新的currentIndex值
          const nextIndex = (currentIndexRef.current + 1) % screenshots.length
          console.log('切换截图到:', screenshots[nextIndex].src)
          setCurrentIndex(nextIndex)
          return 0
        }
        return newProgress
      })
    }, 100)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <nav className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`${basePath}/`} className="flex items-center gap-2.5">
                <Image
                  src={`${basePath}/desktop.png`}
                  alt="Ruanm Logo"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
                <span className="text-lg font-semibold tracking-tight">Ruanm 官网桌面版</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <a
                href={`${basePath}/`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Home className="w-4 h-4" />
                <span>返回主页</span>
              </a>
            </div>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pb-16 pt-20 md:pb-24 md:pt-28">
            <div className="mb-8 flex justify-center" data-aos="fade-down">
              <Image
                src={`${basePath}/desktop.png`}
                alt="Ruanm Logo"
                width={95}
                height={95}
                className="rounded-lg"
              />
            </div>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl" data-aos="fade-up">
                <span className="text-primary">Ruanm 官网</span>
                <br />
                桌面版
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground" data-aos="fade-up" data-aos-delay="100">
                基于 Electron 框架构建的跨平台桌面应用程序，提供更好的用户体验和更丰富的功能
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="https://github.com/RuanMingze/Ruanm-OW-Desktop/releases/download/1.0.0/Ruanm-OW-Desktop-Setup.exe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <Download className="h-5 w-5" />
                  下载安装程序
                </a>
                <a
                  href="https://github.com/RuanMingze/Ruanm-OW-Desktop/releases/download/1.0.0/Ruanm-OW-Desktop.zip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-8 py-3 text-base font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  <Github className="h-5 w-5" />
                  下载压缩包
                </a>
              </div>
            </div>

            <div className="relative mx-auto mt-16 w-full max-w-5xl" data-aos="zoom-in-up" data-aos-delay="400">
              <div className="flex items-center justify-between">
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 flex-1">
                  <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-red-400" />
                      <span className="h-3 w-3 rounded-full bg-yellow-400" />
                      <span className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="ml-4 flex-1 rounded-md bg-background/80 px-4 py-1 text-center text-xs text-muted-foreground">
                      Ruanm 官网桌面版
                    </div>
                  </div>
                  <div className="relative aspect-video">
                    <Image
                      src={screenshots[currentIndex].src}
                      alt={screenshots[currentIndex].alt}
                      fill
                      className="object-cover object-top transition-opacity duration-500"
                      priority={currentIndex === 0}
                    />
                  </div>
                </div>
                
                <div className="ml-8 h-64 w-2 rounded-full bg-border">
                  <div 
                    className="rounded-full bg-primary transition-all duration-100 ease-linear"
                    style={{ height: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-center space-x-2">
                {screenshots.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`h-3 w-3 rounded-full transition-colors ${index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
                    aria-label={`查看截图 ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-12 text-center" data-aos="fade-up">
              核心功能
            </h2>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, idx) => (
                <FeatureCard key={feature.title} feature={feature} idx={idx} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-12 text-center" data-aos="fade-up">
              技术栈
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {techStack.map((tech, idx) => (
                <TechCard key={tech.name} tech={tech} idx={idx} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-2xl border border-border bg-card p-12 shadow-lg">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-12 text-center" data-aos="fade-up">
                安装指南
              </h2>

              <div className="mx-auto max-w-2xl">
                <div className="space-y-6">
                <div className="flex gap-4" data-aos="fade-up" data-aos-delay="100">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold">下载安装程序</h3>
                    <p className="text-sm text-muted-foreground">
                      下载 Ruanm-OW-Desktop-Setup.exe 安装程序
                    </p>
                  </div>
                </div>

                <div className="flex gap-4" data-aos="fade-up" data-aos-delay="200">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold">运行安装程序</h3>
                    <p className="text-sm text-muted-foreground">
                      双击安装程序，按照向导完成安装
                    </p>
                  </div>
                </div>

                <div className="flex gap-4" data-aos="fade-up" data-aos-delay="300">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold">选择安装选项</h3>
                    <p className="text-sm text-muted-foreground">
                      根据需要选择安装选项（桌面图标、快捷方式等）
                    </p>
                  </div>
                </div>

                <div className="flex gap-4" data-aos="fade-up" data-aos-delay="400">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold">完成安装</h3>
                    <p className="text-sm text-muted-foreground">
                      点击"完成"按钮，启动应用程序
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 rounded-xl border border-border bg-card p-6 shadow-sm" data-aos="fade-up" data-aos-delay="500">
                <h3 className="mb-4 text-lg font-semibold">系统要求</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Windows 10 或更高版本</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>至少 4GB RAM</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>500MB 可用磁盘空间</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div 
              ref={downloadCardRef}
              className="relative rounded-2xl border border-border bg-card p-12 text-center shadow-lg"
            >
              {isDownloadHovered && (
                <div 
                  className="absolute inset-0 rounded-2xl transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${downloadMousePosition.x}px ${downloadMousePosition.y}px, rgba(224, 112, 32, 0.15), transparent 60%)`,
                    opacity: 1
                  }}
                />
              )}
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4" data-aos="fade-up">
                准备好体验了吗？
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground" data-aos="fade-up" data-aos-delay="100">
                立即下载 Ruanm 官网桌面版，开始享受更好的桌面应用体验
              </p>
              <div className="relative flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="https://github.com/RuanMingze/Ruanm-OW-Desktop/releases/download/1.0.0/Ruanm-OW-Desktop-Setup.exe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <Download className="h-5 w-5" />
                  下载安装程序
                </a>
                <a
                  href="https://github.com/RuanMingze/Ruanm-OW-Desktop/releases/download/1.0.0/Ruanm-OW-Desktop.zip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-8 py-3 text-base font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  <Github className="h-5 w-5" />
                  下载压缩包
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

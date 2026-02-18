import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { AosProvider } from '@/components/aos-provider'

import './globals.css'

// 获取 basePath 用于静态资源路径
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export const metadata: Metadata = {
  title: 'Ruanm - 用户体验至上的好产品',
  description: 'Ruanm 专注于打造用户体验至上的好产品，以设计驱动，以体验为本。',
  icons: {
    icon: `${basePath}/logo.png`,
  },
}

export const viewport: Viewport = {
  themeColor: '#e07020',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AosProvider>{children}</AosProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

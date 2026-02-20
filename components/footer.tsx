"use client"

import { usePathname } from 'next/navigation'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export function Footer() {
  const pathname = usePathname()
  const isProductsPage = pathname === '/products'

  return (
    <footer className="border-t border-border px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <span className="text-lg font-bold tracking-tight text-primary">Ruanm</span>
          <p className="text-xs text-muted-foreground">
            {'用户体验至上的好产品'}
          </p>
        </div>

        <nav className="flex items-center gap-8" aria-label="Footer navigation">
          {
            [
              { label: "关于", href: "#about" },
              { label: "理念", href: "#philosophy" },
              { label: "服务", href: "#services" },
              { label: "产品", href: "/products" },
              { label: "联系", href: "#contact" },
              { label: "隐私政策", href: "/privacy" },
              { label: "服务条款", href: "/terms" },
            ].map((link) => {
              const href = link.href.startsWith('#') 
                ? link.href
                : `${basePath}${link.href}`
              return (
                <a
                  key={link.href}
                  href={href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              )
            })
          }
        </nav>

        <p className="text-xs text-muted-foreground">
          {`© ${new Date().getFullYear()} Ruanm. All rights reserved.`}
        </p>
      </div>
    </footer>
  )
}

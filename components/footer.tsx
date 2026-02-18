"use client"

import { usePathname } from 'next/navigation'

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
          {[
            { label: "关于", href: isProductsPage ? "/#about" : "#about" },
            { label: "理念", href: isProductsPage ? "/#philosophy" : "#philosophy" },
            { label: "服务", href: isProductsPage ? "/#services" : "#services" },
            { label: "产品", href: "/products" },
            { label: "联系", href: isProductsPage ? "/#contact" : "#contact" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-xs text-muted-foreground">
          {`© ${new Date().getFullYear()} Ruanm. All rights reserved.`}
        </p>
      </div>
    </footer>
  )
}

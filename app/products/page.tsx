'use client'

import { Suspense, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductsLoading } from "@/components/products-loading"

const ProductsSection = dynamic(() => import('@/components/products-section').then(mod => ({ default: mod.ProductsSection })), {
  ssr: false,
  loading: () => <ProductsLoading />
})

function ProductsContent() {
  return <ProductsSection />
}

export default function ProductsPage() {
  console.log('ProductsPage rendered, notice should appear')
  
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<ProductsLoading />}>
          <ProductsContent />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}

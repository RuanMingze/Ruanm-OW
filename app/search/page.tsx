'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

function SearchRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (query) {
        const targetUrl = `https://ruanmingze.github.io/ChickRubGo/search?q=${encodeURIComponent(query)}`
        window.location.href = targetUrl
      } else {
        const targetUrl = `https://ruanmingze.github.io/ChickRubGo/`
        window.location.href = targetUrl
      }
    }
  }, [query, router])

  return null
}

export default function SearchRedirectPage() {
  return (
    <Suspense fallback={null}>
      <SearchRedirectContent />
    </Suspense>
  )
}

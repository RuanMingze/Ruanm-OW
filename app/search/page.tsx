'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function SearchRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q')

  useEffect(() => {
    if (query) {
      const targetUrl = `https://ruanmingze.github.io/ChickRubGo/search?q=${encodeURIComponent(query)}`
      window.location.href = targetUrl
    } else {
      const targetUrl = `https://ruanmingze.github.io/ChickRubGo/`
      window.location.href = targetUrl
    }
  }, [query, router])

  return null
}

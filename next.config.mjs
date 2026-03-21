/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  typescript: {
    ignoreBuildErrors: true,
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  images: {
    unoptimized: true,
  },
  // 排除 Backend 文件夹
  experimental: {
    outputFileTracingExcludes: {
      '*': ['./Backend/**/*'],
    },
  },
}

export default nextConfig

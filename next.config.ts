import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "connect-src 'self' blob: https://pub-7da8c20292624389aac188ff567fa99f.r2.dev https://api.anthropic.com https://api.mymemory.translated.net",
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma', 'pdf2json', 'pdf-parse', 'pdfjs-dist'],
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  async rewrites() {
    const cdn = (process.env.NEXT_PUBLIC_SIGNS_CDN ?? 'https://pub-7da8c20292624389aac188ff567fa99f.r2.dev').replace(
      /\/$/,
      '',
    )
    return [
      {
        source: '/signs/:path*',
        destination: `${cdn}/signs/:path*`,
      },
    ]
  },
}

export default nextConfig

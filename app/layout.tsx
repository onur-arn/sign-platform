import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/components/Providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const ICON_V = '5'

export const metadata: Metadata = {
  title: 'Sign Language',
  description: 'Plateforme de traduction en langue des signes',
  icons: {
    icon: [
      { url: `/icons/boule-32.png?v=${ICON_V}`, type: 'image/png', sizes: '32x32' },
      { url: `/icons/boule-16.png?v=${ICON_V}`, type: 'image/png', sizes: '16x16' },
      { url: `/icons/boule-192.png?v=${ICON_V}`, type: 'image/png', sizes: '192x192' },
      { url: `/icons/boule.ico?v=${ICON_V}` },
    ],
    shortcut: `/icons/boule-32.png?v=${ICON_V}`,
    apple: [{ url: `/icons/boule-180.png?v=${ICON_V}`, sizes: '180x180', type: 'image/png' }],
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full`}>
      <head>
        {/* Liens explicites pour forcer le navigateur hors du cache /favicon.ico Vercel/Next */}
        <link rel="icon" href={`/icons/boule-32.png?v=${ICON_V}`} type="image/png" sizes="32x32" />
        <link rel="icon" href={`/icons/boule-16.png?v=${ICON_V}`} type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href={`/icons/boule-180.png?v=${ICON_V}`} />
      </head>
      <body className="min-h-full antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

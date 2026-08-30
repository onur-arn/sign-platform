import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/components/Providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Sign Language',
  description: 'Plateforme de traduction en langue des signes',
  icons: {
    icon: [
      { url: '/favicon.png?v=4', type: 'image/png', sizes: '32x32' },
      { url: '/icon-32.png?v=4', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png?v=4', type: 'image/png', sizes: '192x192' },
      { url: '/favicon.ico?v=4' },
    ],
    shortcut: '/favicon.ico?v=4',
    apple: [{ url: '/apple-touch-icon.png?v=4', sizes: '180x180', type: 'image/png' }],
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

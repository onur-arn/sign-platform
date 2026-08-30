import type { Metadata } from 'next'
import { Fraunces, Source_Serif_4 } from 'next/font/google'
import Providers from '@/components/Providers'
import './globals.css'

const display = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
})

const body = Source_Serif_4({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Sign Platform',
  description: 'Plateforme de traduction en langue des signes',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

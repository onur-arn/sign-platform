'use client'

import { SessionProvider } from 'next-auth/react'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { DarkModeProvider } from '@/contexts/DarkModeContext'
import { AvatarProvider } from '@/contexts/AvatarContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={false}>
      <LanguageProvider>
        <DarkModeProvider>
          <AvatarProvider>{children}</AvatarProvider>
        </DarkModeProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}

'use client'

import { SessionProvider } from 'next-auth/react'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { DarkModeProvider } from '@/contexts/DarkModeContext'
import { AvatarProvider } from '@/contexts/AvatarContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <DarkModeProvider>
          <AvatarProvider>{children}</AvatarProvider>
        </DarkModeProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}

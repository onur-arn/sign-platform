'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { AVATAR_OPTIONS, DEFAULT_AVATAR_ID, getAvatar, type AvatarOption } from '@/lib/avatars'

type AvatarContextValue = {
  avatarId: string
  avatar: AvatarOption
  setAvatarId: (id: string) => void
  options: typeof AVATAR_OPTIONS
}

const AvatarContext = createContext<AvatarContextValue | undefined>(undefined)

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [avatarId, setAvatarIdState] = useState(DEFAULT_AVATAR_ID)

  useEffect(() => {
    const saved = localStorage.getItem('avatarId')
    if (saved && AVATAR_OPTIONS.some((a) => a.id === saved)) {
      setAvatarIdState(saved)
    }
  }, [])

  const setAvatarId = (id: string) => {
    setAvatarIdState(id)
    localStorage.setItem('avatarId', id)
  }

  return (
    <AvatarContext.Provider
      value={{ avatarId, avatar: getAvatar(avatarId), setAvatarId, options: AVATAR_OPTIONS }}
    >
      {children}
    </AvatarContext.Provider>
  )
}

export function useAvatar() {
  const ctx = useContext(AvatarContext)
  if (!ctx) throw new Error('useAvatar must be used within AvatarProvider')
  return ctx
}

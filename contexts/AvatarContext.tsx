'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useSession } from 'next-auth/react'
import { AVATAR_OPTIONS, DEFAULT_AVATAR_ID, getAvatar, type AvatarOption } from '@/lib/avatars'

/** Flag dédié : seul un clic « Continuer » (ou un choix dans la page Avatar) le pose. */
const ONBOARDING_DONE_KEY = 'avatarOnboardingDone'

type AvatarContextValue = {
  avatarId: string
  avatar: AvatarOption
  setAvatarId: (id: string) => void
  /** Aperçu pendant l’onboarding (mémoire seule, pas de confirmation). */
  previewAvatarId: (id: string) => void
  options: typeof AVATAR_OPTIONS
  /** true tant que l’utilisateur n’a jamais confirmé un avatar (1ʳᵉ connexion). */
  needsAvatarOnboarding: boolean
  /** Prêt après lecture localStorage / session (évite un flash du modal). */
  avatarReady: boolean
  completeAvatarOnboarding: (id: string) => void
}

const AvatarContext = createContext<AvatarContextValue | undefined>(undefined)

function userStorageKey(base: string, userKey: string | null): string {
  return userKey ? `${base}:${userKey}` : base
}

function readStoredAvatarId(userKey: string | null): string {
  if (typeof window === 'undefined') return DEFAULT_AVATAR_ID
  const scoped = userKey ? localStorage.getItem(userStorageKey('avatarId', userKey)) : null
  if (scoped && AVATAR_OPTIONS.some((a) => a.id === scoped)) return scoped
  const legacy = localStorage.getItem('avatarId')
  if (legacy && AVATAR_OPTIONS.some((a) => a.id === legacy)) return legacy
  return DEFAULT_AVATAR_ID
}

function readOnboardingDone(userKey: string | null): boolean {
  if (typeof window === 'undefined') return true
  if (!userKey) return true
  return localStorage.getItem(userStorageKey(ONBOARDING_DONE_KEY, userKey)) === '1'
}

function persistAvatar(userKey: string | null, id: string, markOnboardingDone: boolean) {
  localStorage.setItem(userStorageKey('avatarId', userKey), id)
  localStorage.setItem('avatarId', id)
  if (markOnboardingDone && userKey) {
    localStorage.setItem(userStorageKey(ONBOARDING_DONE_KEY, userKey), '1')
  }
}

export function AvatarProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const userKey = session?.user?.email?.toLowerCase() ?? null

  const [avatarId, setAvatarIdState] = useState(DEFAULT_AVATAR_ID)
  const [needsAvatarOnboarding, setNeedsAvatarOnboarding] = useState(false)
  const [avatarReady, setAvatarReady] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    const id = readStoredAvatarId(userKey)
    const done = readOnboardingDone(userKey)
    setAvatarIdState(id)
    setNeedsAvatarOnboarding(status === 'authenticated' && Boolean(userKey) && !done)
    setAvatarReady(status !== 'loading')
  }, [status, userKey])

  const setAvatarId = useCallback(
    (id: string) => {
      if (!AVATAR_OPTIONS.some((a) => a.id === id)) return
      setAvatarIdState(id)
      persistAvatar(userKey, id, true)
      setNeedsAvatarOnboarding(false)
    },
    [userKey],
  )

  const previewAvatarId = useCallback((id: string) => {
    if (!AVATAR_OPTIONS.some((a) => a.id === id)) return
    setAvatarIdState(id)
  }, [])

  const completeAvatarOnboarding = useCallback(
    (id: string) => {
      if (!AVATAR_OPTIONS.some((a) => a.id === id)) return
      setAvatarIdState(id)
      persistAvatar(userKey, id, true)
      setNeedsAvatarOnboarding(false)
    },
    [userKey],
  )

  const value = useMemo(
    () => ({
      avatarId,
      avatar: getAvatar(avatarId),
      setAvatarId,
      previewAvatarId,
      options: AVATAR_OPTIONS,
      needsAvatarOnboarding,
      avatarReady,
      completeAvatarOnboarding,
    }),
    [
      avatarId,
      setAvatarId,
      previewAvatarId,
      needsAvatarOnboarding,
      avatarReady,
      completeAvatarOnboarding,
    ],
  )

  return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>
}

export function useAvatar() {
  const ctx = useContext(AvatarContext)
  if (!ctx) throw new Error('useAvatar must be used within AvatarProvider')
  return ctx
}

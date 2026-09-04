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

function readHasChosenAvatar(userKey: string | null): boolean {
  if (typeof window === 'undefined') return true
  // Pas encore d’identité → ne pas afficher le modal
  if (!userKey) return true

  if (localStorage.getItem(userStorageKey('avatarChosen', userKey)) === '1') return true
  if (localStorage.getItem(userStorageKey('avatarId', userKey))) return true

  // Migration unique : anciens comptes avec avatar global (avant stockage par email)
  const alreadyMigrated = localStorage.getItem('avatarOnboardingMigrated') === '1'
  if (!alreadyMigrated) {
    const legacyChosen = localStorage.getItem('avatarChosen') === '1'
    const legacyId = localStorage.getItem('avatarId')
    if (legacyChosen || legacyId) {
      const id =
        legacyId && AVATAR_OPTIONS.some((a) => a.id === legacyId) ? legacyId : DEFAULT_AVATAR_ID
      persistAvatar(userKey, id, true)
      localStorage.setItem('avatarOnboardingMigrated', '1')
      return true
    }
  }
  return false
}

function persistAvatar(userKey: string | null, id: string, markChosen: boolean) {
  localStorage.setItem(userStorageKey('avatarId', userKey), id)
  localStorage.setItem('avatarId', id) // compat SignAvatarPlayer / anciens chemins
  if (markChosen) {
    localStorage.setItem(userStorageKey('avatarChosen', userKey), '1')
    localStorage.setItem('avatarChosen', '1')
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
    const chosen = readHasChosenAvatar(userKey)
    setAvatarIdState(id)
    setNeedsAvatarOnboarding(status === 'authenticated' && !chosen)
    setAvatarReady(true)
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

  /** Change l’avatar affiché sans confirmer (onboarding). */
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

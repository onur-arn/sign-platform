'use client'

import dynamic from 'next/dynamic'
import { useAvatar } from '@/contexts/AvatarContext'
import { useLanguage } from '@/contexts/LanguageContext'
import AvatarLoadingOverlay from '@/components/avatar/AvatarLoadingOverlay'

function AvatarChunkFallback() {
  const { t } = useLanguage()
  return (
    <div className="avatar-canvas relative overflow-hidden" style={{ minHeight: 280 }}>
      <AvatarLoadingOverlay label={t.dashboard.avatarLoadingFull} />
    </div>
  )
}

const SignAvatarPlayer = dynamic(() => import('@/components/avatar/SignAvatarPlayer'), {
  ssr: false,
  loading: () => <AvatarChunkFallback />,
})

/**
 * Modal bloquant à la 1ʳᵉ connexion : choisir un avatar, puis plus jamais.
 * La page Avatar reste disponible pour un changement volontaire ensuite.
 */
export default function AvatarOnboardingModal() {
  const { t } = useLanguage()
  const {
    avatarId,
    options,
    previewAvatarId,
    completeAvatarOnboarding,
    needsAvatarOnboarding,
    avatarReady,
  } = useAvatar()

  if (!avatarReady || !needsAvatarOnboarding) return null

  return (
    <div
      className="avatar-onboarding-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-onboarding-title"
    >
      <div className="avatar-onboarding-card panel">
        <h2 id="avatar-onboarding-title" className="panel-title">
          {t.dashboard.avatarOnboardingTitle}
        </h2>
        <p className="panel-desc">{t.dashboard.avatarOnboardingDesc}</p>

        <div className="avatar-onboarding-grid">
          <ul className="avatar-name-list">
            {options.map((opt) => (
              <li key={opt.id}>
                <button
                  type="button"
                  className={`avatar-name-item ${avatarId === opt.id ? 'selected' : ''}`}
                  onClick={() => previewAvatarId(opt.id)}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="avatar-onboarding-preview">
            <SignAvatarPlayer key={avatarId} text="" ts={0} language="fr" showControls={false} />
          </div>
        </div>

        <div className="avatar-onboarding-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => completeAvatarOnboarding(avatarId)}
          >
            {t.dashboard.avatarOnboardingConfirm}
          </button>
        </div>
      </div>
    </div>
  )
}

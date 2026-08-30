'use client'

import dynamic from 'next/dynamic'
import { useAvatar } from '@/contexts/AvatarContext'
import { useLanguage } from '@/contexts/LanguageContext'
import AvatarLoadingOverlay from '@/components/avatar/AvatarLoadingOverlay'

function AvatarChunkFallback() {
  const { t } = useLanguage()
  return (
    <div className="avatar-canvas relative overflow-hidden">
      <AvatarLoadingOverlay label={t.dashboard.avatarLoadingFull} />
    </div>
  )
}

const SignAvatarPlayer = dynamic(() => import('@/components/avatar/SignAvatarPlayer'), {
  ssr: false,
  loading: () => <AvatarChunkFallback />,
})

export default function AvatarStudioView() {
  const { t } = useLanguage()
  const { avatarId, setAvatarId, options } = useAvatar()

  return (
    <div className="avatar-studio">
      <aside className="panel avatar-studio-list">
        <h2 className="panel-title">{t.dashboard.navAvatar}</h2>
        <ul className="avatar-name-list">
          {options.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                className={`avatar-name-item ${avatarId === opt.id ? 'selected' : ''}`}
                onClick={() => setAvatarId(opt.id)}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="panel avatar-studio-preview">
        <SignAvatarPlayer key={avatarId} text="" ts={0} language="fr" showControls={false} />
      </div>
    </div>
  )
}

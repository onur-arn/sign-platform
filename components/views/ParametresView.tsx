'use client'

import { signOut } from 'next-auth/react'
import LanguageSelector from '@/components/LanguageSelector'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { useAvatar } from '@/contexts/AvatarContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ParametresView() {
  const { t } = useLanguage()
  const { avatar, options, avatarId, setAvatarId } = useAvatar()

  return (
    <div className="max-w-xl space-y-5">
      <div className="panel">
        <h2 className="panel-title">Paramètres</h2>
        <p className="panel-desc">Langue, apparence et avatar par défaut.</p>

        <div className="mb-5">
          <label className="field-label">Langue</label>
          <LanguageSelector />
        </div>

        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <label className="field-label">Apparence</label>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', margin: 0 }}>Mode clair / sombre</p>
          </div>
          <DarkModeToggle />
        </div>

        <div>
          <label className="field-label">Avatar</label>
          <select
            className="field"
            value={avatarId}
            onChange={(e) => setAvatarId(e.target.value)}
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Actuel : {avatar.label}
          </p>
        </div>
      </div>

      <div className="panel">
        <button type="button" className="btn btn-ghost" onClick={() => signOut({ callbackUrl: '/' })}>
          {t.dashboard.logout}
        </button>
      </div>
    </div>
  )
}

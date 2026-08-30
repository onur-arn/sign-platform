'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useAvatar } from '@/contexts/AvatarContext'

const SignAvatarPlayer = dynamic(() => import('@/components/avatar/SignAvatarPlayer'), {
  ssr: false,
  loading: () => (
    <div className="avatar-canvas" style={{ display: 'grid', placeItems: 'center', minHeight: 420 }}>
      <p style={{ color: 'var(--ink-muted)' }}>…</p>
    </div>
  ),
})

export default function AvatarStudioView() {
  const { avatarId, setAvatarId, options, avatar } = useAvatar()
  const [demoTs, setDemoTs] = useState(0)

  useEffect(() => {
    setDemoTs(Date.now())
  }, [avatarId])

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]">
      <div className="panel">
        <h2 className="panel-title">Avatar</h2>
        <p className="panel-desc">Choisissez l&apos;avatar qui signe pour vous. Sélection actuelle : {avatar.label}.</p>
        <div className="avatar-grid">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`avatar-pick ${avatarId === opt.id ? 'selected' : ''}`}
              onClick={() => setAvatarId(opt.id)}
            >
              <div className="name">{opt.label}</div>
              <div className="meta">{opt.pipeline === 'male' ? 'Pipeline male' : 'Pipeline female'}</div>
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-primary mt-4" onClick={() => setDemoTs(Date.now())}>
          Démo « bonjour »
        </button>
      </div>
      <div className="panel" style={{ padding: '0.85rem' }}>
        {demoTs > 0 ? (
          <SignAvatarPlayer key={avatarId} text="bonjour" ts={demoTs} language="fr" />
        ) : (
          <div className="avatar-canvas" style={{ display: 'grid', placeItems: 'center', minHeight: 420 }}>
            <p style={{ color: 'var(--ink-muted)' }}>{avatar.label}</p>
          </div>
        )}
      </div>
    </div>
  )
}

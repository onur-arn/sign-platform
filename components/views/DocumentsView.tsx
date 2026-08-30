'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import FileUpload from '@/components/upload/FileUpload'
import { useLanguage } from '@/contexts/LanguageContext'

const SignAvatarPlayer = dynamic(() => import('@/components/avatar/SignAvatarPlayer'), {
  ssr: false,
  loading: () => (
    <div className="avatar-canvas" style={{ display: 'grid', placeItems: 'center', minHeight: 360 }}>
      <p style={{ color: 'var(--ink-muted)' }}>…</p>
    </div>
  ),
})

export default function DocumentsView() {
  const { t, language } = useLanguage()
  const [extracted, setExtracted] = useState('')
  const [avatarText, setAvatarText] = useState({ value: '', ts: 0 })

  const onText = (text: string) => {
    setExtracted(text)
    setAvatarText({ value: text, ts: Date.now() })
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,400px)]">
      <div className="panel">
        <h2 className="panel-title">{t.dashboard.pdf}</h2>
        <p className="panel-desc">Importez un PDF pour en extraire le texte et le signer.</p>
        <FileUpload onTextExtracted={onText} />
        {extracted && (
          <div className="mt-5">
            <label className="field-label">Texte extrait</label>
            <textarea className="field" rows={10} value={extracted} readOnly />
            <button
              type="button"
              className="btn btn-primary mt-3"
              onClick={() => setAvatarText({ value: extracted, ts: Date.now() })}
            >
              {t.dashboard.translate}
            </button>
          </div>
        )}
      </div>
      <div className="panel" style={{ padding: '0.85rem' }}>
        <SignAvatarPlayer text={avatarText.value} ts={avatarText.ts} language={language} />
      </div>
    </div>
  )
}

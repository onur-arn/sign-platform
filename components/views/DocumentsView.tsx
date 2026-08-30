'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import FileUpload from '@/components/upload/FileUpload'
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

export default function DocumentsView() {
  const { t, language } = useLanguage()
  const [extracted, setExtracted] = useState('')
  const [avatarText, setAvatarText] = useState({ value: '', ts: 0 })

  return (
    <div className="view-grid">
      <div className="panel">
        <h2 className="panel-title">{t.dashboard.pdf}</h2>
        <FileUpload
          onTextExtracted={(text) => {
            setExtracted(text)
            // Ne pas lancer l’avatar automatiquement : l’utilisateur clique sur Traduire
          }}
        />
        {extracted && (
          <div className="mt-5">
            <label className="field-label">{t.dashboard.extractedText}</label>
            <textarea
              className="field"
              rows={8}
              value={extracted}
              onChange={(e) => setExtracted(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-primary mt-3 w-full"
              style={{ borderRadius: 9999 }}
              disabled={!extracted.trim()}
              onClick={() => setAvatarText({ value: extracted.trim(), ts: Date.now() })}
            >
              {t.dashboard.translate}
            </button>
          </div>
        )}
      </div>
      <div className="panel">
        <h2 className="panel-title">{t.dashboard.result}</h2>
        <SignAvatarPlayer text={avatarText.value} ts={avatarText.ts} language={language} />
      </div>
    </div>
  )
}

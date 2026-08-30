'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import VoiceInput from '@/components/VoiceInput'
import { useLanguage } from '@/contexts/LanguageContext'

const SignAvatarPlayer = dynamic(() => import('@/components/avatar/SignAvatarPlayer'), {
  ssr: false,
  loading: () => (
    <div className="avatar-canvas" style={{ display: 'grid', placeItems: 'center', minHeight: 420 }}>
      <p style={{ color: 'var(--ink-muted)' }}>Chargement de l&apos;avatar…</p>
    </div>
  ),
})

export default function TraduireView() {
  const { t, language } = useLanguage()
  const [text, setText] = useState('')
  const [avatarText, setAvatarText] = useState({ value: '', ts: 0 })
  const [inputLang, setInputLang] = useState<'fr' | 'en' | 'tr'>(language as 'fr' | 'en' | 'tr')

  const translate = (value: string) => {
    const v = value.trim()
    if (!v) return
    setText(v)
    setAvatarText({ value: v, ts: Date.now() })
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]">
      <div className="panel">
        <h2 className="panel-title">{t.dashboard.text}</h2>
        <p className="panel-desc">Saisissez un texte à traduire en langue des signes.</p>

        <div className="flex gap-2 mb-3">
          {(['fr', 'en', 'tr'] as const).map((code) => (
            <button
              key={code}
              type="button"
              className="letter-btn"
              style={inputLang === code ? { background: 'var(--indigo-wash)', color: 'var(--indigo)', borderColor: 'var(--indigo)' } : undefined}
              onClick={() => setInputLang(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>

        <textarea
          className="field"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.dashboard.textPlaceholder}
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" onClick={() => translate(text)}>
            {t.dashboard.translate}
          </button>
        </div>

        <div className="mt-6">
          <VoiceInput onTranscript={(transcript) => translate(transcript)} />
        </div>
      </div>

      <div className="panel" style={{ padding: '0.85rem' }}>
        <SignAvatarPlayer text={avatarText.value} ts={avatarText.ts} language={inputLang} />
      </div>
    </div>
  )
}

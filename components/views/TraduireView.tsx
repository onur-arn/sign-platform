'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import AvatarLoadingOverlay from '@/components/avatar/AvatarLoadingOverlay'

const SPEECH_LANG = { fr: 'fr-FR', en: 'en-GB', tr: 'tr-TR', pl: 'pl-PL' } as const

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

export default function TraduireView() {
  const { t, language } = useLanguage()
  const [text, setText] = useState('')
  const [avatarText, setAvatarText] = useState({ value: '', ts: 0 })
  const speechLang = SPEECH_LANG[language] ?? 'fr-FR'
  const { isListening, setIsListening, transcript, setTranscript, isSupported, error } =
    useSpeechRecognition({ language: speechLang, silenceMs: 2800 })

  const wasListeningRef = useRef(false)
  const skipAutoTranslateRef = useRef(false)

  // Affiche le texte reconnu en direct (y compris l’intérimaire)
  useEffect(() => {
    if (isListening) setText(transcript)
  }, [transcript, isListening])

  const translate = (value: string) => {
    const v = value.trim()
    if (!v) return
    setText(v)
    setAvatarText({ value: v, ts: Date.now() })
  }

  // Dès que l’écoute s’arrête (silence ou bouton), lancer la traduction
  useEffect(() => {
    if (wasListeningRef.current && !isListening) {
      if (skipAutoTranslateRef.current) {
        skipAutoTranslateRef.current = false
      } else {
        const spoken = transcript.trim()
        if (spoken) translate(spoken)
      }
    }
    wasListeningRef.current = isListening
  }, [isListening, transcript])

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false)
      return
    }
    setTranscript('')
    setText('')
    setIsListening(true)
  }

  const clearAll = () => {
    skipAutoTranslateRef.current = true
    setIsListening(false)
    setTranscript('')
    setText('')
  }

  return (
    <div className="view-grid">
      <div className="panel">
        <h2 className="panel-title">{t.dashboard.text}</h2>

        <textarea
          className="field"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.dashboard.textPlaceholder}
          disabled={isListening}
        />

        {isListening && (
          <p className="mt-2 text-sm font-medium" style={{ color: 'var(--teal)' }}>
            {t.dashboard.voiceListening}
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}
        {!isSupported && (
          <p className="mt-2 text-sm" style={{ color: 'var(--text-sub)' }}>
            {t.dashboard.voiceUnsupported}
          </p>
        )}

        <div className="translate-actions">
          {isSupported && (
            <button
              type="button"
              className={`btn btn-ghost translate-voice ${isListening ? 'listening' : ''}`}
              onClick={toggleVoice}
              aria-label={isListening ? t.dashboard.voiceStop : t.dashboard.voiceSpeak}
              aria-pressed={isListening}
            >
              {isListening ? (
                <span className="voice-btn-waves" aria-hidden>
                  <i />
                  <i />
                  <i />
                </span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" />
                </svg>
              )}
              <span className="translate-voice-label">
                {isListening ? t.dashboard.voiceStop : t.dashboard.voiceSpeak}
              </span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary translate-submit"
            disabled={!text.trim() || isListening}
            onClick={() => translate(text)}
          >
            {t.dashboard.translate}
          </button>

          <button
            type="button"
            className="btn btn-ghost translate-clear"
            disabled={!text.trim() && !isListening}
            onClick={clearAll}
            aria-label={t.dashboard.voiceClear}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">{t.dashboard.result}</h2>
        <SignAvatarPlayer text={avatarText.value} ts={avatarText.ts} language={language} />
      </div>
    </div>
  )
}

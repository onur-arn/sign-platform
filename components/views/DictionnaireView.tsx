'use client'

import { useMemo, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useLanguage } from '@/contexts/LanguageContext'
import { SIGN_LABELS_FR, SIGN_LABELS_EN, SIGN_LABELS_TR, SIGN_LABELS_PL } from '@/lib/signLabels'
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

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function removeAccents(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i')
}

function firstLetter(label: string) {
  const c = removeAccents(label.trim().toUpperCase())[0] ?? '#'
  return /[A-Z]/.test(c) ? c : '#'
}

export default function DictionnaireView() {
  const { t, language } = useLanguage()
  const [activeLetter, setActiveLetter] = useState('A')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<{ id: string; label: string; ts: number } | null>(null)

  const labelsMap = useMemo(() => {
    if (language === 'en') return SIGN_LABELS_EN
    if (language === 'pl') return SIGN_LABELS_PL
    if (language === 'tr') return SIGN_LABELS_TR
    return SIGN_LABELS_FR
  }, [language])

  const allSigns = useMemo(
    () =>
      Object.entries(labelsMap)
        .map(([signId, label]) => ({ signId, label }))
        .sort((a, b) =>
          removeAccents(a.label).localeCompare(removeAccents(b.label), undefined, { sensitivity: 'base' }),
        ),
    [labelsMap],
  )

  const displayed = useMemo(() => {
    if (search.trim()) {
      const q = removeAccents(search.trim().toLowerCase())
      return allSigns.filter((s) => removeAccents(s.label.toLowerCase()).includes(q))
    }
    if (activeLetter === 'ALL') return allSigns
    return allSigns.filter((s) => firstLetter(s.label) === activeLetter)
  }, [allSigns, activeLetter, search])

  const handleLetter = useCallback((letter: string) => {
    setActiveLetter(letter)
    setSearch('')
  }, [])

  return (
    <div className="view-grid">
      <div className="panel">
        <h2 className="panel-title">{t.admin.dictionary}</h2>
        <p className="panel-desc">
          {allSigns.length} {t.admin.dictionarySubtitle}
        </p>

        <input
          className="field mb-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.admin.dictionarySearch}
        />

        {!search && (
          <div className="letter-bar">
            <button
              type="button"
              className={`letter-btn ${activeLetter === 'ALL' ? 'active' : ''}`}
              onClick={() => handleLetter('ALL')}
            >
              {t.admin.dictionaryAll}
            </button>
            {ALPHABET.map((l) => (
              <button
                key={l}
                type="button"
                className={`letter-btn ${activeLetter === l ? 'active' : ''}`}
                onClick={() => handleLetter(l)}
              >
                {l}
              </button>
            ))}
            <button
              type="button"
              className={`letter-btn ${activeLetter === '#' ? 'active' : ''}`}
              onClick={() => handleLetter('#')}
            >
              {t.admin.dictionaryNumbers}
            </button>
          </div>
        )}

        {displayed.length === 0 ? (
          <p style={{ color: 'var(--text-sub)' }}>{t.admin.dictionaryNoResult}</p>
        ) : (
          <div className="dict-grid max-h-[480px] overflow-y-auto pr-1">
            {displayed.slice(0, 400).map((s) => (
              <button
                key={s.signId}
                type="button"
                className={`dict-chip ${selected?.id === s.signId ? 'active' : ''}`}
                onClick={() => setSelected({ id: s.signId, label: s.label, ts: Date.now() })}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">
          {selected ? (labelsMap[selected.id] ?? selected.label) : t.dashboard.result}
        </h2>
        {selected ? (
          <SignAvatarPlayer text="" ts={selected.ts} signId={selected.id} language={language} />
        ) : (
          <div className="avatar-canvas" style={{ display: 'grid', placeItems: 'center' }}>
            <p style={{ color: '#94a3b8' }}>{t.dashboard.selectSign}</p>
          </div>
        )}
      </div>
    </div>
  )
}

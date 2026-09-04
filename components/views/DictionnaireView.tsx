'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useLanguage } from '@/contexts/LanguageContext'
import { SIGN_LABELS_FR, SIGN_LABELS_EN, SIGN_LABELS_TR, SIGN_LABELS_PL } from '@/lib/signLabels'
import { buildDictionaryEntries } from '@/lib/dictionaryEntries'
import { isNumericExpression } from '@/lib/dictionarySemantics'
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

const ALPHABET_LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
/** Alphabet polonais (avec Q/V/X pour les emprunts). */
const ALPHABET_PL = 'AĄBCĆDEĘFGHIJKLŁMNŃOÓPQRSŚTUVWXYZŹŻ'.split('')
/** Alphabet turc. */
const ALPHABET_TR = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('')

const prefsCache = new Map<string, Record<string, string>>()

function alphabetForLang(lang: string): string[] {
  if (lang === 'pl') return ALPHABET_PL
  if (lang === 'tr') return ALPHABET_TR
  return ALPHABET_LATIN
}

function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
}

/** Première lettre de section selon la langue (PL/TR : lettres spécifiques). */
function dictionarySection(entry: { word: string; signId: string }, lang: string) {
  if (isNumericExpression(entry.signId, entry.word)) return '#'
  const cleaned = entry.word.trim().replace(/^[\s"'«»„‟‘’‚‛`´]+/u, '')
  if (!cleaned) return '#'

  if (lang === 'pl') {
    const c = cleaned[0]!.toLocaleUpperCase('pl-PL')
    if (ALPHABET_PL.includes(c)) return c
    const ascii = removeAccents(c)
    return /[A-Z]/.test(ascii) ? ascii : '#'
  }

  if (lang === 'tr') {
    const c = cleaned[0]!.toLocaleUpperCase('tr-TR')
    if (ALPHABET_TR.includes(c)) return c
    const ascii = removeAccents(c)
    return /[A-Z]/.test(ascii) ? ascii : '#'
  }

  const c = removeAccents(cleaned.toLocaleUpperCase('en-US'))[0] ?? '#'
  return /[A-Z]/.test(c) ? c : '#'
}

export default function DictionnaireView() {
  const { t, language } = useLanguage()
  const [activeLetter, setActiveLetter] = useState('A')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<{ id: string; label: string; ts: number } | null>(null)
  const [preferences, setPreferences] = useState<Record<string, string>>({})

  const dictionaryLang = language === 'en' ? 'en' : language === 'pl' ? 'pl' : language === 'tr' ? 'tr' : 'fr'

  const labelsMap = useMemo(() => {
    if (language === 'en') return SIGN_LABELS_EN
    if (language === 'pl') return SIGN_LABELS_PL
    if (language === 'tr') return SIGN_LABELS_TR
    return SIGN_LABELS_FR
  }, [language])

  // Préférences : cache mémoire, ne vide plus la liste pendant le fetch
  useEffect(() => {
    let cancelled = false
    const cached = prefsCache.get(dictionaryLang)
    if (cached) {
      setPreferences(cached)
    } else {
      setPreferences({})
    }

    fetch(`/api/dictionary/preferences?lang=${dictionaryLang}`, { cache: 'force-cache' })
      .then((res) => (res.ok ? res.json() : { preferences: {} }))
      .then((data) => {
        if (cancelled) return
        const next = data.preferences ?? {}
        prefsCache.set(dictionaryLang, next)
        setPreferences(next)
      })
      .catch(() => {
        if (!cancelled && !prefsCache.has(dictionaryLang)) {
          prefsCache.set(dictionaryLang, {})
          setPreferences({})
        }
      })
    return () => {
      cancelled = true
    }
  }, [dictionaryLang])

  const allSigns = useMemo(
    () => buildDictionaryEntries(labelsMap, dictionaryLang, preferences),
    [labelsMap, dictionaryLang, preferences],
  )

  const alphabet = useMemo(() => alphabetForLang(dictionaryLang), [dictionaryLang])

  useEffect(() => {
    if (activeLetter !== 'ALL' && activeLetter !== '#' && !alphabet.includes(activeLetter)) {
      setActiveLetter(alphabet[0] ?? 'A')
    }
  }, [alphabet, activeLetter])

  const displayed = useMemo(() => {
    if (search.trim()) {
      const q = removeAccents(search.trim().toLowerCase())
      return allSigns.filter((s) => s.normalized.includes(q) || removeAccents(s.word.toLowerCase()).includes(q))
    }
    if (activeLetter === 'ALL') return allSigns
    return allSigns.filter((s) => dictionarySection(s, dictionaryLang) === activeLetter)
  }, [allSigns, activeLetter, search, dictionaryLang])

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
            {alphabet.map((l) => (
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
            {displayed.map((s) => (
              <button
                key={`${s.senseKey}-${s.signId}`}
                type="button"
                className={`dict-chip ${selected?.id === s.signId && selected?.label === s.word ? 'active' : ''}`}
                onClick={() => setSelected({ id: s.signId, label: s.word, ts: Date.now() })}
              >
                {s.word}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">
          {selected ? selected.label : t.dashboard.result}
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

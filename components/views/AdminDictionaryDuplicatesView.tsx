'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useLanguage } from '@/contexts/LanguageContext'
import AvatarLoadingOverlay from '@/components/avatar/AvatarLoadingOverlay'

type DictLang = 'fr' | 'en' | 'tr' | 'pl'

type DuplicateCandidate = {
  signId: string
  label: string
  isPreferred: boolean
  isManual: boolean
}

type DuplicateRow = {
  word: string
  normalized: string
  preferredSignId: string
  isManual: boolean
  candidates: DuplicateCandidate[]
}

const SignAvatarPlayer = dynamic(() => import('@/components/avatar/SignAvatarPlayer'), {
  ssr: false,
  loading: () => (
    <div className="dict-dup-preview-canvas relative overflow-hidden">
      <AvatarLoadingOverlay label="…" />
    </div>
  ),
})

const DICT_LANGS: { id: DictLang; label: string }[] = [
  { id: 'fr', label: 'FR' },
  { id: 'en', label: 'EN' },
  { id: 'tr', label: 'TR' },
  { id: 'pl', label: 'PL' },
]

export default function AdminDictionaryDuplicatesView() {
  const { t, language } = useLanguage()
  const [dictLang, setDictLang] = useState<DictLang>('fr')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [onlyUnresolved, setOnlyUnresolved] = useState(true)
  const [offset, setOffset] = useState(0)
  const [items, setItems] = useState<DuplicateRow[]>([])
  const [total, setTotal] = useState(0)
  const [manualCount, setManualCount] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ signId: string; ts: number } | null>(null)

  const limit = 20

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => {
    setOffset(0)
  }, [dictLang, debouncedSearch, onlyUnresolved])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        lang: dictLang,
        offset: String(offset),
        limit: String(limit),
        onlyUnresolved: onlyUnresolved ? '1' : '0',
      })
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await fetch(`/api/admin/dictionary-duplicates?${params}`, { cache: 'no-store' })
      if (!res.ok) {
        setError(t.admin.duplicatesLoadError)
        return
      }
      const data = await res.json()
      setItems(data.items ?? [])
      setTotal(data.total ?? 0)
      setManualCount(data.manualCount ?? 0)
      setSavedCount(data.savedCount ?? 0)
    } catch {
      setError(t.dashboard.networkError)
    } finally {
      setLoading(false)
    }
  }, [dictLang, debouncedSearch, onlyUnresolved, offset, t, limit])

  useEffect(() => {
    void load()
  }, [load])

  const selectSign = async (row: DuplicateRow, signId: string) => {
    if (row.preferredSignId === signId && row.isManual) return
    const key = `${row.normalized}:${signId}`
    setSavingKey(key)
    setError(null)
    try {
      const res = await fetch('/api/admin/dictionary-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: dictLang, normalized: row.normalized, signId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(typeof data.error === 'string' ? data.error : t.admin.duplicatesSaveError)
        return
      }
      setPreview({ signId, ts: Date.now() })
      await load()
    } catch {
      setError(t.dashboard.networkError)
    } finally {
      setSavingKey(null)
    }
  }

  const page = Math.floor(offset / limit) + 1
  const pageCount = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-4">
      <div className="panel">
        <h3 className="text-lg m-0 mb-1">{t.admin.duplicatesTitle}</h3>
        <p className="panel-desc">{t.admin.duplicatesDesc}</p>

        <div className="dict-dup-toolbar">
          <div className="dict-dup-langs">
            {DICT_LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`letter-btn ${dictLang === l.id ? 'active' : ''}`}
                onClick={() => setDictLang(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <input
            className="field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.admin.duplicatesSearch}
          />

          <label className="dict-dup-filter">
            <input
              type="checkbox"
              checked={onlyUnresolved}
              onChange={(e) => setOnlyUnresolved(e.target.checked)}
            />
            <span>{t.admin.duplicatesOnlyPending}</span>
          </label>
        </div>

        <div className="dict-dup-stats">
          <span>{t.admin.duplicatesTotal.replace('{n}', String(total))}</span>
          <span>{t.admin.duplicatesResolved.replace('{n}', String(manualCount))}</span>
          <span>{t.admin.duplicatesSaved.replace('{n}', String(savedCount))}</span>
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

      {loading && items.length === 0 ? (
        <div className="grid place-items-center py-12">
          <div
            className="animate-spin rounded-full h-10 w-10 border-4"
            style={{ borderColor: 'rgba(91,164,176,0.2)', borderTopColor: '#5ba4b0' }}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="panel">
          <p style={{ color: 'var(--text-sub)', margin: 0 }}>{t.admin.duplicatesEmpty}</p>
        </div>
      ) : (
        <ul className="dict-dup-list space-y-3">
          {items.map((row) => (
            <li key={row.normalized} className="panel dict-dup-row">
              <div className="dict-dup-row-head">
                <strong className="dict-dup-word">{row.word}</strong>
                {row.isManual ? (
                  <span className="admin-badge admin-badge-ok">{t.admin.duplicatesChosen}</span>
                ) : (
                  <span className="admin-badge admin-badge-wait">{t.admin.duplicatesAuto}</span>
                )}
              </div>

              <div className="dict-dup-candidates">
                {row.candidates.map((c) => {
                  const key = `${row.normalized}:${c.signId}`
                  const isActive = row.preferredSignId === c.signId
                  return (
                    <div
                      key={c.signId}
                      className={`dict-dup-candidate ${isActive ? 'active' : ''}`}
                    >
                      <button
                        type="button"
                        className="dict-dup-candidate-main"
                        disabled={savingKey === key}
                        onClick={() => void selectSign(row, c.signId)}
                      >
                        <span className="dict-dup-candidate-radio" aria-hidden>
                          {isActive ? '●' : '○'}
                        </span>
                        <span className="dict-dup-candidate-label">{c.label}</span>
                        <code className="dict-dup-candidate-id">{c.signId}</code>
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setPreview({ signId: c.signId, ts: Date.now() })}
                      >
                        {t.admin.duplicatesPreview}
                      </button>
                    </div>
                  )
                })}
              </div>
            </li>
          ))}
        </ul>
      )}

      {total > limit && (
        <div className="dict-dup-pagination">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={offset <= 0 || loading}
            onClick={() => setOffset((v) => Math.max(0, v - limit))}
          >
            {t.admin.duplicatesPrev}
          </button>
          <span className="text-sm" style={{ color: 'var(--text-sub)' }}>
            {page} / {pageCount}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={offset + limit >= total || loading}
            onClick={() => setOffset((v) => v + limit)}
          >
            {t.admin.duplicatesNext}
          </button>
        </div>
      )}

      {preview && (
        <div className="panel dict-dup-preview">
          <h4 className="m-0 mb-2">{t.admin.duplicatesPreview}</h4>
          <SignAvatarPlayer
            text=""
            ts={preview.ts}
            signId={preview.signId}
            language={dictLang === language ? language : dictLang}
          />
        </div>
      )}
    </div>
  )
}

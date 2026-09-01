import {
  buildDictionaryEntries,
  extractWordsFromSign,
  resolvePreferredSignId,
  type Lang,
} from '@/lib/dictionaryEntries'
import { getSignLabelsMap } from '@/lib/signLabelsMap'

export type DuplicateCandidate = {
  signId: string
  label: string
  isPreferred: boolean
  isManual: boolean
}

export type DuplicateRow = {
  word: string
  normalized: string
  preferredSignId: string
  isManual: boolean
  candidates: DuplicateCandidate[]
}

function buildBuckets(labelsMap: Record<string, string>, lang: Lang) {
  const buckets = new Map<string, { signId: string; word: string }[]>()

  for (const [signId, label] of Object.entries(labelsMap)) {
    for (const { raw, normalized } of extractWordsFromSign(signId, label, lang)) {
      const list = buckets.get(normalized) ?? []
      if (!list.some((x) => x.signId === signId)) {
        list.push({ signId, word: raw })
      }
      buckets.set(normalized, list)
    }
  }

  return buckets
}

export function listDictionaryDuplicates(
  lang: Lang,
  preferences: Record<string, string>,
  options: { search?: string; offset?: number; limit?: number; onlyUnresolved?: boolean } = {},
): { items: DuplicateRow[]; total: number; manualCount: number } {
  const labelsMap = getSignLabelsMap(lang)
  const buckets = buildBuckets(labelsMap, lang)
  const search = options.search?.trim().toLowerCase() ?? ''
  const onlyUnresolved = options.onlyUnresolved ?? false

  let manualCount = 0
  const rows: DuplicateRow[] = []

  for (const [normalized, bucket] of buckets) {
    const uniqueSignIds = [...new Set(bucket.map((b) => b.signId))]
    if (uniqueSignIds.length < 2) continue

    const word = bucket[0]?.word ?? normalized
    if (search && !normalized.includes(search) && !word.toLowerCase().includes(search)) continue

    const { signId: preferredSignId, isManual } = resolvePreferredSignId(
      normalized,
      uniqueSignIds,
      labelsMap,
      lang,
      preferences,
    )

    if (isManual) manualCount++
    if (onlyUnresolved && isManual) continue

    rows.push({
      word,
      normalized,
      preferredSignId,
      isManual,
      candidates: uniqueSignIds.map((signId) => ({
        signId,
        label: labelsMap[signId] ?? signId,
        isPreferred: signId === preferredSignId,
        isManual: isManual && signId === preferredSignId,
      })),
    })
  }

  rows.sort((a, b) => a.normalized.localeCompare(b.normalized, undefined, { sensitivity: 'base' }))

  const offset = options.offset ?? 0
  const limit = options.limit ?? 30
  const items = rows.slice(offset, offset + limit)

  return { items, total: rows.length, manualCount }
}

/** Entrées finales du dictionnaire (avec préférences appliquées). */
export function buildDictionaryWithPreferences(
  lang: Lang,
  preferences: Record<string, string>,
) {
  return buildDictionaryEntries(getSignLabelsMap(lang), lang, preferences)
}

import {
  buildDictionaryEntries,
  clusterSynonymSigns,
  extractDictionarySenses,
  classifySignStructure,
  resolvePreferredSignId,
  type Lang,
} from '@/lib/dictionaryEntries'
import { DISABLED_SIGNS } from '@/lib/disabledSigns'
import { getSignLabelsMap } from '@/lib/signLabelsMap'

export type DuplicateCandidate = {
  signId: string
  label: string
  structure: string
  isPreferred: boolean
  isManual: boolean
}

export type DuplicateRow = {
  word: string
  lemma: string
  normalized: string
  preferredSignId: string
  isManual: boolean
  homonymNote?: string
  candidates: DuplicateCandidate[]
}

const STRUCTURE_LABEL: Record<string, string> = {
  dedicated: 'mot unique',
  phrase: 'expression',
  synonym_list: 'synonymes',
}

export function listDictionaryDuplicates(
  lang: Lang,
  preferences: Record<string, string>,
  options: { search?: string; offset?: number; limit?: number; onlyUnresolved?: boolean } = {},
): { items: DuplicateRow[]; total: number; manualCount: number } {
  const labelsMap = getSignLabelsMap(lang)
  const search = options.search?.trim().toLowerCase() ?? ''
  const onlyUnresolved = options.onlyUnresolved ?? false

  const lemmaToSignIds = new Map<string, Set<string>>()
  const lemmaDisplay = new Map<string, string>()

  for (const [signId, label] of Object.entries(labelsMap)) {
    if (DISABLED_SIGNS.has(signId)) continue
    for (const sense of extractDictionarySenses(signId, label, lang)) {
      const set = lemmaToSignIds.get(sense.lemma) ?? new Set()
      set.add(signId)
      lemmaToSignIds.set(sense.lemma, set)
      if (!lemmaDisplay.has(sense.lemma)) lemmaDisplay.set(sense.lemma, sense.word)
    }
  }

  let manualCount = 0
  const rows: DuplicateRow[] = []

  for (const [lemma, signIdSet] of lemmaToSignIds) {
    const allIds = [...signIdSet]
    const synonymClusters = clusterSynonymSigns(lemma, allIds, lang, labelsMap)
    const trueDuplicateClusters = synonymClusters.filter((c) => c.length >= 2)

    if (trueDuplicateClusters.length === 0) continue

    const word = lemmaDisplay.get(lemma) ?? lemma
    if (search && !lemma.includes(search) && !word.toLowerCase().includes(search)) continue

    for (const cluster of trueDuplicateClusters) {
      const { signId: preferredSignId, isManual } = resolvePreferredSignId(
        lemma,
        cluster,
        lang,
        preferences,
      )

      if (isManual) manualCount++
      if (onlyUnresolved && isManual) continue

      const homonymCount = allIds.length - cluster.length
      rows.push({
        word,
        lemma,
        normalized: lemma,
        preferredSignId,
        isManual,
        homonymNote:
          homonymCount > 0
            ? `${homonymCount} autre(s) signe(s) avec le même mot mais un sens différent (non listé)`
            : undefined,
        candidates: cluster.map((signId) => ({
          signId,
          label: labelsMap[signId] ?? signId,
          structure: STRUCTURE_LABEL[classifySignStructure(signId, labelsMap[signId] ?? '', lang)] ?? '',
          isPreferred: signId === preferredSignId,
          isManual: isManual && signId === preferredSignId,
        })),
      })
    }
  }

  rows.sort((a, b) => a.lemma.localeCompare(b.lemma, undefined, { sensitivity: 'base' }))

  const offset = options.offset ?? 0
  const limit = options.limit ?? 30
  return { items: rows.slice(offset, offset + limit), total: rows.length, manualCount }
}

export function buildDictionaryWithPreferences(lang: Lang, preferences: Record<string, string>) {
  return buildDictionaryEntries(getSignLabelsMap(lang), lang, preferences)
}

export function countDictionaryDuplicates(
  labelsMap: Record<string, string>,
  lang: Lang = 'fr',
): number {
  return listDictionaryDuplicates(lang, {}, { limit: 1_000_000 }).total
}

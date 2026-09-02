export type Lang = 'fr' | 'en' | 'tr' | 'pl'

export type DictionaryEntry = {
  word: string
  lemma: string
  /** Alias de lemma — compatibilité */
  normalized: string
  senseKey: string
  signId: string
}

import { DICTIONARY_PREFERRED_SIGN } from './dictionaryPreferences'
import { DISABLED_SIGNS } from './disabledSigns'
import {
  areSynonymSigns,
  clusterSynonymSigns,
  extractDictionarySenses,
  splitSignId,
  normalizeLemma,
} from './dictionarySemantics'

export {
  extractDictionarySenses,
  splitSignId,
  normalizeLemma,
  classifySignStructure,
  areSynonymSigns,
  clusterSynonymSigns,
} from './dictionarySemantics'

/** @deprecated Utiliser extractDictionarySenses */
export function extractWordsFromSign(signId: string, label: string, lang: Lang) {
  return extractDictionarySenses(signId, label, lang).map((s) => ({
    raw: s.word,
    normalized: s.lemma,
    tokenIndex: 0,
  }))
}

function scoreSignForLemma(signId: string, lemma: string): number {
  const tokens = splitSignId(signId).map(normalizeLemma)
  let score = 0
  if (tokens.length === 1 && tokens[0] === lemma) score += 100
  if (tokens[0] === lemma) score += 50
  if (tokens.includes(lemma)) score += 30
  if (signId === lemma || signId.startsWith(`${lemma}_`)) score += 40
  score -= tokens.length * 2
  score -= signId.length * 0.05
  return score
}

function pickBestInCluster(lemma: string, signIds: string[], preferences: Record<string, string>): string {
  const preferred = preferences[lemma]
  if (preferred && signIds.includes(preferred)) return preferred
  return signIds.reduce((best, cur) =>
    scoreSignForLemma(cur, lemma) > scoreSignForLemma(best, lemma) ? cur : best,
  )
}

/** Choisit le sign_id pour un vrai doublon synonyme. */
export function resolvePreferredSignId(
  lemma: string,
  candidateSignIds: string[],
  lang: Lang,
  preferences: Record<string, string>,
): { signId: string; isManual: boolean } {
  const fromUser = preferences[lemma]
  if (fromUser && candidateSignIds.includes(fromUser)) {
    return { signId: fromUser, isManual: true }
  }

  const fromStatic = DICTIONARY_PREFERRED_SIGN[lang][lemma]
  if (fromStatic && candidateSignIds.includes(fromStatic)) {
    return { signId: fromStatic, isManual: true }
  }

  return { signId: pickBestInCluster(lemma, candidateSignIds, preferences), isManual: false }
}

function isBareSynonymEntry(entry: DictionaryEntry): boolean {
  return entry.senseKey.includes('@') && normalizeLemma(entry.word) === entry.lemma
}

/**
 * Construit le dictionnaire avec désambiguïsation sémantique.
 * Les homonymes restent des entrées séparées ; seuls les vrais synonymes sont filtrés.
 */
export function buildDictionaryEntries(
  labelsMap: Record<string, string>,
  lang: Lang = 'fr',
  preferences: Record<string, string> = {},
): DictionaryEntry[] {
  const bySenseKey = new Map<string, DictionaryEntry>()
  const signIdsByLemma = new Map<string, Set<string>>()

  for (const [signId, label] of Object.entries(labelsMap)) {
    if (DISABLED_SIGNS.has(signId)) continue
    for (const sense of extractDictionarySenses(signId, label, lang)) {
      bySenseKey.set(sense.senseKey, {
        word: sense.word,
        lemma: sense.lemma,
        normalized: sense.lemma,
        senseKey: sense.senseKey,
        signId: sense.signId,
      })
      const set = signIdsByLemma.get(sense.lemma) ?? new Set()
      set.add(signId)
      signIdsByLemma.set(sense.lemma, set)
    }
  }

  const toRemove = new Set<string>()
  const senseCountBySign = new Map<string, number>()

  for (const [signId, label] of Object.entries(labelsMap)) {
    senseCountBySign.set(signId, extractDictionarySenses(signId, label, lang).length)
  }

  for (const [lemma, signIdSet] of signIdsByLemma) {
    const clusters = clusterSynonymSigns(lemma, [...signIdSet], lang, labelsMap)
    for (const cluster of clusters) {
      if (cluster.length < 2) continue
      const chosen = resolvePreferredSignId(lemma, cluster, lang, preferences).signId

      for (const entry of bySenseKey.values()) {
        if (entry.lemma !== lemma || !cluster.includes(entry.signId)) continue
        if (!isBareSynonymEntry(entry)) continue
        // Garder tous les co-synonymes d'un même signe (ex. avenir/futur/plus tard/prochain)
        if ((senseCountBySign.get(entry.signId) ?? 0) > 1) continue
        if (entry.signId !== chosen && areSynonymSigns(entry.signId, chosen, lemma, lang, labelsMap)) {
          toRemove.add(entry.senseKey)
        }
      }
    }
  }

  for (const key of toRemove) bySenseKey.delete(key)

  return Array.from(bySenseKey.values()).sort(
    (a, b) =>
      a.lemma.localeCompare(b.lemma, undefined, { sensitivity: 'base' }) ||
      a.word.localeCompare(b.word, undefined, { sensitivity: 'base' }),
  )
}

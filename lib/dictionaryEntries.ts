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
import { translateFrDictionarySense } from './dictionaryLexicon'
import { SIGN_LABELS_FR } from './signLabels'
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

function buildFrenchDictionaryEntries(
  preferences: Record<string, string> = {},
): DictionaryEntry[] {
  const labelsMap = SIGN_LABELS_FR
  const bySenseKey = new Map<string, DictionaryEntry>()
  const signIdsByLemma = new Map<string, Set<string>>()

  for (const [signId, label] of Object.entries(labelsMap)) {
    if (DISABLED_SIGNS.has(signId)) continue
    for (const sense of extractDictionarySenses(signId, label, 'fr')) {
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
    if (DISABLED_SIGNS.has(signId)) continue
    senseCountBySign.set(signId, extractDictionarySenses(signId, label, 'fr').length)
  }

  for (const [lemma, signIdSet] of signIdsByLemma) {
    const clusters = clusterSynonymSigns(lemma, [...signIdSet], 'fr', labelsMap)
    for (const cluster of clusters) {
      if (cluster.length < 2) continue
      const chosen = resolvePreferredSignId(lemma, cluster, 'fr', preferences).signId

      for (const entry of bySenseKey.values()) {
        if (entry.lemma !== lemma || !cluster.includes(entry.signId)) continue
        if (!isBareSynonymEntry(entry)) continue
        if ((senseCountBySign.get(entry.signId) ?? 0) > 1) continue
        if (entry.signId !== chosen && areSynonymSigns(entry.signId, chosen, lemma, 'fr', labelsMap)) {
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

function localizeFrenchEntries(
  frEntries: DictionaryEntry[],
  lang: Exclude<Lang, 'fr'>,
  preferences: Record<string, string>,
): DictionaryEntry[] {
  const entries: DictionaryEntry[] = []
  const signIdsByLemma = new Map<string, Set<string>>()

  for (const entry of frEntries) {
    const word = translateFrDictionarySense(entry.word, entry.lemma, lang, entry.signId)
    const lemma = normalizeLemma(word)
    // Clé unique : évite de fusionner deux sens FR distincts (ex. vieux / vieillir → old)
    const senseKey = `${lemma}@${entry.signId}#${entry.lemma}`
    entries.push({
      word,
      lemma,
      normalized: lemma,
      senseKey,
      signId: entry.signId,
    })
    const set = signIdsByLemma.get(lemma) ?? new Set()
    set.add(entry.signId)
    signIdsByLemma.set(lemma, set)
  }

  let result = entries

  if (Object.keys(preferences).length > 0) {
    const preferredSignByLemma = new Map<string, string>()
    for (const [lemma, signIdSet] of signIdsByLemma) {
      const preferred = preferences[lemma]
      if (preferred && signIdSet.has(preferred)) preferredSignByLemma.set(lemma, preferred)
    }
    if (preferredSignByLemma.size > 0) {
      result = entries.filter((entry) => {
        const preferred = preferredSignByLemma.get(entry.lemma)
        if (!preferred) return true
        const sameLemma = entries.filter((e) => e.lemma === entry.lemma)
        if (sameLemma.length <= 1) return true
        return entry.signId === preferred
      })
    }
  }

  return result.sort(
    (a, b) =>
      a.lemma.localeCompare(b.lemma, undefined, { sensitivity: 'base' }) ||
      a.word.localeCompare(b.word, undefined, { sensitivity: 'base' }),
  )
}

/**
 * Construit le dictionnaire avec désambiguïsation sémantique.
 * FR = source de vérité ; EN/TR/PL reprennent la même structure avec traductions de sens.
 */
export function buildDictionaryEntries(
  labelsMap: Record<string, string>,
  lang: Lang = 'fr',
  preferences: Record<string, string> = {},
): DictionaryEntry[] {
  if (lang === 'fr') {
    // labelsMap ignoré si ≠ FR — la source est toujours SIGN_LABELS_FR
    void labelsMap
    return buildFrenchDictionaryEntries(preferences)
  }

  const frEntries = buildFrenchDictionaryEntries({})
  return localizeFrenchEntries(frEntries, lang, preferences)
}

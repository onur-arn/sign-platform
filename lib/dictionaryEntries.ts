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
import { isResidualFrenchDisplay, translateFrDictionarySense } from './dictionaryLexicon'
import { SIGN_LABELS_EN, SIGN_LABELS_FR, SIGN_LABELS_PL, SIGN_LABELS_TR } from './signLabels'
import {
  areSynonymSigns,
  clusterSynonymSigns,
  extractDictionarySenses,
  splitSignId,
  normalizeLemma,
} from './dictionarySemantics'

const TARGET_LABELS: Record<Exclude<Lang, 'fr'>, Record<string, string>> = {
  en: SIGN_LABELS_EN,
  tr: SIGN_LABELS_TR,
  pl: SIGN_LABELS_PL,
}

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
  const entriesByLemma = new Map<string, DictionaryEntry[]>()
  const senseCountBySign = new Map<string, number>()

  for (const [signId, label] of Object.entries(labelsMap)) {
    if (DISABLED_SIGNS.has(signId)) continue
    const senses = extractDictionarySenses(signId, label, 'fr')
    senseCountBySign.set(signId, senses.length)
    for (const sense of senses) {
      const entry: DictionaryEntry = {
        word: sense.word,
        lemma: sense.lemma,
        normalized: sense.lemma,
        senseKey: sense.senseKey,
        signId: sense.signId,
      }
      bySenseKey.set(sense.senseKey, entry)
      const set = signIdsByLemma.get(sense.lemma) ?? new Set()
      set.add(signId)
      signIdsByLemma.set(sense.lemma, set)
      const list = entriesByLemma.get(sense.lemma) ?? []
      list.push(entry)
      entriesByLemma.set(sense.lemma, list)
    }
  }

  const toRemove = new Set<string>()

  for (const [lemma, signIdSet] of signIdsByLemma) {
    const clusters = clusterSynonymSigns(lemma, [...signIdSet], 'fr', labelsMap)
    for (const cluster of clusters) {
      if (cluster.length < 2) continue
      const chosen = resolvePreferredSignId(lemma, cluster, 'fr', preferences).signId
      const clusterSet = new Set(cluster)

      for (const entry of entriesByLemma.get(lemma) ?? []) {
        if (!clusterSet.has(entry.signId)) continue
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

function scoreLocalizedEntry(entry: DictionaryEntry): number {
  const frLemma = entry.senseKey.includes('#') ? entry.senseKey.split('#').pop()! : entry.lemma
  const tokens = splitSignId(entry.signId).map(normalizeLemma)
  let score = 0
  if (tokens.length === 1 && tokens[0] === frLemma) score += 120
  if (tokens[0] === frLemma) score += 60
  if (tokens.includes(frLemma)) score += 40
  if (entry.signId === frLemma || entry.signId.startsWith(`${frLemma}_`)) score += 50
  // Préférer le signe « atomic » (ordinateur) aux composés calqués
  score -= tokens.length * 8
  score -= entry.signId.length * 0.05
  return score
}

function dedupeLocalizedEntries(
  entries: DictionaryEntry[],
  preferences: Record<string, string>,
): DictionaryEntry[] {
  const byLemma = new Map<string, DictionaryEntry[]>()
  for (const entry of entries) {
    const list = byLemma.get(entry.lemma) ?? []
    list.push(entry)
    byLemma.set(entry.lemma, list)
  }

  const out: DictionaryEntry[] = []
  for (const [lemma, group] of byLemma) {
    if (group.length === 1) {
      out.push(group[0]!)
      continue
    }

    const byWord = new Map<string, DictionaryEntry[]>()
    for (const entry of group) {
      const key = normalizeLemma(entry.word)
      const list = byWord.get(key) ?? []
      list.push(entry)
      byWord.set(key, list)
    }

    for (const [, wordGroup] of byWord) {
      if (wordGroup.length === 1) {
        out.push(wordGroup[0]!)
        continue
      }
      const preferred = preferences[lemma]
      const chosen =
        preferred && wordGroup.some((e) => e.signId === preferred)
          ? preferred
          : wordGroup.reduce((best, cur) =>
              scoreLocalizedEntry(cur) > scoreLocalizedEntry(best) ? cur : best,
            ).signId
      out.push(wordGroup.find((e) => e.signId === chosen) ?? wordGroup[0]!)
    }
  }
  return out
}

function localizeFrenchEntries(
  frEntries: DictionaryEntry[],
  lang: Exclude<Lang, 'fr'>,
  preferences: Record<string, string>,
): DictionaryEntry[] {
  const bySign = new Map<string, DictionaryEntry[]>()
  for (const entry of frEntries) {
    const list = bySign.get(entry.signId) ?? []
    list.push(entry)
    bySign.set(entry.signId, list)
  }

  const entries: DictionaryEntry[] = []
  const signIdsByLemma = new Map<string, Set<string>>()

  const pushEntry = (word: string, signId: string, frLemma: string) => {
    const trimmed = word.trim()
    if (!trimmed) return
    if (isResidualFrenchDisplay(trimmed, lang)) return
    const lemma = normalizeLemma(trimmed)
    if (!lemma) return
    entries.push({
      word: trimmed,
      lemma,
      normalized: lemma,
      senseKey: `${lemma}@${signId}#${frLemma}`,
      signId,
    })
    const set = signIdsByLemma.get(lemma) ?? new Set()
    set.add(signId)
    signIdsByLemma.set(lemma, set)
  }

  for (const [signId, frSenses] of bySign) {
    const translated = frSenses.map((entry) => {
      const word = translateFrDictionarySense(entry.word, entry.lemma, lang, entry.signId).trim()
      const ok =
        !!word &&
        !isResidualFrenchDisplay(word, lang) &&
        normalizeLemma(word) !== normalizeLemma(entry.word)
      return { entry, word, ok }
    })
    const good = translated.filter((t) => t.ok)
    const untranslated = translated.length - good.length

    const targetLabel = TARGET_LABELS[lang][signId]
    let usedTargetLabel = false
    if (
      targetLabel &&
      untranslated > 0 &&
      (good.length === 0 || untranslated >= Math.ceil(frSenses.length / 2))
    ) {
      const targetSenses = extractDictionarySenses(signId, targetLabel, lang)
      const usable = targetSenses.filter(
        (s) => s.word.trim() && !isResidualFrenchDisplay(s.word, lang),
      )
      if (usable.length > 0) {
        usedTargetLabel = true
        for (const sense of usable) {
          pushEntry(sense.word, signId, sense.lemma)
        }
      }
    }

    if (!usedTargetLabel) {
      for (const t of good) {
        pushEntry(t.word, signId, t.entry.lemma)
      }
      // Sens isolés bien traduits même si d’autres ont échoué
      if (good.length === 0) {
        for (const t of translated) {
          if (t.word && !isResidualFrenchDisplay(t.word, lang)) {
            pushEntry(t.word, signId, t.entry.lemma)
          }
        }
      }
    }
  }

  let result = dedupeLocalizedEntries(entries, preferences)

  if (Object.keys(preferences).length > 0) {
    const preferredSignByLemma = new Map<string, string>()
    for (const [lemma, signIdSet] of signIdsByLemma) {
      const preferred = preferences[lemma]
      if (preferred && signIdSet.has(preferred)) preferredSignByLemma.set(lemma, preferred)
    }
    if (preferredSignByLemma.size > 0) {
      result = result.filter((entry) => {
        const preferred = preferredSignByLemma.get(entry.lemma)
        if (!preferred) return true
        const sameLemma = result.filter((e) => e.lemma === entry.lemma)
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
 * Résultats mis en cache (langue + préférences) pour des changements de langue instantanés.
 */
function preferencesCacheKey(preferences: Record<string, string>): string {
  const keys = Object.keys(preferences)
  if (keys.length === 0) return ''
  return keys
    .sort()
    .map((k) => `${k}=${preferences[k]}`)
    .join('&')
}

const frDictionaryCache = new Map<string, DictionaryEntry[]>()
const localizedDictionaryCache = new Map<string, DictionaryEntry[]>()

export function buildDictionaryEntries(
  labelsMap: Record<string, string>,
  lang: Lang = 'fr',
  preferences: Record<string, string> = {},
): DictionaryEntry[] {
  const prefsKey = preferencesCacheKey(preferences)

  if (lang === 'fr') {
    void labelsMap
    const hit = frDictionaryCache.get(prefsKey)
    if (hit) return hit
    const built = buildFrenchDictionaryEntries(preferences)
    frDictionaryCache.set(prefsKey, built)
    return built
  }

  const cacheKey = `${lang}:${prefsKey}`
  const hit = localizedDictionaryCache.get(cacheKey)
  if (hit) return hit

  const frEntries = buildDictionaryEntries(SIGN_LABELS_FR, 'fr', {})
  const built = localizeFrenchEntries(frEntries, lang, preferences)
  localizedDictionaryCache.set(cacheKey, built)
  return built
}

/** Préchauffe le dictionnaire (FR + langue active) hors chemin critique UI. */
export function warmDictionaryCache(lang: Lang = 'fr'): void {
  buildDictionaryEntries(SIGN_LABELS_FR, 'fr', {})
  if (lang !== 'fr') buildDictionaryEntries(SIGN_LABELS_FR, lang, {})
}

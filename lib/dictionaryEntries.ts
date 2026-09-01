export type DictionaryEntry = {
  /** Mot affiché dans le dictionnaire */
  word: string
  /** Clé normalisée pour tri / recherche */
  normalized: string
  /** Signe à jouer */
  signId: string
}

export type Lang = 'fr' | 'en' | 'tr' | 'pl'

import { DICTIONARY_PREFERRED_SIGN } from './dictionaryPreferences'

const STOP_WORDS: Record<Lang, Set<string>> = {
  fr: new Set([
    'a', 'à', 'au', 'aux', 'ce', 'cette', 'ces', 'd', 'dans', 'de', 'des', 'du', 'en', 'l', 'la',
    'le', 'les', 'leur', 'leurs', 'ma', 'mes', 'mon', 'notre', 'ou', 'par', 'pour', 'qu', 'que',
    'qui', 'sa', 'se', 'ses', 'son', 'sous', 'sur', 'ta', 'tes', 'ton', 'un', 'une', 'vers', 'vos',
    'votre', 'with', 'y', 'avec', 'sans', 'chez', 'entre', 'dont', 'ne', 'pas', 'plus', 'moins',
  ]),
  en: new Set([
    'a', 'an', 'at', 'by', 'for', 'from', 'in', 'into', 'of', 'on', 'or', 'the', 'to', 'with',
    'my', 'your', 'his', 'her', 'our', 'their', 'someone', 'somebody', 'one', 'ones', 'before',
  ]),
  tr: new Set([
    'bir', 'birine', 'da', 'de', 'i', 'ile', 'için', 'ki', 'mi', 'mu', 'mü', 'mı', 've', 'the',
  ]),
  pl: new Set([
    'a', 'do', 'dla', 'i', 'na', 'nie', 'o', 'od', 'po', 'się', 'u', 'w', 'z', 'ze',
  ]),
}

/** Tokens signId ignorés (suffixes numériques, etc.) */
function isIgnorableToken(token: string): boolean {
  return /^\d+$/.test(token)
}

/** Décode les fragments courants des sign_id (apostrophes, entités HTML). */
function decodeSignToken(token: string): string {
  return token
    .replace(/_rsquo_/g, "'")
    .replace(/rsquo/g, "'")
    .replace(/_039_/g, "'")
    .replace(/_/g, ' ')
    .trim()
}

/** Fusionne quelqu + un → quelqu'un dans une liste de tokens signId. */
function mergeSignIdTokens(raw: string[]): string[] {
  const out: string[] = []
  for (let i = 0; i < raw.length; i++) {
    const t = raw[i]!
    if (t === 'quelqu' && raw[i + 1] === 'un') {
      out.push("quelqu'un")
      i++
      continue
    }
    if (t === 'd' && raw[i + 1] === 'accord') {
      out.push("d'accord")
      i++
      continue
    }
    if (isIgnorableToken(t)) continue
    out.push(t)
  }
  return out
}

function splitSignId(signId: string): string[] {
  return mergeSignIdTokens(signId.split('_').filter(Boolean))
}

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
}

function normalizeKey(word: string): string {
  return normalizeToken(word)
}

function isStopWord(token: string, lang: Lang): boolean {
  return STOP_WORDS[lang].has(normalizeToken(token))
}

/** Nettoie un mot candidat (suffixes numériques isolés, ponctuation). */
function cleanWord(raw: string): string | null {
  let w = raw.trim().replace(/^['"\s]+|['"\s.]+$/g, '')
  if (!w) return null
  if (/^\d+$/.test(w)) return null
  if (/^\d+\s/.test(w)) w = w.replace(/^\d+\s+/, '')
  w = w.replace(/\s+\d+$/, '').trim()
  if (!w || w.length < 2) return null
  if (/^[^\p{L}\d]+$/u.test(w)) return null
  return w
}

function capitalizeWord(word: string): string {
  if (!word) return word
  const lower = word.toLowerCase()
  if (lower === "quelqu'un") return "Quelqu'un"
  if (lower === "d'accord") return "D'accord"
  const parts = word.split(/(['-])/u)
  return parts
    .map((part, i) => {
      if (part === "'" || part === '-') return part
      if (i > 0 && (parts[i - 1] === "'" || parts[i - 1] === '-')) {
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      }
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    })
    .join('')
}

function tokenizeLabel(label: string): string[] {
  return label
    .replace(/l'avance/gi, 'l avance')
    .replace(/l'air/gi, 'l air')
    .replace(/d'accord/gi, 'd accord')
    .replace(/d'avis/gi, 'd avis')
    .replace(/quelqu'un/gi, "quelqu'un")
    .split(/\s+/u)
    .filter(Boolean)
}

function labelContentWords(label: string, lang: Lang): string[] {
  const words: string[] = []
  for (const token of tokenizeLabel(label)) {
    let w = token
    if (/^l'/i.test(w)) w = w.slice(2)
    if (/^d'/i.test(w)) w = w.slice(2)
    const cleaned = cleanWord(w)
    if (!cleaned || isStopWord(cleaned, lang)) continue
    words.push(cleaned)
  }
  return words
}

/** Expressions figées conservées en une seule entrée. */
function isFixedPhrase(signId: string, signTokens: string[], lang: Lang): boolean {
  if (/_heures_/.test(signId)) return true
  if (/^accident_/.test(signId) && signTokens.length >= 3) return true
  if (/^cent_/.test(signId) || /_\d+_cent_/.test(signId) || /^\d+_cent_/.test(signId)) return true
  if (/_du_travail$/.test(signId)) return true
  if (/_cote_de/.test(signId) && signTokens.length <= 4) return true
  if (/_la_fin/.test(signId)) return true
  if (/_mon_tour$/.test(signId) || /_son_tour$/.test(signId) || /_ton_tour$/.test(signId)) return true
  if (/_partir_de/.test(signId) && signTokens.length <= 4) return true
  if (/_propos_de/.test(signId)) return true
  if (/_la_main/.test(signId) && signTokens.length >= 3) return true
  if (/_le_bras/.test(signId) || /_le_coup/.test(signId)) return true
  if (/_1_an$/.test(signId) || /_ans_duree$/.test(signId)) return true
  if (/_semaine/.test(signId) && signTokens.length <= 3) return true
  if (/_mois/.test(signId) && signTokens.length <= 3) return true

  const content = contentTokens(signTokens, lang)
  // Idiom court : un seul mot de contenu (ex. « à mon tour », « à la fin »)
  if (signTokens.length <= 4 && content.length === 1) return true

  return false
}

function contentTokens(signTokens: string[], lang: Lang): string[] {
  return signTokens.filter((t) => !isStopWord(t, lang))
}

type WordCandidate = { raw: string; normalized: string; tokenIndex: number }

/** Extrait les mots de dictionnaire à partir d'un sign_id et de son libellé. */
export function extractWordsFromSign(signId: string, label: string, lang: Lang): WordCandidate[] {
  const trimmedLabel = label.trim()
  if (!trimmedLabel) return []

  const signTokens = splitSignId(signId)
  const hasListPunctuation = /[,;]/.test(trimmedLabel)

  if (isFixedPhrase(signId, signTokens, lang) && !hasListPunctuation) {
    const phrase = trimmedLabel.replace(/\s+\d+(?=\s|$)/g, ' ').replace(/\s+/g, ' ').trim()
    const normalized = normalizeKey(phrase)
    if (!normalized) return []
    return [{ raw: phrase, normalized, tokenIndex: 0 }]
  }

  if (hasListPunctuation) {
    return expandLabelParts(signId, trimmedLabel, lang)
  }

  const contentSign = signTokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => !isStopWord(token, lang))

  const contentLabels = labelContentWords(trimmedLabel, lang)
  const out: WordCandidate[] = []
  const seen = new Set<string>()

  for (let j = 0; j < contentSign.length; j++) {
    const { token, index } = contentSign[j]!
    const labelWord = contentLabels[j]
    const raw = cleanWord(labelWord ?? decodeSignToken(token))
    if (!raw || isStopWord(raw, lang)) continue

    const normalized = normalizeKey(raw)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    out.push({ raw, normalized, tokenIndex: index })
  }

  if (out.length === 0 && signTokens.length === 1) {
    const raw = cleanWord(trimmedLabel)
    if (!raw) return []
    return [{ raw, normalized: normalizeKey(raw), tokenIndex: 0 }]
  }

  return out
}

function expandLabelParts(signId: string, label: string, lang: Lang): WordCandidate[] {
  const segments = label
    .split(/[,;]+/u)
    .map((s) => s.trim())
    .filter(Boolean)

  const out: WordCandidate[] = []
  const seen = new Set<string>()

  for (const segment of segments) {
    for (const raw of labelContentWords(segment.replace(/\s+\d+(?=\s|$)/g, ' '), lang)) {
      const normalized = normalizeKey(raw)
      if (!normalized || seen.has(normalized)) continue
      seen.add(normalized)
      out.push({ raw, normalized, tokenIndex: 0 })
    }
  }

  if (out.length > 0) return out

  return extractWordsFromSign(signId, label.replace(/[,;]/g, ' '), lang)
}

function scoreSignForWord(signId: string, normalized: string, tokenIndex: number): number {
  const preferred = DICTIONARY_PREFERRED_SIGN
  let score = 0

  const tokens = splitSignId(signId).map(normalizeToken)
  if (tokens[tokenIndex] === normalized) score += 100
  if (tokens.includes(normalized)) score += 50
  if (tokens[0] === normalized) score += 30
  if (signId === normalized) score += 80
  if (signId.startsWith(`${normalized}_`) || signId.endsWith(`_${normalized}`)) score += 40

  // Signe dédié (peu de synonymes) préféré aux fourre-tout
  score -= tokens.length * 2
  score -= signId.length * 0.05

  return score
}

function pickBestEntry(
  normalized: string,
  candidates: DictionaryEntry[],
  preferences: Record<string, string>,
): DictionaryEntry {
  const preferredId = preferences[normalized]
  if (preferredId) {
    const forced = candidates.find((c) => c.signId === preferredId)
    if (forced) return forced
  }

  return candidates.reduce((best, cur) => {
    const bestScore = scoreSignForWord(best.signId, normalized, 0)
    const curScore = scoreSignForWord(cur.signId, normalized, 0)
    return curScore > bestScore ? cur : best
  })
}

/** Choisit le sign_id retenu pour un mot en doublon. */
export function resolvePreferredSignId(
  normalized: string,
  candidateSignIds: string[],
  labelsMap: Record<string, string>,
  lang: Lang,
  preferences: Record<string, string>,
): { signId: string; isManual: boolean } {
  const fromUser = preferences[normalized]
  if (fromUser && candidateSignIds.includes(fromUser)) {
    return { signId: fromUser, isManual: true }
  }

  const fromStatic = DICTIONARY_PREFERRED_SIGN[lang][normalized]
  if (fromStatic && candidateSignIds.includes(fromStatic)) {
    return { signId: fromStatic, isManual: true }
  }

  const candidates: DictionaryEntry[] = candidateSignIds.map((signId) => ({
    signId,
    word: labelsMap[signId] ?? signId,
    normalized,
  }))

  const merged = { ...DICTIONARY_PREFERRED_SIGN[lang], ...preferences }
  return {
    signId: pickBestEntry(normalized, candidates, merged).signId,
    isManual: false,
  }
}

/**
 * Construit les entrées du dictionnaire : un mot unique par ligne, lié au signe correspondant.
 */
export function buildDictionaryEntries(
  labelsMap: Record<string, string>,
  lang: Lang = 'fr',
  preferences: Record<string, string> = {},
): DictionaryEntry[] {
  const mergedPreferences = { ...DICTIONARY_PREFERRED_SIGN[lang], ...preferences }
  const buckets = new Map<string, DictionaryEntry[]>()

  for (const [signId, label] of Object.entries(labelsMap)) {
    for (const { raw, normalized, tokenIndex } of extractWordsFromSign(signId, label, lang)) {
      const display = capitalizeWord(raw)
      const entry: DictionaryEntry = { word: display, normalized, signId }
      const list = buckets.get(normalized) ?? []
      if (!list.some((e) => e.signId === signId)) list.push(entry)
      buckets.set(normalized, list)
    }
  }

  const entries: DictionaryEntry[] = []
  for (const [normalized, candidates] of buckets) {
    entries.push(pickBestEntry(normalized, candidates, mergedPreferences))
  }

  return entries.sort((a, b) =>
    a.normalized.localeCompare(b.normalized, undefined, { sensitivity: 'base' }),
  )
}

/** Compte les mots en doublon (plusieurs signes possibles). */
export function countDictionaryDuplicates(
  labelsMap: Record<string, string>,
  lang: Lang = 'fr',
): number {
  const buckets = new Map<string, Set<string>>()
  for (const [signId, label] of Object.entries(labelsMap)) {
    for (const { normalized } of extractWordsFromSign(signId, label, lang)) {
      const set = buckets.get(normalized) ?? new Set()
      set.add(signId)
      buckets.set(normalized, set)
    }
  }
  return [...buckets.values()].filter((s) => s.size > 1).length
}

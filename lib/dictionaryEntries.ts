export type DictionaryEntry = {
  /** Mot affiché dans le dictionnaire */
  word: string
  /** Clé normalisée pour tri / recherche */
  normalized: string
  /** Signe à jouer */
  signId: string
}

type Lang = 'fr' | 'en' | 'tr' | 'pl'

const PHRASE_CONNECTORS: Record<Lang, Set<string>> = {
  fr: new Set([
    'du', 'de', 'des', 'le', 'la', 'les', 'un', 'une', 'au', 'aux', 'en', 'y', 'l', 'd',
    'ce', 'cette', 'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
    'notre', 'votre', 'leur', 'leurs', 'qu', 'que', 'qui', 'dont', 'où', 'ou', 'sur', 'sous',
    'avec', 'sans', 'pour', 'par', 'chez', 'entre', 'vers', 'dans',
  ]),
  en: new Set([
    'the', 'a', 'an', 'of', 'to', 'for', 'in', 'on', 'at', 'by', 'with', 'from', 'into',
    'someone', 'somebody', 'ones', 'one', 'your', 'my', 'his', 'her', 'their', 'our',
  ]),
  tr: new Set([
    'bir', 'birine', 'için', 'ile', 've', 'de', 'da', 'ki', 'mi', 'mu', 'mü', 'mı', 'the',
  ]),
  pl: new Set([
    'i', 'w', 'z', 'do', 'na', 'od', 'po', 'dla', 'ze', 'o', 'a', 'u', 'nie', 'się',
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
    if (isIgnorableToken(t)) continue
    out.push(t)
  }
  return out
}

function splitSignId(signId: string): string[] {
  return mergeSignIdTokens(signId.split('_').filter(Boolean))
}

function tokenizeSegment(segment: string): string[] {
  const lower = segment.toLowerCase()
  if (lower.includes("quelqu'un") || lower.includes('quelqu un')) {
    return segment
      .replace(/quelqu'un/gi, "quelqu'un")
      .split(/\s+/u)
      .filter(Boolean)
  }
  return segment.split(/\s+/u).filter(Boolean)
}

function segmentHasPhraseConnector(segment: string, lang: Lang): boolean {
  const connectors = PHRASE_CONNECTORS[lang]
  const tokens = tokenizeSegment(segment).map((t) =>
    t
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^quelqu'un$/u, "quelqu'un"),
  )
  return tokens.some((t) => {
    if (t === "quelqu'un") return false
    return connectors.has(t)
  })
}

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
}

function signIdLooksLikePhrase(signId: string, label: string, lang: Lang): boolean {
  const tokens = splitSignId(signId).map(normalizeToken)
  const connectors = PHRASE_CONNECTORS[lang]
  if (tokens.some((t) => t !== "quelqu'un" && connectors.has(t))) return true

  const labelWords = label.trim().split(/\s+/u).filter(Boolean)
  // Expression nominale longue sans liste de synonymes (ex. accident vasculaire cérébral)
  if (!/[,;]/.test(label) && tokens.length >= 4 && labelWords.length >= 4) {
    const head = normalizeToken(labelWords[0] ?? '')
    if (head && head === tokens[0]) return true
  }

  return false
}

/** Nettoie un mot candidat (suffixes numériques isolés, ponctuation). */
function cleanWord(raw: string): string | null {
  let w = raw.trim().replace(/^['"\s]+|['"\s.]+$/g, '')
  if (!w) return null
  if (/^\d+$/.test(w)) return null
  if (/^\d+\s/.test(w)) w = w.replace(/^\d+\s+/, '')
  w = w.replace(/\s+\d+$/, '').trim()
  if (!w || w.length < 2) return null
  if (/^[^\p{L}]+$/u.test(w)) return null
  return w
}

function capitalizeWord(word: string): string {
  if (!word) return word
  const lower = word.toLowerCase()
  if (lower === "quelqu'un") return "Quelqu'un"
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

function normalizeKey(word: string): string {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
}

/** Extrait des mots individuels d'un segment (synonymes séparés par des espaces). */
function wordsFromSegment(segment: string): string[] {
  const out: string[] = []
  for (const chunk of tokenizeSegment(segment)) {
    const cleaned = cleanWord(chunk)
    if (cleaned) out.push(cleaned)
  }
  return out
}

/** Décompose un libellé en mots de dictionnaire. */
function expandLabel(label: string, lang: Lang): string[] {
  const trimmed = label.trim()
  if (!trimmed) return []

  const hasListPunctuation = /[,;]/.test(trimmed)
  const segments = hasListPunctuation
    ? trimmed.split(/[,;]+/u).map((s) => s.trim()).filter(Boolean)
    : [trimmed]

  const words: string[] = []

  for (const segment of segments) {
    if (segmentHasPhraseConnector(segment, lang)) {
      const phrase = cleanPhrase(segment)
      if (phrase) words.push(phrase)
      continue
    }

    if (hasListPunctuation || !segment.includes(' ')) {
      words.push(...wordsFromSegment(segment))
      continue
    }

    // Sans virgule : plusieurs mots → synonymes (ex. « Acceder acces »)
    words.push(...wordsFromSegment(segment))
  }

  return words
}

function cleanPhrase(phrase: string): string | null {
  const p = phrase.trim().replace(/\s+/g, ' ')
  return p.length >= 2 ? p : null
}

/** Mots issus du sign_id lorsque le libellé est une liste de synonymes. */
function wordsFromSignId(signId: string): string[] {
  return splitSignId(signId)
    .map(decodeSignToken)
    .map((w) => cleanWord(w))
    .filter((w): w is string => Boolean(w))
}

function pickDisplayWord(labelWord: string | undefined, signToken: string | undefined, fallback: string): string {
  const candidate = labelWord ?? signToken ?? fallback
  return capitalizeWord(candidate)
}

/**
 * Construit les entrées du dictionnaire : un mot unique par ligne, lié au signe correspondant.
 */
export function buildDictionaryEntries(
  labelsMap: Record<string, string>,
  lang: Lang = 'fr',
): DictionaryEntry[] {
  const byNormalized = new Map<string, DictionaryEntry>()

  for (const [signId, label] of Object.entries(labelsMap)) {
    const trimmedLabel = label.trim()
    if (!trimmedLabel) continue

    const hasListPunctuation = /[,;]/.test(trimmedLabel)
    const isPhrase = signIdLooksLikePhrase(signId, trimmedLabel, lang)
    const signTokens = wordsFromSignId(signId)

    let words: string[] = []

    if (isPhrase && !hasListPunctuation) {
      words = [trimmedLabel]
    } else if (hasListPunctuation) {
      words = expandLabel(trimmedLabel, lang)
    } else if (signTokens.length > 1) {
      // Liste de synonymes dans le sign_id (ex. accelerer_depecher_fort_…)
      const labelWords = wordsFromSegment(trimmedLabel)
      words = signTokens.map((token, i) => labelWords[i] ?? token)
    } else {
      words = expandLabel(trimmedLabel, lang)
    }

    // Dédupliquer au sein d'un même signe
    const seenInSign = new Set<string>()
    for (let i = 0; i < words.length; i++) {
      const raw = words[i]!
      const normalized = normalizeKey(raw)
      if (!normalized || seenInSign.has(normalized)) continue
      seenInSign.add(normalized)

      const display = pickDisplayWord(raw, signTokens[i], raw)
      if (display.includes(',') || display.includes(';')) {
        for (const sub of expandLabel(display, lang)) {
          addEntry(sub, signId, signTokens, i, byNormalized)
        }
        continue
      }
      addEntry(display, signId, signTokens, i, byNormalized)
    }
  }

  return Array.from(byNormalized.values()).sort((a, b) =>
    a.normalized.localeCompare(b.normalized, undefined, { sensitivity: 'base' }),
  )
}

function addEntry(
  raw: string,
  signId: string,
  signTokens: string[],
  tokenIndex: number,
  byNormalized: Map<string, DictionaryEntry>,
) {
  const normalized = normalizeKey(raw)
  if (!normalized) return

  const display = capitalizeWord(raw)
  const entry: DictionaryEntry = { word: display, normalized, signId }

  const existing = byNormalized.get(normalized)
  if (!existing) {
    byNormalized.set(normalized, entry)
    return
  }

  const primaryToken = normalizeKey(signTokens[0] ?? '')
  const wordNorm = normalized
  if (primaryToken === wordNorm && tokenIndex === 0) {
    byNormalized.set(normalized, entry)
  }
}

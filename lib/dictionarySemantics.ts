export type Lang = 'fr' | 'en' | 'tr' | 'pl'

export type SignStructure = 'dedicated' | 'phrase' | 'synonym_list' | 'qualified_noun'

export type DictionarySense = {
  /** Libellé affiché dans le dictionnaire */
  word: string
  /** Lemme principal (recherche alphabétique) */
  lemma: string
  /** Clé unique de sens — évite de fusionner des homonymes */
  senseKey: string
  signId: string
}

/** Adjectifs français formant une expression figée avec le nom suivant (ex. moyen âge). */
const FR_ADJECTIVE_HEADS = new Set([
  'moyen', 'grand', 'grande', 'petit', 'petite', 'gros', 'grosse', 'jeune', 'vieux', 'vieille',
  'nouveau', 'nouvelle', 'bon', 'bonne', 'mauvais', 'mauvaise', 'demi', 'haut', 'haute', 'bas',
  'basse', 'premier', 'premiere', 'dernier', 'derniere', 'meme', 'autre', 'fort', 'forte',
  'long', 'longue', 'court', 'courte', 'plein', 'pleine', 'beau', 'belle', 'blanc', 'blanche',
])

/** Verbes à l'infinitif : signalent une expression verbale (ex. aile + s'envoler). */
const FR_VERB_LIKE = new Set([
  'envoler', 'voler', 'marcher', 'courir', 'sauter', 'tomber', 'monter', 'descendre',
  'nager', 'plonger', 'tourner', 'avancer', 'reculer', 'arriver', 'partir', 'entrer',
  'sortir', 'ouvrir', 'fermer', 'manger', 'boire', 'dormir', 'parler', 'ecouter',
  'regarder', 'jeter', 'lancer', 'pousser', 'tirer', 'porter', 'mettre', 'prendre',
  'donner', 'recevoir', 'aimer', 'detester', 'rire', 'pleurer', 'chanter', 'danser',
])

/** Nom spécificateur : précise le sens du mot précédent (ex. aile + poulet). */
const FR_SPECIFIER_NOUNS = new Set([
  'poulet', 'poule', 'oiseau', 'canard', 'travail', 'mer', 'terre', 'ciel', 'soleil', 'lune',
  'main', 'oeuvre', 'oeuf', 'pain', 'fromage', 'viande', 'poisson', 'fruit', 'legume', 'bois',
  'fer', 'metal', 'papier', 'verre', 'plastique', 'route', 'rue', 'ville', 'pays', 'monde',
  'homme', 'femme', 'enfant', 'bebe', 'chien', 'chat', 'cheval', 'vache', 'anniversaire',
  'noel', 'paques', 'travail', 'guerre', 'paix', 'amour', 'mort', 'vie', 'sante', 'maladie',
])

/** Pays — modificateur géographique en fin de sign_id (ville + pays → entrée ville seulement). */
const FR_COUNTRIES = new Set([
  'allemagne', 'france', 'belgique', 'suisse', 'italie', 'espagne', 'turquie', 'pologne',
  'autriche', 'portugal', 'angleterre', 'luxembourg', 'hollande',
  'grece', 'norvege', 'suede', 'danemark', 'finlande', 'irlande', 'ecosse', 'maroc', 'algerie',
  'tunisie', 'canada', 'mexique', 'bresil', 'argentine', 'chine', 'japon', 'inde', 'russie',
  'usa', 'uk', 'indonesie', 'slovaquie', 'venezuela', 'moldavie', 'australie', 'tchequie', 'iran',
  'palestine', 'lettonie',
])

/** Suffixes pays multi-mots en fin de sign_id (du plus long au plus court). */
const GEO_MULTI_COUNTRY_TAILS: string[][] = [
  ['emirats', 'arabes', 'unis'],
  ['bosnie', 'herzegovine'],
  ['arabie', 'saoudite'],
  ['royaume', 'uni'],
  ['pays', 'bas'],
  ['sri', 'lanka'],
  ['costa', 'rica'],
  ['porto', 'rico'],
  ['viet', 'nam'],
  ['burkina', 'faso'],
  ['birmanie', 'myanmar'],
]

const FR_RELATIONAL_BEFORE_COUNTRY = new Set(['de', 'du', 'des', 'd'])
const FR_TITLE_BEFORE_COUNTRY = new Set(['roi', 'reine', 'prince', 'princesse', 'duc', 'duchesse', 'pape'])

/** Suffixe de catégorie en sign_id (ex. kaki_fruit → « Kaki », koekelberg_ville → « Koekelberg »). */
const FR_CATEGORY_SUFFIXES = new Set([
  'ville', 'fruit', 'planete', 'lieu', 'anatomie', 'religion', 'prenom', 'marque', 'magasin',
  'vehicule', 'animal', 'objet', 'flore', 'matiere', 'instrument',
])

const STOP_WORDS: Record<Lang, Set<string>> = {
  fr: new Set([
    'a', 'à', 'au', 'aux', 'ce', 'cette', 'ces', 'd', 'dans', 'de', 'des', 'du', 'en', 'l', 'la',
    'le', 'les', 'leur', 'leurs', 'ma', 'mes', 'mon', 'notre', 'ou', 'par', 'pour', 'qu', 'que',
    'qui', 'sa', 'se', 'ses', 'son', 'sous', 'sur', 'ta', 'tes', 'ton', 'un', 'une', 'vers', 'vos',
    'votre', 'y', 'avec', 'sans', 'chez', 'entre', 'dont', 'ne', 'pas', 'plus', 'moins', 's',
  ]),
  en: new Set([
    'a', 'an', 'at', 'by', 'for', 'from', 'in', 'into', 'of', 'on', 'or', 'the', 'to', 'with',
    'my', 'your', 'his', 'her', 'our', 'their', 'someone', 'somebody', 'one', 'ones', 'before', 's',
  ]),
  tr: new Set(['bir', 'birine', 'da', 'de', 'i', 'ile', 'için', 'ki', 've', 'the', 's']),
  pl: new Set(['a', 'do', 'dla', 'i', 'na', 'nie', 'o', 'od', 'po', 'się', 'u', 'w', 'z', 'ze']),
}

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
}

function decodeSignToken(token: string): string {
  return token
    .replace(/_rsquo_/g, "'")
    .replace(/rsquo/g, "'")
    .replace(/_039_/g, "'")
    .replace(/_/g, ' ')
    .trim()
}

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
    if (t === 's' && raw[i + 1] === 'envoler') {
      out.push("s'envoler")
      i++
      continue
    }
    if (t === 's' && raw[i + 1] === 'rsquo' && raw[i + 2]) {
      out.push(`s'${raw[i + 2]}`)
      i += 2
      continue
    }
    if (t === 'd' && raw[i + 1] === 'rsquo' && raw[i + 2]) {
      out.push(`d'${raw[i + 2]}`)
      i += 2
      continue
    }
    if (t === 'rsquo') continue
    out.push(t)
  }
  return out
}

export function splitSignId(signId: string): string[] {
  return mergeSignIdTokens(signId.split('_').filter(Boolean))
}

function isStopWord(token: string, lang: Lang): boolean {
  return STOP_WORDS[lang].has(normalizeToken(token))
}

function contentTokens(signTokens: string[], lang: Lang, signId?: string): string[] {
  return signTokens.filter((t) => {
    if (isStopWord(t, lang)) return false
    if (signId && isSignVariantDigit(t, signId)) return false
    return true
  })
}

/** Suffixe numérique de variante en fin de sign_id (ex. cologne_allemagne_1 → pas un mot du dictionnaire). */
const MAX_VARIANT_SUFFIX = 6

/** Chiffre 1–9 au milieu d'un sign_id (ex. choisir_2_elire) — pas une entrée dictionnaire. */
function isSignVariantDigit(token: string, signId: string): boolean {
  if (!/^[1-9]$/.test(token)) return false
  const parts = signIdBaseParts(signId)
  return parts[0] !== token
}

function isDictionaryNoiseDigit(word: string, signId: string): boolean {
  const w = word.trim()
  if (!/^[1-9]$/.test(w)) return false
  return isSignVariantDigit(w, signId)
}

function filterDictionarySenses(senses: DictionarySense[], signId: string): DictionarySense[] {
  return senses.filter((s) => !isDictionaryNoiseDigit(s.word, signId))
}

function stripTrailingVariantSuffix(tokens: string[], signId: string): string[] {
  if (tokens.length === 0) return tokens
  const match = signId.match(/_(\d+)$/)
  if (!match) return tokens
  const suffix = match[1]!
  const n = parseInt(suffix, 10)
  if (Number.isNaN(n) || n > MAX_VARIANT_SUFFIX) return tokens
  const last = tokens[tokens.length - 1]
  if (last === suffix) return tokens.slice(0, -1)
  return tokens
}

function contentTokensFromSignId(signId: string, lang: Lang): string[] {
  const tokens = stripTrailingVariantSuffix(splitSignId(signId), signId)
  return contentTokens(tokens, lang, signId)
}

function cleanWord(raw: string, opts?: { allowNumeric?: boolean }): string | null {
  let w = raw.trim().replace(/^['"\s]+|['"\s.,;]+$/g, '')
  if (!w) return null
  if (/^\d+$/.test(w)) {
    if (opts?.allowNumeric || w.length <= 4) return w
    return null
  }
  // Suffixe variante (ex. « jeter 2 ») — pas les nombres dans « 10 heures »
  w = w.replace(/\s+(\d)$/, '').trim()
  if (!w || (w.length < 2 && !/^\d$/.test(w))) return null
  if (/^[^\p{L}\d]+$/u.test(w)) return null
  return w
}

function capitalizeWord(word: string): string {
  if (!word) return word
  const lower = word.toLowerCase()
  if (lower === "quelqu'un") return "Quelqu'un"
  if (lower === "d'accord") return "D'accord"
  if (lower === "s'envoler") return "S'envoler"
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
    .replace(/s'envoler/gi, "s'envoler")
    .replace(/quelqu'un/gi, "quelqu'un")
    .split(/\s+/u)
    .filter(Boolean)
}

function labelContentWords(label: string, lang: Lang): string[] {
  const allowNumeric = /\d/.test(label)
  const words: string[] = []
  for (const token of tokenizeLabel(label)) {
    let w = token
    if (/^l'/i.test(w)) w = w.slice(2)
    if (/^d'/i.test(w)) w = w.slice(2)
    if (/^s'/i.test(w)) w = w.slice(2)
    const cleaned = cleanWord(w, { allowNumeric })
    if (!cleaned || isStopWord(cleaned, lang)) continue
    words.push(cleaned)
  }
  return words
}

/** Chiffres, heures, durées, nombres composés (cent dix, 10 heures…). */
function isNumericExpression(signId: string, label: string): boolean {
  const trimmed = label.trim()
  if (/\d+\s*(heures?|h\b|an|ans|mois|semaine|jours?|cent|cents|dix|vingt|mille|un|deux|trois)/i.test(trimmed)) {
    return true
  }
  if (/^\d+_/.test(signId)) return true
  if (/^en_\d+_/.test(signId) || /^a_\d+_heures/.test(signId)) return true
  if (/_\d+_(heures|heure|an|mois|semaine|jour|cent|dix|vingt)/i.test(signId)) return true
  if (/^\d{2,}_(cent|dix|vingt|onze|douze|treize|quatorze|quinze|seize)/i.test(signId)) return true
  return false
}

function enrichNumericDisplay(signId: string, label: string): string {
  const trimmed = label.trim()
  const leading = signId.match(/^(\d+)_/)
  if (leading && !trimmed.includes(leading[1]!)) {
    return `${leading[1]} ${trimmed}`
  }
  return trimmed
}

function lemmaFromDisplay(display: string, lang: Lang): string {
  const digit = display.match(/\d+/)
  if (digit) return digit[0]!
  for (const token of tokenizeLabel(display)) {
    const cleaned = cleanWord(token, { allowNumeric: true })
    if (cleaned && !isStopWord(cleaned, lang)) return normalizeToken(cleaned)
  }
  return normalizeToken(display)
}

/** Noms courants finissant en -ois/-ais confondus avec des adjectifs (ex. mois ≠ moisissure). */
const FR_NOUN_NOT_ADJECTIVE = new Set(['mois', 'fois', 'pays', 'bois', 'poids', 'repas'])

function isFrenchAdjective(token: string): boolean {
  const n = normalizeToken(token)
  if (n.length < 4) return false
  if (FR_NOUN_NOT_ADJECTIVE.has(n) || FR_COUNTRIES.has(n)) return false
  return /(aire|ique|eux|euse|if|ive|ien|ienne|ois|oise|ais|elle|able|ible|al|ale|uel|uelle)$/.test(n)
}

type GeoCountryTail = { tokens: string[]; length: number }

function signIdBaseParts(signId: string): string[] {
  return signId.replace(/_\d+$/, '').split('_').filter(Boolean)
}

/** « roi de Belgique », « Irlande du Nord » — pas une ville + pays. */
function hasRelationalGeoMarker(parts: string[]): boolean {
  if (parts.some((p) => FR_TITLE_BEFORE_COUNTRY.has(normalizeToken(p)))) return true
  if (
    parts.length >= 3 &&
    normalizeToken(parts[parts.length - 2]!) === 'pays' &&
    normalizeToken(parts[parts.length - 1]!) === 'bas'
  ) {
    return false
  }
  const last = normalizeToken(parts[parts.length - 1] ?? '')
  if (!FR_COUNTRIES.has(last)) return false
  const before = normalizeToken(parts[parts.length - 2] ?? '')
  return FR_RELATIONAL_BEFORE_COUNTRY.has(before)
}

/** Détecte ville/lieu + pays via le sign_id (fiable pour toutes les langues d'affichage). */
function getGeoCountryTailFromSignId(signId: string): GeoCountryTail | null {
  const parts = signIdBaseParts(signId)
  if (parts.length < 2 || hasRelationalGeoMarker(parts)) return null

  for (const tailTokens of GEO_MULTI_COUNTRY_TAILS) {
    if (parts.length <= tailTokens.length) continue
    const slice = parts.slice(-tailTokens.length).map(normalizeToken)
    if (!slice.every((t, i) => t === tailTokens[i]!)) continue
    // ex. emirats_arabes_unis_eau — le signe parle du pays, pas d'une ville
    if (normalizeToken(parts[0]!) === tailTokens[0]) continue
    return { tokens: parts.slice(-tailTokens.length), length: tailTokens.length }
  }

  const last = normalizeToken(parts[parts.length - 1]!)
  const first = normalizeToken(parts[0]!)
  if (FR_COUNTRIES.has(last) && !FR_COUNTRIES.has(first)) {
    return { tokens: [parts[parts.length - 1]!], length: 1 }
  }

  // Ville + pays + précision (ex. barcelone_espagne_catalan → Barcelone)
  if (parts.length >= 3 && !FR_COUNTRIES.has(first)) {
    for (let i = 1; i < parts.length; i++) {
      if (FR_COUNTRIES.has(normalizeToken(parts[i]!))) {
        return { tokens: parts.slice(i), length: parts.length - i }
      }
    }
  }

  return null
}

function getGeoCountryTail(content: string[], signId: string, _lang: Lang): GeoCountryTail | null {
  const fromId = getGeoCountryTailFromSignId(signId)
  if (!fromId || content.length < 2) return null
  return fromId
}

/** Tag de désambiguïsation (fruit, ville…) — entrée tête seule, pas le suffixe. */
function getCategorySuffixTailFromSignId(signId: string): GeoCountryTail | null {
  const parts = signIdBaseParts(signId)
  if (parts.length !== 2) return null
  const last = normalizeToken(parts[parts.length - 1]!)
  if (!FR_CATEGORY_SUFFIXES.has(last)) return null
  return { tokens: [parts[parts.length - 1]!], length: 1 }
}

function getHeadOnlyTailFromSignId(signId: string): GeoCountryTail | null {
  return getGeoCountryTailFromSignId(signId) ?? getCategorySuffixTailFromSignId(signId)
}

function getHeadOnlyTail(content: string[], signId: string, lang: Lang): GeoCountryTail | null {
  const fromId = getHeadOnlyTailFromSignId(signId)
  if (!fromId || content.length < 2) return null
  return fromId
}

function stripTokenPunctuation(token: string): string {
  return token.replace(/^[,;.:]+|[,;.:]+$/g, '')
}

function geoHeadDisplay(label: string, tail: GeoCountryTail, signId?: string): string {
  const rawParts = label.trim().split(/\s+/u).map(stripTokenPunctuation)
  const tailNorm = tail.tokens.map(normalizeToken)
  let cutAt = rawParts.length
  for (let i = tailNorm.length - 1; i >= 0; i--) {
    cutAt--
    while (cutAt >= 0 && normalizeToken(rawParts[cutAt]!) !== tailNorm[i]) cutAt--
    if (cutAt < 0) break
  }
  if (cutAt >= 0) {
    return formatPhraseDisplay(rawParts.slice(0, cutAt).join(' '))
  }
  if (signId) {
    const parts = signIdBaseParts(signId)
    const headParts = parts.slice(0, parts.length - tail.length)
    if (headParts.length > 0) {
      return formatPhraseDisplay(headParts.map(decodeSignToken).join(' '))
    }
  }
  return formatPhraseDisplay(label.trim())
}

function isOrphanCountryToken(token: string, signId: string): boolean {
  const n = normalizeToken(stripTokenPunctuation(token))
  if (!FR_COUNTRIES.has(n)) return false
  const parts = signIdBaseParts(signId).map(normalizeToken)
  return !parts.includes(n)
}

function isOrphanCategoryToken(token: string, signId: string): boolean {
  const n = normalizeToken(stripTokenPunctuation(token))
  if (!FR_CATEGORY_SUFFIXES.has(n)) return false
  const parts = signIdBaseParts(signId).map(normalizeToken)
  return !parts.includes(n)
}

/** Nom qualifié par un modificateur (géo ou adjectif) — le modificateur seul ne devient pas une entrée. */
function getQualifiedNounKind(
  first: string,
  second: string,
  signId: string,
  lang: Lang,
): 'geo' | 'adj' | null {
  if (getHeadOnlyTailFromSignId(signId)) return 'geo'

  if (lang !== 'fr') return null
  const a = normalizeToken(first)
  const b = normalizeToken(second)

  if (FR_COUNTRIES.has(b) && !FR_COUNTRIES.has(a)) return 'geo'

  // Deux adjectifs coordonnés → synonymes (agressif / brutal), pas un nom qualifié
  if (isFrenchAdjective(a) && isFrenchAdjective(b)) return null

  if (isFrenchAdjective(b) && !isFrenchAdjective(a)) return 'adj'

  return null
}

function extractGeoSenses(signId: string, label: string, tail: GeoCountryTail, lang: Lang): DictionarySense[] {
  const head = geoHeadDisplay(label, tail, signId)
  const lemma = lemmaFromDisplay(head, lang)
  if (!lemma) return []
  return [{ word: head, lemma, senseKey: `${lemma}@${signId}`, signId }]
}

function extractQualifiedNounSenses(
  signId: string,
  label: string,
  content: string[],
  kind: 'geo' | 'adj',
  lang: Lang,
): DictionarySense[] {
  const trimmed = label.trim()
  const labelWords = labelContentWords(trimmed, lang)
  const headRaw = labelWords[0] ?? decodeSignToken(content[0] ?? '')
  const head = capitalizeWord(cleanWord(headRaw, { allowNumeric: true }) ?? headRaw)
  const headLemma = normalizeToken(head)
  if (!headLemma) return []

  const headSense: DictionarySense = {
    word: head,
    lemma: headLemma,
    senseKey: `${headLemma}@${signId}`,
    signId,
  }

  if (kind === 'geo') {
    const tail = getHeadOnlyTail(content, signId, lang) ?? getHeadOnlyTailFromSignId(signId)
    if (tail) return extractGeoSenses(signId, trimmed, tail, lang)
    return [headSense]
  }

  const full = qualifiedPhraseDisplay(trimmed, lang)
  const fullKey = normalizeToken(full)
  return [
    headSense,
    { word: full, lemma: headLemma, senseKey: fullKey, signId },
  ]
}

function hasPhraseConnector(signId: string, signTokens: string[], lang: Lang): boolean {
  if (/_heures_/.test(signId)) return true
  if (/_du_/.test(signId) || /_de_/.test(signId) || /_la_/.test(signId) || /_le_/.test(signId)) return true
  if (/_des_/.test(signId) || /_au_/.test(signId) || /_aux_/.test(signId)) return true
  return signTokens.some((t) => isStopWord(t, lang))
}

function isTwoTokenPhrase(first: string, second: string, lang: Lang): boolean {
  if (lang !== 'fr') return false
  const a = normalizeToken(first)
  const b = normalizeToken(second)
  if (FR_ADJECTIVE_HEADS.has(a)) return true
  if (FR_SPECIFIER_NOUNS.has(b)) return true
  return false
}

function verbStem(token: string): string {
  let n = normalizeToken(token)
  if (n.startsWith("s'")) n = n.slice(2)
  if (n.startsWith('s') && n.length > 3 && FR_VERB_LIKE.has(n.slice(1))) n = n.slice(1)
  return n
}

function hasVerbalPhrase(content: string[]): boolean {
  return content.slice(1).some((t) => FR_VERB_LIKE.has(verbStem(t)))
}

/** Classifie la structure sémantique d'un signe. */
export function classifySignStructure(signId: string, label: string, lang: Lang): SignStructure {
  const signTokens = stripTrailingVariantSuffix(splitSignId(signId), signId)
  const content = contentTokens(signTokens, lang, signId)
  const trimmed = label.trim()

  if (isNumericExpression(signId, trimmed)) return 'phrase'
  if (content.length <= 1) return 'dedicated'
  if (hasVerbalPhrase(content)) return 'phrase'

  // Lieu + pays ou suffixe catégorie (ville, fruit…) — via sign_id
  if (getHeadOnlyTail(content, signId, lang)) return 'qualified_noun'

  if (/[,;]/.test(trimmed)) return 'synonym_list'

  if (hasPhraseConnector(signId, signTokens, lang)) return 'phrase'

  if (content.length === 2) {
    const [a, b] = content
    const qualified = a && b ? getQualifiedNounKind(a, b, signId, lang) : null
    if (qualified) return 'qualified_noun'
    if (a && b && isTwoTokenPhrase(a, b, lang)) return 'phrase'
    return 'synonym_list'
  }

  // Expression nominale ≥ 3 mots (ex. accident vasculaire cérébral) — pas une liste de synonymes
  if (content.length >= 3 && !hasVerbalPhrase(content)) return 'phrase'

  return 'synonym_list'
}

function formatPhraseDisplay(text: string): string {
  return text
    .split(/(\s+)/)
    .map((part) => {
      if (/^\s+$/.test(part)) return part
      if (/^\d+$/.test(part)) return part
      return capitalizeWord(part)
    })
    .join('')
}

/** Expression qualifiée : tête capitalisée, modificateur(s) tels que dans le libellé source. */
function qualifiedPhraseDisplay(label: string, lang: Lang): string {
  const trimmed = label.trim()
  const words = labelContentWords(trimmed, lang)
  if (words.length === 0) return formatPhraseDisplay(trimmed)
  const head = capitalizeWord(words[0]!)
  const rawParts = trimmed.split(/\s+/u)
  if (rawParts.length <= 1) return head
  return `${head} ${rawParts.slice(1).join(' ')}`
}

function phraseDisplay(signId: string, signTokens: string[], label: string, lang: Lang): string {
  let fromLabel = enrichNumericDisplay(signId, label.trim()).replace(/\s+/g, ' ')
  const content = contentTokens(stripTrailingVariantSuffix(signTokens, signId), lang, signId)
  if (/[,;]/.test(fromLabel) && hasVerbalPhrase(content)) {
    fromLabel = fromLabel.split(/[,;]/)[0]!.trim()
  }
  if (fromLabel) return formatPhraseDisplay(fromLabel)
  return formatPhraseDisplay(content.map(decodeSignToken).join(' '))
}

function disambiguatedLabel(lemma: string, signId: string, label: string, lang: Lang): string {
  const signTokens = contentTokensFromSignId(signId, lang)
  const lemmaNorm = normalizeToken(lemma)
  const context = signTokens
    .filter((t) => normalizeToken(t) !== lemmaNorm)
    .map(decodeSignToken)
    .slice(0, 2)
    .join(' ')
  if (!context) return capitalizeWord(lemma)
  return `${capitalizeWord(lemma)} (${context})`
}

/**
 * Extrait les sens du dictionnaire avec désambiguïsation sémantique.
 * Les composés (aile poulet, moyen âge) restent une entrée ; les homonymes ne fusionnent pas.
 */
export function extractDictionarySenses(signId: string, label: string, lang: Lang): DictionarySense[] {
  const trimmed = label.trim()
  if (!trimmed) return []

  const signTokens = stripTrailingVariantSuffix(splitSignId(signId), signId)
  const structure = classifySignStructure(signId, trimmed, lang)
  const content = contentTokens(signTokens, lang, signId)

  if (structure === 'phrase') {
    const geoTail = getHeadOnlyTail(content, signId, lang)
    if (geoTail) return filterDictionarySenses(extractGeoSenses(signId, trimmed, geoTail, lang), signId)
    if (content.length === 2 && !isNumericExpression(signId, trimmed)) {
      const [a, b] = content
      const kind = a && b ? getQualifiedNounKind(a, b, signId, lang) : null
      if (kind) return filterDictionarySenses(extractQualifiedNounSenses(signId, trimmed, content, kind, lang), signId)
    }
    const display = phraseDisplay(signId, signTokens, trimmed, lang)
    const senseKey = normalizeToken(display)
    const lemma = lemmaFromDisplay(display, lang)
    return filterDictionarySenses([{ word: display, lemma, senseKey, signId }], signId)
  }

  if (structure === 'qualified_noun') {
    const geoTail = getHeadOnlyTail(content, signId, lang)
    if (geoTail) return filterDictionarySenses(extractGeoSenses(signId, trimmed, geoTail, lang), signId)

    if (content.length >= 2) {
      const kind = getQualifiedNounKind(content[0]!, content[1]!, signId, lang)
      if (kind) return filterDictionarySenses(extractQualifiedNounSenses(signId, trimmed, content, kind, lang), signId)
    }
    return []
  }

  if (structure === 'dedicated') {
    const enriched = enrichNumericDisplay(signId, trimmed)
    const raw = cleanWord(labelContentWords(enriched, lang)[0] ?? decodeSignToken(content[0] ?? signId), {
      allowNumeric: true,
    })
    if (!raw) return []
    const display = enriched !== trimmed ? formatPhraseDisplay(enriched) : capitalizeWord(raw)
    const lemma = lemmaFromDisplay(display, lang)
    return filterDictionarySenses([{ word: display, lemma, senseKey: `${lemma}@${signId}`, signId }], signId)
  }

  // synonym_list : un mot par variante, lié au même signe — clé unique par signe
  const geoTail = getHeadOnlyTail(content, signId, lang)
  if (geoTail) return filterDictionarySenses(extractGeoSenses(signId, trimmed, geoTail, lang), signId)

  const labelWords = labelContentWords(trimmed, lang)
  const out: DictionarySense[] = []
  const seen = new Set<string>()

  for (let j = 0; j < content.length; j++) {
    const token = content[j]!
    if (isSignVariantDigit(token, signId)) continue
    const raw = cleanWord(labelWords[j] ?? decodeSignToken(token), { allowNumeric: /\d/.test(trimmed) })
    if (!raw || isStopWord(raw, lang) || isDictionaryNoiseDigit(raw, signId)) continue
    if (isOrphanCountryToken(raw, signId) || isOrphanCategoryToken(raw, signId)) continue
    const lemma = normalizeToken(raw)
    if (seen.has(lemma)) continue
    seen.add(lemma)
    out.push({
      word: capitalizeWord(raw),
      lemma,
      senseKey: `${lemma}@${signId}`,
      signId,
    })
  }

  return filterDictionarySenses(out, signId)
}

/** Partage de contexte lexical entre deux sign_id (Jaccard sur tokens de contenu). */
function tokenOverlap(idA: string, idB: string, lang: Lang): number {
  const a = new Set(contentTokensFromSignId(idA, lang).map(normalizeToken))
  const b = new Set(contentTokensFromSignId(idB, lang).map(normalizeToken))
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const t of a) if (b.has(t)) inter++
  return inter / (a.size + b.size - inter)
}

/**
 * Vrai doublon = même lemme, même sens (synonymes), pas des homonymes.
 * Ex. jeter (poubelle) vs jeter (dé) → faux ; jeter vs lancer (même action) → vrai.
 */
export function areSynonymSigns(
  signIdA: string,
  signIdB: string,
  lemma: string,
  lang: Lang,
  labelsMap: Record<string, string>,
): boolean {
  if (signIdA === signIdB) return false

  const labelA = labelsMap[signIdA] ?? ''
  const labelB = labelsMap[signIdB] ?? ''
  const structA = classifySignStructure(signIdA, labelA, lang)
  const structB = classifySignStructure(signIdB, labelB, lang)
  const lemmaNorm = normalizeToken(lemma)

  // Composés et expressions : jamais des synonymes d'un lemme isolé
  if (structA === 'phrase' || structB === 'phrase') return false
  if (structA === 'qualified_noun' || structB === 'qualified_noun') return false
  if (isNumericExpression(signIdA, labelA) || isNumericExpression(signIdB, labelB)) return false

  const contentA = contentTokensFromSignId(signIdA, lang).map(normalizeToken)
  const contentB = contentTokensFromSignId(signIdB, lang).map(normalizeToken)

  if (!contentA.includes(lemmaNorm) || !contentB.includes(lemmaNorm)) return false

  // Deux signes mono-mot pour le même lemme
  if (structA === 'dedicated' && structB === 'dedicated') return true

  // Signe mono-mot vs variante courte (≤3 mots) partageant le lemme en tête
  if (structA === 'dedicated' && structB === 'synonym_list' && contentB[0] === lemmaNorm) return true
  if (structB === 'dedicated' && structA === 'synonym_list' && contentA[0] === lemmaNorm) return true

  // Deux listes de synonymes : recouvrement lexical fort
  if (structA === 'synonym_list' && structB === 'synonym_list') {
    const overlap = tokenOverlap(signIdA, signIdB, lang)
    if (overlap >= 0.34) return true
    // Même lemme en première position + peu de tokens → probablement même concept
    if (contentA[0] === lemmaNorm && contentB[0] === lemmaNorm && contentA.length <= 4 && contentB.length <= 4) {
      return true
    }
    return false
  }

  // Liste de synonymes vs signe dédié : synonyme si le lemme est le mot principal
  if (structA === 'synonym_list' && structB === 'dedicated') {
    return contentA.includes(lemmaNorm) && contentB[0] === lemmaNorm
  }
  if (structB === 'synonym_list' && structA === 'dedicated') {
    return contentB.includes(lemmaNorm) && contentA[0] === lemmaNorm
  }

  return false
}

/** Regroupe les sign_id d'un lemme en clusters de vrais synonymes. */
export function clusterSynonymSigns(
  lemma: string,
  signIds: string[],
  lang: Lang,
  labelsMap: Record<string, string>,
): string[][] {
  const ids = [...new Set(signIds)]
  if (ids.length <= 1) return ids.length ? [ids] : []

  const clusters: string[][] = []

  for (const id of ids) {
    let placed = false
    for (const cluster of clusters) {
      if (cluster.some((other) => areSynonymSigns(id, other, lemma, lang, labelsMap))) {
        cluster.push(id)
        placed = true
        break
      }
    }
    if (!placed) clusters.push([id])
  }

  return clusters
}

export function normalizeLemma(word: string): string {
  return normalizeToken(word)
}

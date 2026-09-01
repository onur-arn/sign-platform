export type Lang = 'fr' | 'en' | 'tr' | 'pl'

export type SignStructure = 'dedicated' | 'phrase' | 'synonym_list'

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
    if (/^\d+$/.test(t)) continue
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

function contentTokens(signTokens: string[], lang: Lang): string[] {
  return signTokens.filter((t) => !isStopWord(t, lang))
}

function cleanWord(raw: string): string | null {
  let w = raw.trim().replace(/^['"\s]+|['"\s.,;]+$/g, '')
  if (!w) return null
  if (/^\d+$/.test(w)) return null
  w = w.replace(/^\d+\s+/, '').replace(/\s+\d+$/, '').trim()
  if (!w || w.length < 2) return null
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
  const words: string[] = []
  for (const token of tokenizeLabel(label)) {
    let w = token
    if (/^l'/i.test(w)) w = w.slice(2)
    if (/^d'/i.test(w)) w = w.slice(2)
    if (/^s'/i.test(w)) w = w.slice(2)
    const cleaned = cleanWord(w)
    if (!cleaned || isStopWord(cleaned, lang)) continue
    words.push(cleaned)
  }
  return words
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
  const signTokens = splitSignId(signId)
  const content = contentTokens(signTokens, lang)
  const trimmed = label.trim()

  if (content.length <= 1) return 'dedicated'
  if (hasVerbalPhrase(content)) return 'phrase'
  if (/[,;]/.test(trimmed)) return 'synonym_list'
  if (hasPhraseConnector(signId, signTokens, lang)) return 'phrase'

  if (content.length === 2) {
    const [a, b] = content
    if (a && b && isTwoTokenPhrase(a, b, lang)) return 'phrase'
    return 'synonym_list'
  }

  // Expression nominale ≥ 3 mots (ex. accident vasculaire cérébral) — pas une liste de synonymes
  if (content.length >= 3 && !hasVerbalPhrase(content)) return 'phrase'

  return 'synonym_list'
}

function phraseDisplay(signTokens: string[], label: string, lang: Lang): string {
  let fromLabel = label.trim().replace(/\s+\d+(?=\s|$)/g, ' ').replace(/\s+/g, ' ')
  const content = contentTokens(signTokens, lang)
  if (/[,;]/.test(fromLabel) && hasVerbalPhrase(content)) {
    fromLabel = fromLabel.split(/[,;]/)[0]!.trim()
  }
  if (fromLabel) return capitalizeWord(fromLabel)
  return capitalizeWord(content.map(decodeSignToken).join(' '))
}

function disambiguatedLabel(lemma: string, signId: string, label: string, lang: Lang): string {
  const signTokens = contentTokens(splitSignId(signId), lang)
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

  const signTokens = splitSignId(signId)
  const structure = classifySignStructure(signId, trimmed, lang)
  const content = contentTokens(signTokens, lang)

  if (structure === 'phrase') {
    const display = phraseDisplay(signTokens, trimmed, lang)
    const senseKey = normalizeToken(display)
    const lemma = normalizeToken(content[0] ?? display)
    return [{ word: display, lemma, senseKey, signId }]
  }

  if (structure === 'dedicated') {
    const raw = cleanWord(labelContentWords(trimmed, lang)[0] ?? decodeSignToken(content[0] ?? signId))
    if (!raw) return []
    const lemma = normalizeToken(raw)
    return [{ word: capitalizeWord(raw), lemma, senseKey: `${lemma}@${signId}`, signId }]
  }

  // synonym_list : un mot par variante, lié au même signe — clé unique par signe
  const labelWords = labelContentWords(trimmed, lang)
  const out: DictionarySense[] = []
  const seen = new Set<string>()

  for (let j = 0; j < content.length; j++) {
    const token = content[j]!
    const raw = cleanWord(labelWords[j] ?? decodeSignToken(token))
    if (!raw || isStopWord(raw, lang)) continue
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

  return out
}

/** Partage de contexte lexical entre deux sign_id (Jaccard sur tokens de contenu). */
function tokenOverlap(idA: string, idB: string, lang: Lang): number {
  const a = new Set(contentTokens(splitSignId(idA), lang).map(normalizeToken))
  const b = new Set(contentTokens(splitSignId(idB), lang).map(normalizeToken))
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

  const contentA = contentTokens(splitSignId(signIdA), lang).map(normalizeToken)
  const contentB = contentTokens(splitSignId(signIdB), lang).map(normalizeToken)

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

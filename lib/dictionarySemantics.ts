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
  'toucher', 'sentir', 'goûter', 'gouter',
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

/** Expressions figées à garder groupées (plus est sinon un mot vide FR). */
const FR_MERGED_PHRASES: [string, string][] = [
  ['plus', 'tard'],
  ['plus', 'tot'],
  ['bien', 'sur'],
  ['rendez', 'vous'],
  ['jamais', 'vu'],
  ['croque', 'monsieur'],
  ['croque', 'madame'],
  ['mini', 'foot'],
]

/** Groupes figés dans les listes de synonymes (sign_id → un segment chacun). */
const FR_SYNONYM_GROUP_SEQUENCES: string[][] = [
  ['ne', 'pas', 'faire', 'savoir'],
  ['ne', 'pas', 'voir', 'directement'],
  ['ne', 'pas', 'montrer'],
  ['va', 'te', 'faire', 'foutre'],
  ['travailleuse', 'du', 'sexe'],
  ['il', 'n', 'rsquo', 'y', 'a', 'pas'],
  ['il', 'n', 'y', 'a', 'pas'],
  ['s', 'rsquo', 'en', 'lasser'],
  ['s', 'rsquo', 'en', 'fuir'],
  ['s', 'rsquo', 'enfuir'],
  ['s', 'rsquo', 'enlasser'],
  ['s', 'en', 'lasser'],
  ['s', 'en', 'fuir'],
  ['etre', 'epuise'],
  ['boite', 'de', 'nuit'],
  ['chemin', 'de', 'fer'],
  ['centre', 'commercial'],
  ['char', 'de', 'combat'],
  ['chute', 'd', 'rsquo', 'eau'],
  ['chute', 'd', 'eau'],
  ['appareil', 'auditif'],
  ['prothese', 'auditive'],
  ['bras', 'd', 'honneur'],
  ['bras', 'd', 'rsquo', 'honneur'],
  ['musique', 'resonnante'],
  ['serie', 'televisee'],
  ['en', 'abondance'],
  ['en', 'distanciel'],
  ['royaume', 'uni'],
  ['call', 'girl'],
  ['fer', 'a', 'cheval'],
  ['la', 'bas'],
]

/** Connecteurs qui ne sont pas des entrées (ex. energie vitalite ou force). */
const FR_SYNONYM_LIST_NOISE = new Set(['et', 'ou'])

/** Tags en fin de sign_id, pas des synonymes (ex. travailler après boulot emploi…). */
const FR_SYNONYM_TRAILING_SKIP = new Set(['utiliser', 'travailler', 'frontiere'])

/** Listes de synonymes forcées (priorité sur le découpage verbal/comma). */
const FR_FLAT_SYNONYM_OVERRIDE = new Set([
  'cacher_camouflage_dissimuler_ne_pas_voir_directement',
  'dissimuler_ne_pas_faire_savoir_ne_pas_montrer',
])

/** Particules dans les noms propres (van Damme, de Gaulle…). */
const FR_NAME_PARTICLES = new Set([
  'van', 'von', 'de', 'du', 'des', 'le', 'la', 'der', 'di', 'del', 'da', 'dos', 'das', 'do',
  'saint', 'sainte', 'ste', 'mc', 'mac',
])

/** Mots français courants — pas des composants de nom propre. */
const FR_COMMON_VOCABULARY = new Set([
  'abces', 'corps', 'dent', 'absent', 'manquer', 'acceder', 'acces', 'accessibilite', 'accent', 'voix',
  'accident', 'vehicule', 'terrestre', 'actionnaire', 'coupon', 'addiction', 'dependance', 'adjoint',
  'assistant', 'adroit', 'fin', 'malin', 'affaires', 'etrangeres', 'affiche', 'poster', 'affreux', 'laid',
  'moche', 'vilain', 'agenda', 'calendrier', 'agent', 'police', 'agressif', 'brutal', 'agriculteur',
  'ferme', 'fermier', 'ajouter', 'supplement', 'alarme', 'alerte', 'allee', 'chemin', 'sentier',
  'allemagne', 'allemand', 'alligator', 'caiman', 'crocodile', 'allonger', 'repos', 'animal', 'bete',
  'animateur', 'animation', 'application', 'app', 'apres', 'demain', 'midi', 'ensuite', 'puis',
  'argent', 'cout', 'monnaie', 'sou', 'tarif', 'arnaque', 'escroquer', 'art', 'artiste', 'assemblee',
  'congres', 'assez', 'suffire', 'association', 'societe', 'aa', 'alcooliques', 'anonymes', 'aire',
  'endroit', 'espace', 'lieu', 'place', 'zone', 'abreger', 'bref', 'court', 'resume', 'synthese',
  'accrocher', 'portemanteau', 'ah', 'ettonne', 'surprise', 'emotion', 'alphabet', 'dactylologie',
  'epeler', 'applaudir', 'bravo', 'felicitations', 'appareil', 'photo', 'photographie', 'an', 'age',
  'ans', 'annee', 'apres', 'periode', 'arete', 'os', 'astronomie', 'telescope', 'atelier', 'activite',
  'dresse', 'dresser',
])

function isNameLikeToken(token: string): boolean {
  const n = normalizeToken(token)
  if (FR_NAME_PARTICLES.has(n)) return true
  if (/^(ier|ii|iii|iv|vi)$/.test(n)) return true
  if (n.length < 2) return false
  if (isStopWord(n, 'fr')) return false
  if (FR_VERB_LIKE.has(n) || FR_VERB_LIKE.has(verbStem(n))) return false
  if (FR_COUNTRIES.has(n)) return false
  if (FR_CATEGORY_SUFFIXES.has(n)) return false
  if (FR_ADJECTIVE_HEADS.has(n)) return false
  if (FR_SPECIFIER_NOUNS.has(n)) return false
  if (isFrenchAdjective(n)) return false
  if (FR_COMMON_VOCABULARY.has(n)) return false
  return true
}

/** Acronyme court après le mot complet (ex. ultraviolet / uv). */
function isAbbreviationSynonymPair(parts: string[]): boolean {
  if (parts.length !== 2) return false
  const [a, b] = parts.map(normalizeToken)
  if (b.length < 2 || b.length > 4) return false
  if (a.length <= b.length) return false
  if (!/^[a-z]+$/.test(b)) return false
  if (FR_COMMON_VOCABULARY.has(b)) return false
  return true
}

/** Infinitif français (ex. echouer, gronder, rater). */
function isFrenchInfinitive(token: string): boolean {
  const n = normalizeToken(token)
  if (n.length < 5) return false
  if (FR_NAME_PARTICLES.has(n)) return false
  return /(?:er|ir|oir|re)$/.test(n)
}

/** Nom + infinitif = synonymes liés (ex. échec / échouer), pas un nom propre ni une phrase. */
function isNounInfinitiveSynonymPair(first: string, second: string, lang: Lang): boolean {
  if (lang !== 'fr' || !isFrenchInfinitive(second)) return false
  const a = normalizeToken(first)
  if (FR_NAME_PARTICLES.has(a) || isStopWord(a, lang)) return false
  if (FR_ADJECTIVE_HEADS.has(a)) return false
  if (FR_SPECIFIER_NOUNS.has(normalizeToken(second))) return false
  if (new Set(['comment', 'pourquoi', 'quand', 'combien', 'que', 'quoi']).has(a)) return false
  return true
}

function isProperNameSign(
  signId: string,
  signTokens: string[],
  content: string[],
  label: string,
  lang: Lang,
): boolean {
  if (lang !== 'fr' || /[,;]/.test(label)) return false

  const parts = signIdBaseParts(signId).map(normalizeToken)
  if (parts.length < 2 || parts.length > 6) return false
  if (getHeadOnlyTailFromSignId(signId)) return false
  if (hasVerbalPhrase(content)) return false

  const labelWords = label.trim().split(/\s+/u).filter(Boolean)
  if (labelWords.length !== parts.length) return false

  const hasParticle = parts.some((p) => FR_NAME_PARTICLES.has(p))
  if (hasParticle) {
    const nameParts = parts.filter((p) => !FR_NAME_PARTICLES.has(p))
    return nameParts.length >= 2 && nameParts.every(isNameLikeToken)
  }

  if (isUnpunctuatedSynonymList(signId, signTokens, content, label, lang)) return false
  if (isAbbreviationSynonymPair(parts)) return false
  if (isFlatSynonymListSign(signId, lang)) return false
  if (parts.length === 2 && isNounInfinitiveSynonymPair(parts[0]!, parts[1]!, lang)) return false

  if (parts.length >= 2 && parts.length <= 4) {
    return parts.every(isNameLikeToken)
  }

  return false
}

function extractProperNameSenses(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  const signTokens = stripTrailingVariantSuffix(splitSignId(signId), signId)
  const content = contentTokens(signTokens, lang, signId)
  if (!isProperNameSign(signId, signTokens, content, label, lang)) return null

  const display = formatPhraseDisplay(label.trim())
  const lemma = normalizeToken(display)
  return [{ word: display, lemma, senseKey: `${lemma}@${signId}`, signId }]
}

/** Suffixe de catégorie en sign_id (ex. kaki_fruit → « Kaki », koekelberg_ville → « Koekelberg »). */
const FR_CATEGORY_SUFFIXES = new Set([
  'ville', 'fruit', 'planete', 'lieu', 'anatomie', 'religion', 'prenom', 'marque', 'magasin',
  'vehicule', 'animal', 'objet', 'flore', 'matiere', 'instrument', 'asbl',
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

function mergeFixedPhraseTokens(raw: string[]): string[] {
  const out: string[] = []
  for (let i = 0; i < raw.length; i++) {
    const t = raw[i]!
    const n = normalizeToken(t)
    const merged = FR_MERGED_PHRASES.find(([a, b]) => n === a && normalizeToken(raw[i + 1] ?? '') === b)
    if (merged) {
      out.push(`${t} ${raw[i + 1]}`)
      i++
      continue
    }
    out.push(t)
  }
  return out
}

/** Expressions figées ≥ 3 mots (ex. s'il vous plait). */
function mergeMultiWordPhrases(tokens: string[]): string[] {
  const merged = mergeFixedPhraseTokens(tokens)
  const out: string[] = []
  for (let i = 0; i < merged.length; i++) {
    const n0 = normalizeToken(merged[i]!)
    if (
      (n0 === "s'il" || n0 === 'sil') &&
      normalizeToken(merged[i + 1] ?? '') === 'vous' &&
      normalizeToken(merged[i + 2] ?? '') === 'plait'
    ) {
      out.push([merged[i], merged[i + 1], merged[i + 2]].join(' '))
      i += 2
      continue
    }
    if (
      n0 === 'a' &&
      normalizeToken(merged[i + 1] ?? '') === 'partir' &&
      normalizeToken(merged[i + 2] ?? '') === 'de'
    ) {
      out.push([merged[i], merged[i + 1], merged[i + 2]].join(' '))
      i += 2
      continue
    }
    out.push(merged[i]!)
  }
  return out
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
    if (t === 'd' && raw[i + 1] === 'avis') {
      out.push("d'avis")
      i++
      continue
    }
    if (t === 's' && raw[i + 1] === 'envoler') {
      out.push("s'envoler")
      i++
      continue
    }
    if (t === 's' && raw[i + 1] === 'rsquo' && raw[i + 2] === 'en' && raw[i + 3]) {
      out.push(`s'en${raw[i + 3]}`)
      i += 3
      continue
    }
    if (t === 's' && raw[i + 1] === 'rsquo' && raw[i + 2]?.startsWith('en')) {
      out.push(`s'${raw[i + 2]!.replace(/^en/, 'en')}`)
      i += 2
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
  return mergeMultiWordPhrases(out)
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

/**
 * Chiffre isolé 2–9 = nombre de synonymes (ex. excellent_magnifique_3_parfait → 3 mots).
 * Le chiffre compte les tokens réels, pas lui-même.
 */
function getSynonymCountMarker(signId: string): number | null {
  const parts = signIdBaseParts(signId)
  for (let i = 1; i < parts.length - 1; i++) {
    const p = parts[i]!
    if (!/^[2-9]$/.test(p)) continue
    const count = parseInt(p, 10)
    const words = parts.filter((x, j) => j !== i && !/^[1-9]$/.test(x))
    if (words.length === count) return count
  }
  if (parts.length >= 2 && /^[2-9]$/.test(parts[parts.length - 1]!)) {
    const digit = parseInt(parts[parts.length - 1]!, 10)
    const words = parts.slice(0, -1)
    if (words.length === digit) return digit
  }
  return null
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
  if (lower === 'rendez vous' || lower === 'rendez-vous') return 'Rendez-vous'
  if (lower === "s'il vous plait" || lower === "s'il vous plaît") return "S'il vous plaît"
  if (lower === 'svp') return 'SVP'
  if (lower === 'uv') return 'UV'
  if (lower === 'a partir de') return 'À partir de'
  if (lower === "qu'y a-t-il") return "Qu'y a-t-il"
  if (lower === "que se passe-t-il") return "Que se passe-t-il"
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
  const tokens = label
    .replace(/[,;]/g, ' ')
    .replace(/à\s+partir\s+de/gi, 'a partir de')
    .replace(/l'avance/gi, 'l avance')
    .replace(/l'air/gi, 'l air')
    .replace(/d'accord/gi, 'd accord')
    .replace(/d'avis/gi, 'd avis')
    .replace(/s'envoler/gi, "s'envoler")
    .replace(/quelqu'un/gi, "quelqu'un")
    .split(/\s+/u)
    .filter(Boolean)
  return mergeMultiWordPhrases(tokens)
}

function labelContentWords(label: string, lang: Lang): string[] {
  const allowNumeric = /\d/.test(label)
  const words: string[] = []
  for (const token of tokenizeLabel(label)) {
    if (/^\d+$/.test(token)) continue
    let w = token
    const isMergedPhrase = /\s/.test(w)
    if (!isMergedPhrase) {
      if (/^l'/i.test(w)) w = w.slice(2)
      if (/^d'/i.test(w)) w = w.slice(2)
      if (/^s'/i.test(w) && !/^s'il\b/i.test(w)) w = w.slice(2)
    }
    const cleaned = cleanWord(w, { allowNumeric })
    if (!cleaned || isStopWord(cleaned, lang)) continue
    words.push(cleaned)
  }
  return words
}

/** Chiffres, heures, durées, nombres composés (cent dix, 10 heures…). */
export function isNumericExpression(signId: string, label: string): boolean {
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
const FR_NOUN_NOT_ADJECTIVE = new Set(['mois', 'fois', 'pays', 'bois', 'poids', 'repas', 'coque'])

function isFrenchAdjective(token: string): boolean {
  const n = normalizeToken(token)
  if (n.length < 4) return false
  if (FR_NOUN_NOT_ADJECTIVE.has(n) || FR_COUNTRIES.has(n)) return false
  return /(aire|ique|eux|euse|if|ive|ien|ienne|ois|oise|ais|elle|able|ible|al|ale|uel|uelle|du|ue)$/.test(n)
}

function isDedicatedMonoSign(head: string, lang: Lang): boolean {
  const signId = normalizeToken(head)
  if (signIdBaseParts(signId).length !== 1) return false
  const signTokens = stripTrailingVariantSuffix(splitSignId(signId), signId)
  const content = contentTokens(signTokens, lang, signId)
  return content.length === 1 && normalizeToken(content[0]!) === signId
}

/** ex. surprise_evenement_inattendu → « Surprise » + « Evenement inattendu » (pas une seule phrase). */
function isSynonymParaphraseSign(signId: string, content: string[], label: string, lang: Lang): boolean {
  if (lang !== 'fr') return false
  if (content.length !== 3) return false
  if (getHeadOnlyTailFromSignId(signId)) return false
  if (/[,;]/.test(label)) return false
  const parts = signIdBaseParts(signId)
  const head = normalizeToken(parts[0]!)
  if (FR_ADJECTIVE_HEADS.has(head) || isFrenchAdjective(head)) return false
  const tail = normalizeToken(parts[2]!)
  const mid = normalizeToken(parts[1]!)
  if (!isFrenchAdjective(tail) || isFrenchAdjective(mid)) return false
  const labelWords = labelContentWords(label, lang)
  if (labelWords.length < 3 || normalizeToken(labelWords[0]!) !== head) return false
  return true
}

function extractSynonymParaphraseSenses(signId: string, label: string, lang: Lang): DictionarySense[] {
  const trimmed = label.trim()
  const labelWords = labelContentWords(trimmed, lang)
  const parts = signIdBaseParts(signId)
  const headLemma = normalizeToken(parts[0]!)
  const rawTailParts = trimmed.split(/\s+/u).slice(1)
  const tailDisplay = qualifiedPhraseDisplay(rawTailParts.join(' '), lang)
  const tailLemma = normalizeToken(labelWords[1] ?? parts[1] ?? '')
  const tailKey = normalizeToken(rawTailParts.join(' '))
  if (!tailLemma || !tailKey) return []

  const senses: DictionarySense[] = []
  if (!isDedicatedMonoSign(parts[0]!, lang)) {
    const head = capitalizeWord(labelWords[0] ?? decodeSignToken(parts[0]!))
    senses.push({ word: head, lemma: headLemma, senseKey: `${headLemma}@${signId}`, signId })
  }
  senses.push({ word: tailDisplay, lemma: tailLemma, senseKey: tailKey, signId })
  return senses
}

type GeoCountryTail = { tokens: string[]; length: number }

function signIdBaseParts(signId: string): string[] {
  return signId.replace(/_\d+$/, '').split('_').filter(Boolean)
}

function mergedSegmentDisplay(seq: string[]): string {
  const norm = seq.map(normalizeToken)
  if (norm[0] === 's' && norm[1] === 'rsquo' && norm[2]?.startsWith('en')) {
    if (norm[2] === 'en' && norm[3]) return `s'en ${decodeSignToken(seq[3]!)}`
    return `s'${decodeSignToken(seq[2]!)}`
  }
  if (norm[0] === 'il' && norm[1] === 'n' && norm[2] === 'rsquo') {
    return `il n'${seq.slice(3).map(decodeSignToken).join(' ')}`
  }
  if (norm[0] === 'chute' && norm[1] === 'd' && norm[2] === 'rsquo') {
    return `chute d'${decodeSignToken(seq[3]!)}`
  }
  if (norm[0] === 'bras' && norm[1] === 'd' && norm[2] === 'rsquo') {
    return `bras d'${decodeSignToken(seq[3]!)}`
  }
  return seq.map(decodeSignToken).join(' ')
}

function mergeSynonymGroupParts(parts: string[]): string[] {
  const sequences = [...FR_SYNONYM_GROUP_SEQUENCES].sort((a, b) => b.length - a.length)
  const out: string[] = []
  for (let i = 0; i < parts.length; i++) {
    let matched: string[] | null = null
    for (const seq of sequences) {
      if (seq.every((t, j) => normalizeToken(parts[i + j] ?? '') === normalizeToken(t))) {
        matched = seq
        break
      }
    }
    if (matched) {
      out.push(mergedSegmentDisplay(matched))
      i += matched.length - 1
      continue
    }
    out.push(parts[i]!)
  }
  return out
}

function rawSynonymParts(signId: string): string[] {
  let parts = signIdBaseParts(signId)
  const countMarker = getSynonymCountMarker(signId)
  if (countMarker !== null) {
    parts = parts.filter((p) => !/^[2-9]$/.test(p))
  } else if (parts.length >= 2 && /^[2-9]$/.test(parts[parts.length - 1]!)) {
    const digit = parseInt(parts[parts.length - 1]!, 10)
    const words = parts.slice(0, -1)
    if (words.length === digit) parts = words
  }
  return parts
}

function getFlatSynonymSegments(signId: string): string[] | null {
  let segments = mergeSynonymGroupParts(rawSynonymParts(signId))
  segments = segments.filter((s) => !FR_SYNONYM_LIST_NOISE.has(normalizeToken(s)))
  segments = segments.filter((s) => !FR_SYNONYM_TRAILING_SKIP.has(normalizeToken(s)))
  segments = segments.filter((s) => !isSignCategoryMarker(s, signId))

  const base = signId.replace(/_\d+$/, '')
  if (base === 'cacher_camouflage_dissimuler_ne_pas_voir_directement' && segments.length >= 2) {
    segments = segments.slice(-2)
  }
  if (base === 'dissimuler_ne_pas_faire_savoir_ne_pas_montrer' && segments.length >= 2) {
    segments = segments.slice(-2)
  }

  if (segments.length < 2 || segments.length > 6) return null
  return segments
}

function isFlatSynonymListSign(signId: string, lang: Lang): boolean {
  if (lang !== 'fr') return false
  const base = signId.replace(/_\d+$/, '')
  if (base === 'la_bas' || base === 'fer_a_cheval_de_trait') return false

  const signTokens = stripTrailingVariantSuffix(splitSignId(signId), signId)
  if (contentTokens(signTokens, lang, signId).length <= 1) return false
  if (getSynonymDePhraseSplit(signId, lang)) return false

  const segments = getFlatSynonymSegments(signId)
  if (!segments || segments.length < 2 || segments.length > 6) return false
  if (FR_FLAT_SYNONYM_OVERRIDE.has(base)) return true

  if (getMultiVerbalPhraseSegments(signId, lang)) return false
  if (isApartirDeSynonymSign(signId, lang)) return false

  if (segments.length === 2) {
    const first = normalizeToken(segments[0]!.split(/\s+/)[0]!)
    const second = normalizeToken(segments[1]!.split(/\s+/)[0]!)
    if (FR_SPECIFIER_NOUNS.has(second) && !FR_SPECIFIER_NOUNS.has(first)) return false
    if (isTwoTokenPhrase(segments[0]!, segments[1]!, lang)) return false
    if (isNounInfinitiveSynonymPair(first, second, lang)) return true
    if (computeGeoCountryTail(signId) && !/\s/.test(segments[1]!)) return false
    return true
  }

  if (computeGeoCountryTail(signId) && !isSynonymGeoWordList(signId)) return false

  const countMarker = getSynonymCountMarker(signId)
  if (countMarker !== null && segments.length === countMarker) return true

  return true
}

function segmentPartsForMatch(segment: string): string[] {
  if (/^d['']?avis$/i.test(segment)) return ['d', 'avis']
  if (/^d['']?honneur$/i.test(segment)) return ['d', 'honneur']
  if (/^s['']?enfuir$/i.test(segment)) return ['s', 'rsquo', 'enfuir']
  if (/^s['']?en\s+lasser$/i.test(segment)) return ['s', 'rsquo', 'en', 'lasser']
  if (/^s['']?en$/i.test(segment)) return ['s', 'en']
  return segment.trim().split(/\s+/u)
}

function synonymSegmentDisplay(raw: string, segment: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return capitalizeWord(decodeSignToken(segment))
  const norm = normalizeToken(segment)
  if (norm === 'a partir de') return 'À partir de'
  if (norm === 'la bas') return 'La bas'
  if (norm === 'fer a cheval') return 'Fer à cheval'
  if (/^s'|^il n'/i.test(trimmed) || /^s'|^il n'/i.test(segment)) return verbalPhraseDisplay(trimmed)
  if (/\s/.test(segment)) return verbalPhraseDisplay(trimmed)
  return capitalizeWord(cleanWord(trimmed, { allowNumeric: true }) ?? trimmed)
}

function extractFlatSynonymListSenses(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  if (!isFlatSynonymListSign(signId, lang)) return null
  const segments = getFlatSynonymSegments(signId)
  if (!segments) return null

  const senses: DictionarySense[] = []
  const seen = new Set<string>()
  let remaining = label.replace(/[,;]/g, ' ').replace(/\s+/g, ' ').trim()

  for (const segment of segments) {
    const parts = segmentPartsForMatch(segment)
    const raw =
      extractLeadingSegmentPhrase(remaining, parts) ??
      extractLeadingSegmentPhrase(remaining, parts.map((p) => decodeSignToken(p))) ??
      segment
    remaining = remaining.slice(raw.length).trim()
    const display = synonymSegmentDisplay(raw, segment)
    const key = normalizeToken(raw || segment)
    const lemma = normalizeToken(display)
    if (!lemma || seen.has(key)) continue
    seen.add(key)
    senses.push({ word: display, lemma, senseKey: `${key}@${signId}`, signId })
  }

  return senses.length >= 2 ? senses : null
}

function extractDedicatedCompoundSenses(signId: string, lang: Lang): DictionarySense[] | null {
  if (lang !== 'fr') return null
  const base = signId.replace(/_\d+$/, '')
  if (base === 'la_bas') {
    return [{ word: 'La bas', lemma: 'la bas', senseKey: `la bas@${signId}`, signId }]
  }
  if (base === 'fer_a_cheval_de_trait') {
    return [{ word: 'Fer à cheval', lemma: 'fer a cheval', senseKey: `fer a cheval@${signId}`, signId }]
  }
  return null
}

/** sign_id avec deux tokens identiques (yo_yo, bla_bla) → un seul mot au dictionnaire. */
function isReduplicatedCompound(signId: string): boolean {
  const parts = signIdBaseParts(signId)
  return parts.length === 2 && normalizeToken(parts[0]!) === normalizeToken(parts[1]!)
}

function reduplicatedDisplay(signId: string, label: string): string {
  const parts = signIdBaseParts(signId)
  const head = decodeSignToken(parts[0]!)
  const labelParts = label.trim().split(/\s+/u)
  if (
    labelParts.length === 2 &&
    normalizeToken(labelParts[0]!) === normalizeToken(labelParts[1]!)
  ) {
    // yo yo → Yoyo ; bla bla → Bla bla ; salarie salarie → Salarié
    if (head.length <= 2) {
      return capitalizeWord(head) + labelParts[1]!.toLowerCase()
    }
    if (head.length > 4) {
      return capitalizeWord(head)
    }
    return formatPhraseDisplay(label.trim())
  }
  return formatPhraseDisplay(head + head)
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
function computeGeoCountryTail(signId: string): GeoCountryTail | null {
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

function isSynonymGeoWordList(signId: string): boolean {
  const parts = signIdBaseParts(signId).map(normalizeToken)
  if (parts.length < 3) return false
  return parts.every(
    (n) =>
      FR_COUNTRIES.has(n) ||
      isFrenchAdjective(n) ||
      n === 'anglais' ||
      n === 'europeen' ||
      n === 'royaume' ||
      n === 'uni',
  )
}

function getGeoCountryTailFromSignId(signId: string): GeoCountryTail | null {
  if (isSynonymGeoWordList(signId)) return null
  return computeGeoCountryTail(signId)
}

function getGeoCountryTail(content: string[], signId: string, _lang: Lang): GeoCountryTail | null {
  const fromId = getGeoCountryTailFromSignId(signId)
  if (!fromId || content.length < 2) return null
  return fromId
}

/** Tag de désambiguïsation (fruit, ville…) — entrée tête seule, pas le suffixe. */
function getCategorySuffixTailFromSignId(signId: string): GeoCountryTail | null {
  const parts = signIdBaseParts(signId)
  if (parts.length < 2) return null
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
  return token.replace(/^[,;.:?]+|[,;.:?]+$/g, '')
}

function stripRelationalPrefix(word: string): string {
  const w = stripTokenPunctuation(word)
  if (/^d['']/i.test(w)) return w.replace(/^d['']/i, '')
  return w.replace(/^(de|du|des)\s+/i, '')
}

function geoHeadFromSignId(signId: string, tail: GeoCountryTail): string {
  const tokens = stripTrailingVariantSuffix(splitSignId(signId), signId)
  const tailNorm = tail.tokens.map(normalizeToken)
  let cutAt = tokens.length

  for (let i = tailNorm.length - 1; i >= 0; i--) {
    cutAt--
    while (cutAt >= 0) {
      const tok = normalizeToken(stripRelationalPrefix(decodeSignToken(tokens[cutAt]!)))
      if (tok === tailNorm[i]) break
      cutAt--
    }
    if (cutAt < 0) break
  }

  if (cutAt >= 0) {
    const headTokens = tokens.slice(0, cutAt).filter((t) => {
      const n = normalizeToken(t)
      return n !== 'rsquo' && !FR_RELATIONAL_BEFORE_COUNTRY.has(n)
    })
    if (headTokens.length > 0) {
      return formatPhraseDisplay(headTokens.map(decodeSignToken).join(' '))
    }
  }

  if (tokens.length >= 2 && FR_COUNTRIES.has(tailNorm[0]!)) {
    return formatPhraseDisplay(decodeSignToken(tokens[0]!))
  }

  return formatPhraseDisplay(tokens.slice(0, -tail.length).map(decodeSignToken).join(' '))
}

function geoHeadDisplay(label: string, tail: GeoCountryTail, signId?: string): string {
  const rawParts = label.trim().split(/\s+/u).map(stripTokenPunctuation)
  const tailNorm = tail.tokens.map(normalizeToken)
  let cutAt = rawParts.length
  for (let i = tailNorm.length - 1; i >= 0; i--) {
    cutAt--
    while (cutAt >= 0 && normalizeToken(stripRelationalPrefix(rawParts[cutAt]!)) !== tailNorm[i]) cutAt--
    if (cutAt < 0) break
  }
  if (cutAt >= 0) {
    return formatPhraseDisplay(rawParts.slice(0, cutAt).join(' '))
  }
  if (signId) return geoHeadFromSignId(signId, tail)
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

/**
 * Tag de catégorie dans le sign_id (fruit, ville, objet…), pas un mot du dictionnaire.
 * Ex. copier_objet_dupliquer → « objet » est un marqueur, pas un synonyme de copier.
 * Sauf « objet de literie » où objet fait partie de l'expression.
 */
function isSignCategoryMarker(token: string, signId: string): boolean {
  const n = normalizeToken(stripTokenPunctuation(token))
  if (!FR_CATEGORY_SUFFIXES.has(n)) return false

  const parts = signIdBaseParts(signId).map(normalizeToken)
  if (!parts.includes(n)) return false
  if (parts.length === 1 && parts[0] === n) return false

  const idx = parts.indexOf(n)
  if (idx === 0) return false

  const next = parts[idx + 1]
  if (next && ['de', 'du', 'des'].includes(next)) return false

  return true
}

/** ASBL = forme juridique (association sans but lucratif), pas un mot du dictionnaire. */
function extractAsblOrganizationSenses(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  if (lang !== 'fr') return null
  const parts = signIdBaseParts(signId).map(normalizeToken)
  if (parts[parts.length - 1] !== 'asbl') return null

  const tail: GeoCountryTail = { tokens: ['asbl'], length: 1 }
  let head = geoHeadDisplay(label, tail, signId)
  head = formatPhraseDisplay(head.replace(/[,;]+/g, ' ').replace(/\s+/g, ' ').trim())

  const lemma = lemmaFromDisplay(head, lang)
  if (!lemma || lemma === 'asbl') return null

  return [{ word: head, lemma, senseKey: `${normalizeToken(head)}@${signId}`, signId }]
}

/** OVNI = objet volant non identifié — une seule entrée « Ovni », pas un découpage mot à mot. */
function extractOvniSenses(signId: string, lang: Lang): DictionarySense[] | null {
  if (lang !== 'fr' || !/^ovni_objet_volant_non_identifie/.test(signId)) return null

  const withSoucoupe = /soucoupe/.test(signId)
  const display = withSoucoupe ? 'Ovni (soucoupe)' : 'Ovni'
  return [
    {
      word: display,
      lemma: 'ovni',
      senseKey: `${normalizeToken(display)}@${signId}`,
      signId,
    },
  ]
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
  if (lang === 'fr' && isFlatSynonymListSign(signId, lang)) return false
  if (/_heures_/.test(signId)) return true
  if (/_d_/.test(signId) || /_du_/.test(signId) || /_de_/.test(signId) || /_la_/.test(signId) || /_le_/.test(signId)) return true
  if (/_des_/.test(signId) || /_au_/.test(signId) || /_aux_/.test(signId)) return true
  return signTokens.some((t) => isStopWord(t, lang))
}

/** Composé nominal + tag après virgule (ex. « Conseil d'administration, ça »). */
function isCompoundPhraseWithTrailingCommaTag(
  signId: string,
  signTokens: string[],
  label: string,
  lang: Lang,
): boolean {
  if (lang !== 'fr' || !/[,;]/.test(label)) return false
  if (!hasPhraseConnector(signId, signTokens, lang)) return false

  const segments = label.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
  if (segments.length !== 2) return false

  const [beforeComma, afterComma] = segments
  if (!beforeComma || !afterComma) return false
  if (!/\b(d'|d |de |du |des )/i.test(beforeComma)) return false

  const afterWords = afterComma.split(/\s+/).filter(Boolean)
  if (afterWords.length !== 1) return false

  const content = contentTokens(signTokens, lang, signId)
  if (content.length < 2 || content.length > 3) return false

  const headContent = content.slice(0, -1).map(normalizeToken)
  if (headContent.length > 2) return false

  const beforeNorm = new Set(labelContentWords(beforeComma, lang).map(normalizeToken))
  if (!headContent.every((t) => beforeNorm.has(t))) return false

  const lastContent = normalizeToken(content[content.length - 1]!)
  const afterNorm = normalizeToken(afterWords[0]!)
  return (
    lastContent === afterNorm ||
    lastContent.startsWith(afterNorm) ||
    afterNorm.startsWith(lastContent)
  )
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

/** « À la poubelle jeter » → Poubelle · Jeter (pas une phrase figée). */
function isPrepositionalVerbList(signId: string, content: string[], lang: Lang): boolean {
  if (lang !== 'fr') return false
  if (!/^a_la_/.test(signId)) return false
  if (content.length < 2) return false
  const last = content[content.length - 1]!
  return FR_VERB_LIKE.has(verbStem(last)) || FR_VERB_LIKE.has(normalizeToken(last))
}

function extractPrepositionalVerbSenses(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  const signTokens = stripTrailingVariantSuffix(splitSignId(signId), signId)
  const content = contentTokens(signTokens, lang, signId)
  if (!isPrepositionalVerbList(signId, content, lang)) return null

  const out: DictionarySense[] = []
  const seen = new Set<string>()
  const segments = label
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)

  for (const segment of segments) {
    for (const raw of labelContentWords(segment.replace(/\s+\d+(?=\s|$)/g, ' '), lang)) {
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
  }

  return out.length > 0 ? out : null
}

function prepositionalFinPhrase(label: string): string {
  const cleaned = label.trim().replace(/\s+\d+(?=\s|[,;]|$)/g, ' ')
  const firstSegment = cleaned.split(/[,;]/)[0]!.trim()
  const match = firstSegment.match(/^((?:à|a)\s+la\s+fin)\b/i)
  if (match) return match[1]!
  return firstSegment.replace(/\s+fin\s*$/i, '').trim() || firstSegment
}

/** « À la fin » / « À la fin, fin » — expression + éventuellement le nom seul. */
function extractPrepositionalFinSenses(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  if (lang !== 'fr' || !/^a_la_fin/.test(signId)) return null

  const basePhrase = formatPhraseDisplay(prepositionalFinPhrase(label))
  const senses: DictionarySense[] = [
    {
      word: basePhrase,
      lemma: 'fin',
      senseKey: `${normalizeToken(basePhrase)}@${signId}`,
      signId,
    },
  ]

  const signTokens = stripTrailingVariantSuffix(splitSignId(signId), signId)
  const content = contentTokens(signTokens, lang, signId)
  if (content.length >= 2) {
    const last = content[content.length - 1]!
    senses.push({
      word: capitalizeWord(last),
      lemma: normalizeToken(last),
      senseKey: `${normalizeToken(last)}@${signId}`,
      signId,
    })
  }

  return senses
}

/** « Qu'y a-t-il, que se passe-t-il » → deux expressions distinctes. */
function extractCommaQuestionPhrases(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  if (lang !== 'fr' || !/[,;]/.test(label)) return null

  const segments = label
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (segments.length !== 2) return null

  const isCliticQuestion = (segment: string) => /(?:a-t-il|t-il|t il)/i.test(segment)
  if (!segments.every(isCliticQuestion)) return null

  return segments.map((segment) => {
    const trimmedSeg = segment.trim()
    let display = formatPhraseDisplay(trimmedSeg)
    if (/^qu['']y a-t-il$/i.test(trimmedSeg)) display = "Qu'y a-t-il"
    if (/^que se passe-t-il$/i.test(trimmedSeg)) display = 'Que se passe-t-il'
    const key = normalizeToken(display.replace(/[?'"]/g, ''))
    return {
      word: display,
      lemma: lemmaFromDisplay(display, lang),
      senseKey: `${key}@${signId}`,
      signId,
    }
  })
}

function lemmaFromCommaSegment(display: string, lang: Lang): string {
  const contentWords = labelContentWords(display, lang)
  if (contentWords.length >= 2) return normalizeToken(display)
  return lemmaFromDisplay(display, lang)
}

/** Liste de synonymes avec virgules — un segment = une entrée (ex. « gagner de l'argent »). */
function extractCommaSynonymListSenses(signId: string, label: string, lang: Lang): DictionarySense[] {
  const out: DictionarySense[] = []
  const seen = new Set<string>()

  for (const segment of label.split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
    const cleaned = segment.replace(/\s+\d+(?=\s|$)/g, ' ').trim()
    if (!cleaned) continue

    const segmentWords = labelContentWords(cleaned, lang)
    if (segmentWords.length === 2 && isNounInfinitiveSynonymPair(segmentWords[0]!, segmentWords[1]!, lang)) {
      for (const raw of segmentWords) {
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
      continue
    }

    const display = formatPhraseDisplay(cleaned)
    const lemma = lemmaFromCommaSegment(display, lang)
    if (!lemma || seen.has(lemma)) continue
    if (isSignCategoryMarker(display, signId)) continue
    seen.add(lemma)
    out.push({
      word: display,
      lemma,
      senseKey: `${normalizeToken(display)}@${signId}`,
      signId,
    })
  }

  return out
}

/**
 * Synonyme court + expression « X de Y » (ex. seisme / tremblement de terre).
 * Mot unique en tête, puis nom + de + nom (4 parties dans le sign_id).
 */
function getSynonymDePhraseSplit(signId: string, lang: Lang): { head: string; tailParts: string[] } | null {
  if (lang !== 'fr') return null
  if (isApartirDeSynonymSign(signId, lang)) return null
  const parts = signIdBaseParts(signId)
  const deIdx = parts.findIndex((p) => normalizeToken(p) === 'de')
  if (deIdx < 1 || deIdx !== parts.length - 2) return null

  const headParts = parts.slice(0, deIdx - 1)
  const tailParts = parts.slice(deIdx - 1)
  if (headParts.length !== 1 || tailParts.length < 3) return null

  const headNorm = normalizeToken(headParts[0]!)
  if (FR_NAME_PARTICLES.has(headNorm)) return null
  if (FR_TITLE_BEFORE_COUNTRY.has(normalizeToken(tailParts[0]!))) return null
  if (FR_COUNTRIES.has(normalizeToken(parts[parts.length - 1]!))) return null
  if (normalizeToken(tailParts[0]!) === 'type') return null

  return { head: headParts[0]!, tailParts }
}

function extractSynonymDePhraseSenses(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  const split = getSynonymDePhraseSplit(signId, lang)
  if (!split) return null

  const trimmed = label.trim()
  const labelWords = labelContentWords(trimmed, lang)
  const headLemma = normalizeToken(split.head)
  const headDisplay = capitalizeWord(labelWords[0] ?? decodeSignToken(split.head))
  const tailRaw = tailPhraseFromLabel(trimmed, split.tailParts)
  const tailDisplay = qualifiedPhraseDisplay(tailRaw, lang)
  const tailLemma = normalizeToken(labelWords[1] ?? split.tailParts[0] ?? '')
  const tailKey = normalizeToken(tailRaw)
  if (!tailLemma || !tailKey) return null

  return [
    { word: headDisplay, lemma: headLemma, senseKey: `${headLemma}@${signId}`, signId },
    { word: tailDisplay, lemma: tailLemma, senseKey: tailKey, signId },
  ]
}

/** Préposition / clitic qui reste attaché au verbe précédent (ex. ne pas, d'avis, se désister). */
const FR_VERB_PHRASE_ATTACH = new Set([
  'd', 'de', 'du', 'des', 'sa', 'son', 'ses', 'se', 's', 'pas', 'ne', 'la', 'le', 'les', 'l', 'a', 'au', 'aux',
])

function isMultiVerbalPhraseStart(part: string, prevPart: string | null): boolean {
  const n = normalizeToken(part)
  if (n === 'se') return true
  if (!isFrenchInfinitive(part) && !FR_VERB_LIKE.has(n)) return false
  if (!prevPart) return false
  return !FR_VERB_PHRASE_ATTACH.has(normalizeToken(prevPart))
}

/** Découpe en expressions verbales (ex. changer d'avis · retourner sa veste · se desister). */
function getMultiVerbalPhraseSegments(signId: string, lang: Lang): string[][] | null {
  if (lang !== 'fr') return null
  if (isApartirDeSynonymSign(signId, lang)) return null

  const flatSegments = getFlatSynonymSegments(signId)
  if (flatSegments && flatSegments.length >= 3) return null

  const flatParts = mergeSynonymGroupParts(rawSynonymParts(signId))
  if (
    flatParts.length >= 5 &&
    flatParts.every((p) => !/\s/.test(p)) &&
    !flatParts.some((p) => FR_VERB_PHRASE_ATTACH.has(normalizeToken(p)))
  ) {
    return null
  }

  const parts = signIdBaseParts(signId)
  if (parts.length < 4) return null

  const segments: string[][] = []
  let current: string[] = []

  for (const part of parts) {
    if (current.length === 0) {
      current.push(part)
      continue
    }
    if (isMultiVerbalPhraseStart(part, current[current.length - 1]!)) {
      segments.push(current)
      current = [part]
    } else {
      current.push(part)
    }
  }
  if (current.length) segments.push(current)
  if (segments.length < 2 || segments.length > 5) return null

  for (const seg of segments) {
    const first = normalizeToken(seg[0]!)
    if (first !== 'se' && !isFrenchInfinitive(seg[0]!) && !FR_VERB_LIKE.has(first)) return null
  }

  return segments
}

function matchSegmentToken(labelPart: string, segmentPart: string): boolean {
  return normalizeToken(stripTokenPunctuation(labelPart)) === normalizeToken(segmentPart)
}

function extractLeadingSegmentPhrase(label: string, segmentParts: string[]): string | null {
  const rawParts = label.trim().split(/\s+/u)
  let segIdx = 0
  let endIdx = 0

  for (let i = 0; i < rawParts.length && segIdx < segmentParts.length; i++) {
    const segPart = segmentParts[segIdx]!
    const labelPart = rawParts[i]!

    if (
      normalizeToken(segPart) === 'd' &&
      segIdx + 1 < segmentParts.length &&
      normalizeToken(segmentParts[segIdx + 1]!) === 'avis' &&
      /^d['']?avis$/i.test(stripTokenPunctuation(labelPart))
    ) {
      segIdx += 2
      endIdx = i + 1
      continue
    }

    if (
      normalizeToken(segPart) === 's' &&
      normalizeToken(segmentParts[segIdx + 1] ?? '') === 'rsquo' &&
      normalizeToken(segmentParts[segIdx + 2] ?? '') === 'en' &&
      /^s['']?en$/i.test(stripTokenPunctuation(labelPart))
    ) {
      segIdx += 3
      endIdx = i + 1
      continue
    }

    if (
      normalizeToken(segPart) === 's' &&
      normalizeToken(segmentParts[segIdx + 1] ?? '') === 'rsquo' &&
      segIdx + 2 < segmentParts.length &&
      /^s['']?en/i.test(stripTokenPunctuation(labelPart)) &&
      normalizeToken(segmentParts[segIdx + 2] ?? '') !== 'en'
    ) {
      segIdx += 3
      endIdx = i + 1
      continue
    }

    if (matchSegmentToken(labelPart, segPart)) {
      segIdx++
      endIdx = i + 1
      continue
    }

    return null
  }

  if (segIdx !== segmentParts.length) return null
  return rawParts.slice(0, endIdx).join(' ')
}

function verbalPhraseDisplay(raw: string): string {
  let trimmed = raw.trim().replace(/\bd\s+avis\b/gi, "d'avis")
  trimmed = trimmed
    .replace(/\bd\s+honneur\b/gi, "d'honneur")
    .replace(/\bd\s+eau\b/gi, "d'eau")
    .replace(/\bbras d honneur\b/gi, "bras d'honneur")
    .replace(/\bchute d eau\b/gi, "chute d'eau")
    .replace(/\bs\s+en\s+fuir\b/gi, "s'enfuir")
    .replace(/\bs\s+en\s+lasser\b/gi, "s'en lasser")
    .replace(/\bil\s+n\s+y\s+a\s+pas\b/gi, "il n'y a pas")
    .replace(/\bs\s+'\s+/g, "s'")
    .replace(/\bd\s+'\s+/g, "d'")
    .replace(/\bil\s+n\s+'\s+/gi, "il n'")
  if (!trimmed) return trimmed
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function segmentFallbackPhrase(segmentParts: string[]): string {
  const out: string[] = []
  for (let i = 0; i < segmentParts.length; i++) {
    const t = segmentParts[i]!
    if (normalizeToken(t) === 'd' && normalizeToken(segmentParts[i + 1] ?? '') === 'avis') {
      out.push("d'avis")
      i++
      continue
    }
    out.push(decodeSignToken(t))
  }
  return out.join(' ')
}

/** ex. a_partir_de_maintenant → « À partir de » · « Maintenant ». */
function isApartirDeSynonymSign(signId: string, lang: Lang): boolean {
  if (lang !== 'fr') return false
  const base = signId.replace(/_\d+$/, '')
  if (!/^a_partir_de_/i.test(base)) return false
  return signIdBaseParts(signId).length >= 4
}

function extractApartirDeSynonymSenses(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  if (!isApartirDeSynonymSign(signId, lang)) return null
  const tailParts = signIdBaseParts(signId).slice(3)
  if (tailParts.length === 0) return null

  const normalizedLabel = label.replace(/[,;]/g, ' ').replace(/\s+/g, ' ').trim()
  let remaining = normalizedLabel.replace(/^à?\s*partir\s+de\s+/i, '').trim()

  const senses: DictionarySense[] = [
    {
      word: 'À partir de',
      lemma: 'a partir de',
      senseKey: `a partir de@${signId}`,
      signId,
    },
  ]

  for (const part of tailParts) {
    const partNorm = normalizeToken(part)
    const labelWords = remaining.split(/\s+/u).map(stripTokenPunctuation).filter(Boolean)
    const matchIdx = labelWords.findIndex((w) => normalizeToken(w) === partNorm)
    const raw = matchIdx >= 0 ? labelWords[matchIdx]! : decodeSignToken(part)
    if (matchIdx >= 0) {
      remaining = labelWords.slice(matchIdx + 1).join(' ')
    }
    const cleaned = cleanWord(raw, { allowNumeric: true }) ?? raw
    senses.push({
      word: capitalizeWord(cleaned),
      lemma: partNorm,
      senseKey: `${partNorm}@${signId}`,
      signId,
    })
  }

  return senses
}

function extractMultiVerbalPhraseSynonymSenses(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  const segments = getMultiVerbalPhraseSegments(signId, lang)
  if (!segments) return null

  const senses: DictionarySense[] = []
  const seen = new Set<string>()
  let remaining = label.trim().replace(/[,;]+/g, ' ').replace(/\s+/g, ' ').trim()

  for (const segmentParts of segments) {
    const raw =
      extractLeadingSegmentPhrase(remaining, segmentParts) ?? segmentFallbackPhrase(segmentParts)
    remaining = remaining.slice(raw.length).trim()
    const display = verbalPhraseDisplay(raw)
    const lemma = lemmaFromDisplay(display, lang)
    const key = normalizeToken(display)
    if (!lemma || seen.has(key)) continue
    seen.add(key)
    senses.push({ word: display, lemma, senseKey: `${key}@${signId}`, signId })
  }

  return senses.length >= 2 ? senses : null
}

/** ex. repugnant_degoutant_incapable_de_toucher → 3 synonymes dont « incapable de toucher ». */
function getSynonymVerbalPhraseTail(signId: string): { headParts: string[]; tailParts: string[] } | null {
  const parts = signIdBaseParts(signId)
  if (parts.length < 4) return null

  const deIdx = parts.length - 2
  if (normalizeToken(parts[deIdx]!) !== 'de') return null

  const verb = parts[parts.length - 1]!
  const verbNorm = normalizeToken(verb)
  if (
    !verbNorm ||
    FR_CATEGORY_SUFFIXES.has(verbNorm) ||
    FR_COUNTRIES.has(verbNorm) ||
    isStopWord(verb, 'fr')
  ) {
    return null
  }
  if (deIdx - 1 < 2) return null

  return {
    headParts: parts.slice(0, deIdx - 1),
    tailParts: parts.slice(deIdx - 1),
  }
}

function tailPhraseFromLabel(label: string, tailParts: string[]): string {
  const tailNorm = tailParts.map(normalizeToken)
  const rawParts = label.trim().split(/\s+/u).map(stripTokenPunctuation)
  let startIdx = rawParts.length

  for (let i = tailNorm.length - 1; i >= 0; i--) {
    startIdx--
    while (startIdx >= 0 && normalizeToken(rawParts[startIdx]!) !== tailNorm[i]) startIdx--
    if (startIdx < 0) break
  }

  if (startIdx >= 0) return rawParts.slice(startIdx).join(' ')
  return tailParts.map(decodeSignToken).join(' ')
}

function extractSynonymVerbalTailSenses(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  const split = getSynonymVerbalPhraseTail(signId)
  if (!split || lang !== 'fr') return null

  const senses: DictionarySense[] = []
  const seen = new Set<string>()

  for (const part of split.headParts) {
    const display = capitalizeWord(decodeSignToken(part))
    const lemma = normalizeToken(part)
    if (seen.has(lemma)) continue
    seen.add(lemma)
    senses.push({ word: display, lemma, senseKey: `${lemma}@${signId}`, signId })
  }

  const tailDisplay = formatPhraseDisplay(tailPhraseFromLabel(label, split.tailParts))
  const tailLemma = lemmaFromDisplay(tailDisplay, lang)
  if (!seen.has(tailLemma)) {
    senses.push({
      word: tailDisplay,
      lemma: tailLemma,
      senseKey: `${normalizeToken(tailDisplay)}@${signId}`,
      signId,
    })
  }

  return senses.length >= 3 ? senses : null
}

/** Liste de synonymes sans virgule (ex. avenir futur plus tard prochain). */
function isUnpunctuatedSynonymList(
  signId: string,
  signTokens: string[],
  content: string[],
  label: string,
  lang: Lang,
): boolean {
  if (lang !== 'fr' || /[,;]/.test(label)) return false
  const countMarker = getSynonymCountMarker(signId)
  if (countMarker !== null) return content.length === countMarker
  if (content.length < 3 || content.length > 6) return false
  if (hasVerbalPhrase(content)) return false
  if (getHeadOnlyTailFromSignId(signId)) return false
  if (isSynonymParaphraseSign(signId, content, label, lang)) return false
  if (hasPhraseConnector(signId, signTokens, lang)) return false
  const labelWords = labelContentWords(label, lang)
  if (labelWords.length !== content.length) return false
  for (let i = 0; i < content.length - 1; i++) {
    const a = normalizeToken(content[i]!)
    const b = normalizeToken(content[i + 1]!)
    if (i > 0 && isFrenchAdjective(content[i]!) && !isFrenchAdjective(content[i + 1]!)) return false
    if (i === 0 && FR_ADJECTIVE_HEADS.has(a)) return false
    if (content.length === 2 && FR_SPECIFIER_NOUNS.has(b) && !FR_SPECIFIER_NOUNS.has(a)) return false
  }
  return true
}

/** Classifie la structure sémantique d'un signe. */
export function classifySignStructure(signId: string, label: string, lang: Lang): SignStructure {
  const signTokens = stripTrailingVariantSuffix(splitSignId(signId), signId)
  const content = contentTokens(signTokens, lang, signId)
  const trimmed = label.trim()

  if (isNumericExpression(signId, trimmed)) return 'phrase'
  if (isReduplicatedCompound(signId)) return 'dedicated'
  if (content.length <= 1) return 'dedicated'
  if (isFlatSynonymListSign(signId, lang)) return 'synonym_list'
  if (isPrepositionalVerbList(signId, content, lang)) return 'synonym_list'
  if (isProperNameSign(signId, signTokens, content, trimmed, lang)) return 'phrase'
  if (getSynonymVerbalPhraseTail(signId)) return 'synonym_list'
  if (isApartirDeSynonymSign(signId, lang)) return 'synonym_list'
  if (getMultiVerbalPhraseSegments(signId, lang)) return 'synonym_list'
  if (hasVerbalPhrase(content)) return 'phrase'

  // Lieu + pays ou suffixe catégorie (ville, fruit…) — via sign_id
  if (getHeadOnlyTail(content, signId, lang)) return 'qualified_noun'

  if (/[,;]/.test(trimmed)) {
    if (isCompoundPhraseWithTrailingCommaTag(signId, signTokens, trimmed, lang)) return 'phrase'
    return 'synonym_list'
  }

  if (getSynonymDePhraseSplit(signId, lang)) return 'synonym_list'

  if (hasPhraseConnector(signId, signTokens, lang)) return 'phrase'

  if (content.length === 2) {
    const [a, b] = content
    const qualified = a && b ? getQualifiedNounKind(a, b, signId, lang) : null
    if (qualified) return 'qualified_noun'
    if (a && b && isTwoTokenPhrase(a, b, lang)) return 'phrase'
    return 'synonym_list'
  }

  // Expression nominale ≥ 3 mots — sauf listes de synonymes ou paraphrases
  if (content.length >= 3 && !hasVerbalPhrase(content)) {
    if (isSynonymParaphraseSign(signId, content, trimmed, lang)) return 'qualified_noun'
    if (isUnpunctuatedSynonymList(signId, signTokens, content, trimmed, lang)) return 'synonym_list'
    return 'phrase'
  }

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
  if (isCompoundPhraseWithTrailingCommaTag(signId, signTokens, label, lang)) {
    fromLabel = label.split(/[,;]/)[0]!.trim()
  }
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

  if (isReduplicatedCompound(signId)) {
    const display = reduplicatedDisplay(signId, trimmed)
    const lemma = normalizeToken(display)
    return [{ word: display, lemma, senseKey: `${lemma}@${signId}`, signId }]
  }

  const dedicatedCompound = extractDedicatedCompoundSenses(signId, lang)
  if (dedicatedCompound) return filterDictionarySenses(dedicatedCompound, signId)

  const flatSynonymSenses = extractFlatSynonymListSenses(signId, trimmed, lang)
  if (flatSynonymSenses) return filterDictionarySenses(flatSynonymSenses, signId)

  const signTokensEarly = stripTrailingVariantSuffix(splitSignId(signId), signId)
  const contentEarly = contentTokens(signTokensEarly, lang, signId)
  if (isSynonymParaphraseSign(signId, contentEarly, trimmed, lang)) {
    return extractSynonymParaphraseSenses(signId, trimmed, lang)
  }

  const apartirDeSenses = extractApartirDeSynonymSenses(signId, trimmed, lang)
  if (apartirDeSenses) return filterDictionarySenses(apartirDeSenses, signId)

  const dePhraseSenses = extractSynonymDePhraseSenses(signId, trimmed, lang)
  if (dePhraseSenses) return filterDictionarySenses(dePhraseSenses, signId)

  const multiVerbalSenses = extractMultiVerbalPhraseSynonymSenses(signId, trimmed, lang)
  if (multiVerbalSenses) return filterDictionarySenses(multiVerbalSenses, signId)

  const commaQuestions = extractCommaQuestionPhrases(signId, trimmed, lang)
  if (commaQuestions) return filterDictionarySenses(commaQuestions, signId)

  const finSenses = extractPrepositionalFinSenses(signId, trimmed, lang)
  if (finSenses) return filterDictionarySenses(finSenses, signId)

  const ovniSenses = extractOvniSenses(signId, lang)
  if (ovniSenses) return filterDictionarySenses(ovniSenses, signId)

  const asblSenses = extractAsblOrganizationSenses(signId, trimmed, lang)
  if (asblSenses) return filterDictionarySenses(asblSenses, signId)

  const properNameSenses = extractProperNameSenses(signId, trimmed, lang)
  if (properNameSenses) return filterDictionarySenses(properNameSenses, signId)

  const verbalTailSenses = extractSynonymVerbalTailSenses(signId, trimmed, lang)
  if (verbalTailSenses) return filterDictionarySenses(verbalTailSenses, signId)

  const prepVerbSenses = extractPrepositionalVerbSenses(signId, trimmed, lang)
  if (prepVerbSenses) return filterDictionarySenses(prepVerbSenses, signId)

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
      if (isSynonymParaphraseSign(signId, content, trimmed, lang)) {
        return filterDictionarySenses(extractSynonymParaphraseSenses(signId, trimmed, lang), signId)
      }
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

  if (/[,;]/.test(trimmed)) {
    return filterDictionarySenses(extractCommaSynonymListSenses(signId, trimmed, lang), signId)
  }

  const labelWords = labelContentWords(trimmed, lang)
  const out: DictionarySense[] = []
  const seen = new Set<string>()

  for (let j = 0; j < content.length; j++) {
    const token = content[j]!
    if (isSignVariantDigit(token, signId)) continue
    const raw = cleanWord(labelWords[j] ?? decodeSignToken(token), { allowNumeric: /\d/.test(trimmed) })
    if (!raw || isStopWord(raw, lang) || isDictionaryNoiseDigit(raw, signId)) continue
    if (isOrphanCountryToken(raw, signId) || isOrphanCategoryToken(raw, signId) || isSignCategoryMarker(raw, signId)) continue
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

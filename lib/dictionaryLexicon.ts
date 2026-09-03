/**
 * Lexique FR → EN/TR/PL pour aligner les dictionnaires sur la structure FR propre.
 * Construit depuis les labels 1:1, l’alignement multi-sens, et des règles numériques.
 */
import { SIGN_LABELS_FR, SIGN_LABELS_EN, SIGN_LABELS_TR, SIGN_LABELS_PL } from './signLabels'
import { extractDictionarySenses, normalizeLemma, semanticTranslationForSense, type Lang } from './dictionarySemantics'
import GENERATED_JSON from './generated/frSenseTranslations.json'

const GENERATED = GENERATED_JSON as Partial<Record<Exclude<Lang, 'fr'>, Record<string, string>>>

type Lexicon = Map<string, string>

const NUMBER_WORDS: Record<Lang, Record<string, string>> = {
  fr: {},
  en: {
    zero: 'Zero', un: 'One', deux: 'Two', trois: 'Three', quatre: 'Four', cinq: 'Five',
    six: 'Six', sept: 'Seven', huit: 'Eight', neuf: 'Nine', dix: 'Ten', onze: 'Eleven',
    douze: 'Twelve', treize: 'Thirteen', quatorze: 'Fourteen', quinze: 'Fifteen',
    seize: 'Sixteen', vingt: 'Twenty', trente: 'Thirty', quarante: 'Forty',
    cinquante: 'Fifty', soixante: 'Sixty', septante: 'Seventy', nonante: 'Ninety',
    cent: 'Hundred', mille: 'Thousand', million: 'Million',
    'dix sept': 'Seventeen', 'dix huit': 'Eighteen', 'dix neuf': 'Nineteen',
    'quatre vingts': 'Eighty', 'cent dix': 'One hundred ten',
  },
  tr: {
    zero: 'Sıfır', un: 'Bir', deux: 'İki', trois: 'Üç', quatre: 'Dört', cinq: 'Beş',
    six: 'Altı', sept: 'Yedi', huit: 'Sekiz', neuf: 'Dokuz', dix: 'On', onze: 'On bir',
    douze: 'On iki', treize: 'On üç', quatorze: 'On dört', quinze: 'On beş',
    seize: 'On altı', vingt: 'Yirmi', trente: 'Otuz', quarante: 'Kırk',
    cinquante: 'Elli', soixante: 'Altmış', septante: 'Yetmiş', nonante: 'Doksan',
    cent: 'Yüz', mille: 'Bin', million: 'Milyon',
    'dix sept': 'On yedi', 'dix huit': 'On sekiz', 'dix neuf': 'On dokuz',
    'quatre vingts': 'Seksen', 'cent dix': 'Yüz on',
  },
  pl: {
    zero: 'Zero', un: 'Jeden', deux: 'Dwa', trois: 'Trzy', quatre: 'Cztery', cinq: 'Pięć',
    six: 'Sześć', sept: 'Siedem', huit: 'Osiem', neuf: 'Dziewięć', dix: 'Dziesięć',
    onze: 'Jedenaście', douze: 'Dwanaście', treize: 'Trzynaście', quatorze: 'Czternaście',
    quinze: 'Piętnaście', seize: 'Szesnaście', vingt: 'Dwadzieścia', trente: 'Trzydzieści',
    quarante: 'Czterdzieści', cinquante: 'Pięćdziesiąt', soixante: 'Sześćdziesiąt',
    septante: 'Siedemdziesiąt', nonante: 'Dziewięćdziesiąt', cent: 'Sto', mille: 'Tysiąc',
    million: 'Milion', 'dix sept': 'Siedemnaście', 'dix huit': 'Osiemnaście',
    'dix neuf': 'Dziewiętnaście', 'quatre vingts': 'Osiemdziesiąt', 'cent dix': 'Sto dziesięć',
  },
}

const UNIT_WORDS: Record<Lang, Record<string, string>> = {
  fr: {},
  en: { heure: 'hour', heures: 'hours', an: 'year', ans: 'years', mois: 'months', semaine: 'week', semaines: 'weeks', jour: 'day', jours: 'days', minute: 'minute', minutes: 'minutes' },
  tr: { heure: 'saat', heures: 'saat', an: 'yıl', ans: 'yıl', mois: 'ay', semaine: 'hafta', semaines: 'hafta', jour: 'gün', jours: 'gün', minute: 'dakika', minutes: 'dakika' },
  pl: { heure: 'godzina', heures: 'godzin', an: 'rok', ans: 'lat', mois: 'miesięcy', semaine: 'tydzień', semaines: 'tygodni', jour: 'dzień', jours: 'dni', minute: 'minuta', minutes: 'minut' },
}

/** Phrases / mots fréquents absents des labels 1:1 — équivalents sémantiques. */
const CURATED: Record<Lang, Record<string, string>> = {
  fr: {},
  en: {
    'a bout': 'Exhausted', 'a cote': 'Beside', 'a fond': 'Thoroughly', 'a part ca': 'Apart from that',
    'a partir de': 'From', 'a pied': 'On foot', 'a present': 'Currently', 'a suivre': 'To be continued',
    'abces': 'Abscess', 'absent': 'Absent', 'accelerer': 'Accelerate', 'accepter': 'Accept',
    'acces': 'Access', 'accessibilite': 'Accessibility', 'accompagner': 'Accompany',
    'age': 'Age', 'agenda': 'Diary', 'agent': 'Agent', 'agressif': 'Aggressive',
    'agriculteur': 'Farmer', 'aider': 'Help', 'allemagne': 'Germany', 'allemand': 'German',
    'alphabet': 'Alphabet', 'ameliorer': 'Improve', 'amerique': 'America', 'an': 'Year',
    'anglais': 'English', 'angleterre': 'England', 'ans': 'Years', 'nul': 'Awful',
    'tres': 'Very', 'zero': 'Zero', 'depecher': 'Hurry', 'fort': 'Strong', 'rapide': 'Fast',
    'turbo': 'Turbo', 'vite': 'Quickly',
    'anniversaire': 'Birthday', 'heure': 'Hour', 'heures': 'Hours',
    'vieillir': 'Grow old', 'vieux': 'Old', 'aile': 'Wing', 'voler': 'Fly', 'oiseau': 'Bird',
    'a mon': 'My', 'a son': 'His/her', 'a ton': 'Your', 'a heures': "O'clock",
    'afin': 'In order to', 'ainsi': 'Thus', 'agathe': 'Agathe', 'addition': 'Addition',
    'accident vasculaire': 'Stroke', 'accoucher': 'Give birth', 'abattoir': 'Slaughterhouse',
    // Domaine IT / prépositions — sémantique, pas calque
    informatique: 'Computing', ordinateur: 'Computer', configuration: 'Settings',
    licence: 'License', pilote: 'Pilot', reseau: 'Network', serveur: 'Server',
    social: 'Social', restaurant: 'Restaurant', cafe: 'Cafe', avion: 'Airplane',
    sur: 'On', dans: 'In', presentiel: 'In person', etre: 'To be', circulation: 'Traffic',
    beaucoup: 'A lot', grand: 'Big', ouvrir: 'Open', cheveux: 'Hair',
    meilleur: 'Best', efficace: 'Effective', d: "D'",
    verser: 'To pour', fils: 'Son', ceinture: 'Belt',
    hasard: 'Chance', coincidence: 'Coincidence',
  },
  tr: {
    'a bout': 'Bitkin', 'a cote': 'Yanında', 'a fond': 'Tamamen', 'a part ca': 'Bunun dışında',
    'a partir de': 'İtibaren', 'a pied': 'Yaya', 'a present': 'Şu anda', 'a suivre': 'Devamı var',
    'abces': 'Apse', 'absent': 'Yok', 'accelerer': 'Hızlanmak', 'accepter': 'Kabul etmek',
    'acces': 'Erişim', 'accessibilite': 'Erişilebilirlik', 'accompagner': 'Eşlik etmek',
    'age': 'Yaş', 'agenda': 'Ajanda', 'agent': 'Ajan', 'agressif': 'Agresif',
    'agriculteur': 'Çiftçi', 'aider': 'Yardım etmek', 'allemagne': 'Almanya', 'allemand': 'Alman',
    'alphabet': 'Alfabe', 'ameliorer': 'İyileştirmek', 'amerique': 'Amerika', 'an': 'Yıl',
    'anglais': 'İngilizce', 'angleterre': 'İngiltere', 'ans': 'Yıl', 'nul': 'Berbat',
    'tres': 'Çok', 'zero': 'Sıfır', 'depecher': 'Acele etmek', 'fort': 'Güçlü', 'rapide': 'Hızlı',
    'turbo': 'Turbo', 'vite': 'Çabuk', 'vieillir': 'Yaşlanmak', 'vieux': 'Yaşlı',
    'anniversaire': 'Doğum günü', 'heure': 'Saat', 'heures': 'Saat',
    informatique: 'Bilişim', ordinateur: 'Bilgisayar', configuration: 'Yapılandırma',
    licence: 'Lisans', pilote: 'Pilot', reseau: 'Ağ', serveur: 'Sunucu',
    social: 'Sosyal', restaurant: 'Restoran', cafe: 'Kafe', avion: 'Uçak',
    sur: 'Üzerinde', dans: 'İçinde', presentiel: 'Yüz yüze', etre: 'Olmak', circulation: 'Trafik',
    beaucoup: 'Çok', grand: 'Büyük', ouvrir: 'Açmak', cheveux: 'Saç',
    meilleur: 'En iyi', efficace: 'Etkili',
    verser: 'Dökmek', fils: 'Oğul', ceinture: 'Kemer',
  },
  pl: {
    'a bout': 'Wyczerpany', 'a cote': 'Obok', 'a fond': 'Dogłębnie', 'a part ca': 'Poza tym',
    'a partir de': 'Od', 'a pied': 'Pieszo', 'a present': 'Obecnie', 'a suivre': 'Ciąg dalszy',
    'abces': 'Ropień', 'absent': 'Nieobecny', 'accelerer': 'Przyspieszać', 'accepter': 'Akceptować',
    'acces': 'Dostęp', 'accessibilite': 'Dostępność', 'accompagner': 'Towarzyszyć',
    'age': 'Wiek', 'agenda': 'Terminarz', 'agent': 'Agent', 'agressif': 'Agresywny',
    'agriculteur': 'Rolnik', 'aider': 'Pomagać', 'allemagne': 'Niemcy', 'allemand': 'Niemiecki',
    'alphabet': 'Alfabet', 'ameliorer': 'Ulepszać', 'amerique': 'Ameryka', 'an': 'Rok',
    'anglais': 'Angielski', 'angleterre': 'Anglia', 'ans': 'Lata', 'nul': 'Fatalny',
    'tres': 'Bardzo', 'zero': 'Zero', 'depecher': 'Śpieszyć się', 'fort': 'Silny', 'rapide': 'Szybki',
    'turbo': 'Turbo', 'vite': 'Szybko', 'vieillir': 'Starzeć się', 'vieux': 'Stary',
    'anniversaire': 'Urodziny', 'heure': 'Godzina', 'heures': 'Godziny',
    informatique: 'Informatyka', ordinateur: 'Komputer', configuration: 'Konfiguracja',
    licence: 'Licencja', pilote: 'Pilot', reseau: 'Sieć', serveur: 'Serwer',
    social: 'Społecznościowy', restaurant: 'Restauracja', cafe: 'Kawiarnia', avion: 'Samolot',
    sur: 'Na', dans: 'W', presentiel: 'Na żywo', etre: 'Być', circulation: 'Ruch',
    beaucoup: 'Dużo', grand: 'Duży', ouvrir: 'Otwierać', cheveux: 'Włosy',
    meilleur: 'Najlepszy', efficace: 'Skuteczny',
    verser: 'Lać', fils: 'Syn', ceinture: 'Pasek',
  },
}

const LABELS: Record<Exclude<Lang, 'fr'>, Record<string, string>> = {
  en: SIGN_LABELS_EN,
  tr: SIGN_LABELS_TR,
  pl: SIGN_LABELS_PL,
}

const cache: Partial<Record<Exclude<Lang, 'fr'>, Lexicon>> = {}

const FR_LEFTOVER_FORMS = new Set([
  'dans', 'en', 'et', 'etre', 'être', 'pas', 'que', 'qui', 'le', 'la', 'les', 'un', 'une',
  'de', 'du', 'des', 'au', 'aux', 'ne', 'se', 'ce', 'cette', 'ces', 'son', 'pour', 'a', 'à',
  'y', 'ou', 'par', 'sur', 'avec', 'sans', 'parmi', 'presentiel', 'présentiel', 'd', "d'",
])

function capitalizeDisplay(text: string): string {
  const t = text.trim()
  if (!t) return t
  if (/^\d/.test(t)) return t
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function translateNumericLemma(lemma: string, lang: Exclude<Lang, 'fr'>): string | null {
  if (/^\d+$/.test(lemma)) return lemma

  const m = lemma.match(/^(\d+)\s+(heure|heures|an|ans|mois|semaine|semaines|jour|jours|minute|minutes)$/)
  if (m) {
    const unit = UNIT_WORDS[lang][m[2]!] ?? m[2]!
    return `${m[1]} ${unit}`
  }

  const spelled = NUMBER_WORDS[lang][lemma]
  if (spelled) return spelled

  // « cent vingt », « deux mille »…
  const parts = lemma.split(/\s+/)
  if (parts.length >= 2 && parts.every((p) => NUMBER_WORDS[lang][p] || /^\d+$/.test(p))) {
    return parts.map((p) => NUMBER_WORDS[lang][p] ?? p).join(' ')
  }

  return null
}

function buildLexicon(lang: Exclude<Lang, 'fr'>): Lexicon {
  const map: Lexicon = new Map()
  const targetLabels = LABELS[lang]

  for (const [lemma, word] of Object.entries(CURATED[lang])) {
    map.set(lemma, word)
  }
  for (const [lemma, word] of Object.entries(NUMBER_WORDS[lang])) {
    if (!map.has(lemma)) map.set(lemma, word)
  }
  for (const [lemma, word] of Object.entries(GENERATED[lang] ?? {})) {
    if (!map.has(lemma) && word && !isGarbageTranslation(word)) map.set(lemma, word)
  }

  for (const [id, frLabel] of Object.entries(SIGN_LABELS_FR)) {
    const frSenses = extractDictionarySenses(id, frLabel, 'fr')
    const tLabel = targetLabels[id]
    if (!tLabel) continue

    if (frSenses.length === 1) {
      const lemma = frSenses[0]!.lemma
      if (!map.has(lemma) && !isGarbageTranslation(tLabel)) map.set(lemma, tLabel.trim())
      continue
    }

    const tSenses = extractDictionarySenses(id, tLabel, lang)
    if (tSenses.length === frSenses.length) {
      for (let i = 0; i < frSenses.length; i++) {
        const lemma = frSenses[i]!.lemma
        const word = tSenses[i]!.word
        if (!map.has(lemma) && !isGarbageTranslation(word)) map.set(lemma, word)
      }
      continue
    }

    const tokens = tLabel.replace(/[,;]/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
    if (tokens.length === frSenses.length) {
      for (let i = 0; i < frSenses.length; i++) {
        const lemma = frSenses[i]!.lemma
        const word = tokens[i]!
        if (!map.has(lemma) && !isBadZipFragment(lemma, word)) map.set(lemma, capitalizeDisplay(word))
      }
    }
  }

  return map
}

function isGarbageTranslation(value: string): boolean {
  return /veuillez|indiquer deux langues|&#\d+/i.test(value.trim())
}

/** Fragments de zip mot-à-mot (ex. « Etkili en iyi » → meilleur=en). */
function isBadZipFragment(frLemma: string, value: string): boolean {
  const v = value.trim()
  if (!v || isGarbageTranslation(v)) return true
  const vl = normalizeLemma(v)
  if (
    FR_LEFTOVER_FORMS.has(vl) &&
    !FR_LEFTOVER_FORMS.has(frLemma) &&
    !/\s/.test(v) &&
    v.length <= 3
  ) {
    return true
  }
  return false
}

export function getDictionaryLexicon(lang: Exclude<Lang, 'fr'>): Lexicon {
  if (!cache[lang]) cache[lang] = buildLexicon(lang)
  return cache[lang]!
}

function isUntranslatedFrenchLeftover(word: string, frWord: string): boolean {
  const w = word.trim()
  if (!w) return true
  if (/veuillez|indiquer deux langues|&#\d+|residential&#/i.test(w)) return true
  const lemma = normalizeLemma(w)
  if (FR_LEFTOVER_FORMS.has(lemma) && normalizeLemma(w) === normalizeLemma(frWord)) return true
  // Forme française inchangée pour un mot-outil
  if (FR_LEFTOVER_FORMS.has(lemma) && /[éèêëàâùûüôöîïç]/i.test(w)) return true
  return false
}

/** Prénom + nom (ou marque) : on conserve la forme internationale, pas les déclinaisons (Adolfa Hitlera…). */
function looksLikePersonOrBrandName(word: string): boolean {
  const parts = word.trim().split(/\s+/).filter(Boolean)
  if (parts.length < 2 || parts.length > 5) return false
  return parts.every((p) => {
    const n = normalizeLemma(p)
    if (n === 'van' || n === 'von' || n === 'de' || n === 'da' || n === 'di' || n === 'del') return true
    return /^[A-ZÀ-ŸÁĆĘŁŃÓŚŹŻİŞĞÜÖÇ]/u.test(p) && p.length >= 2
  })
}

/**
 * Traduit un sens FR vers la langue cible en préservant le sens
 * (maps sémantiques + lexique + règles), sans calquer bêtement le label machine.
 */
export function translateFrDictionarySense(
  frWord: string,
  frLemma: string,
  lang: Lang,
  signId?: string,
): string {
  if (lang === 'fr') return frWord

  if (signId) {
    const semantic = semanticTranslationForSense(signId, frWord, frLemma, lang)
    if (semantic && !isUntranslatedFrenchLeftover(semantic, frWord)) return semantic
  }

  // Noms de personnes / marques : garder la forme nominative internationale
  if (looksLikePersonOrBrandName(frWord)) {
    return frWord
  }

  const numeric = translateNumericLemma(frLemma, lang)
  if (numeric) return /^\d/.test(numeric) ? numeric : capitalizeDisplay(numeric)

  const lex = getDictionaryLexicon(lang)
  const hit = lex.get(frLemma)
  if (hit) {
    const display = capitalizeDisplay(hit)
    if (!isUntranslatedFrenchLeftover(display, frWord)) return display
  }

  // Acronymes / noms propres internationaux : on garde la forme
  if (
    /^(aka|avc|tgv|cv|jo|ok|ia|e-mail|email|sms|usb|wifi|post-it|atomium|mickey|disneyland|columbo|leopold|hainaut|mons|babel)$/i.test(
      frLemma,
    ) ||
    (/^[a-z]{2,4}$/i.test(frLemma) && frLemma === frLemma.toLowerCase() && !/[aeiouy]{3}/i.test(frLemma))
  ) {
    return capitalizeDisplay(frWord)
  }

  // Ne pas laisser un mot-outil FR tel quel dans EN/TR/PL
  if (FR_LEFTOVER_FORMS.has(frLemma) || FR_LEFTOVER_FORMS.has(normalizeLemma(frWord))) {
    return ''
  }

  return capitalizeDisplay(frWord)
}

export function lexiconCoverage(lang: Exclude<Lang, 'fr'>, frLemmas: string[]) {
  const lex = getDictionaryLexicon(lang)
  let hit = 0
  const missing: string[] = []
  for (const lemma of frLemmas) {
    if (lex.has(lemma) || translateNumericLemma(lemma, lang)) hit++
    else missing.push(lemma)
  }
  return { hit, missing, total: frLemmas.length }
}

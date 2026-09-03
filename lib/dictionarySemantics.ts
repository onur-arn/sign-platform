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

/** Pays / régions multi-mots : une seule entrée, libellés sémantiques par langue. */
const FR_COMPOUND_PLACE_SEQUENCES: { tokens: string[]; display: Record<Lang, string> }[] = [
  { tokens: ['afrique', 'du', 'sud'], display: { fr: 'Afrique du Sud', en: 'South Africa', tr: 'Güney Afrika', pl: 'Afryka Południowa' } },
  { tokens: ['amerique', 'du', 'sud'], display: { fr: 'Amerique du Sud', en: 'South America', tr: 'Güney Amerika', pl: 'Ameryka Południowa' } },
  { tokens: ['amerique', 'du', 'nord'], display: { fr: 'Amerique du Nord', en: 'North America', tr: 'Kuzey Amerika', pl: 'Ameryka Północna' } },
  { tokens: ['coree', 'du', 'sud'], display: { fr: 'Coree du Sud', en: 'South Korea', tr: 'Güney Kore', pl: 'Korea Południowa' } },
  { tokens: ['coree', 'du', 'nord'], display: { fr: 'Coree du Nord', en: 'North Korea', tr: 'Kuzey Kore', pl: 'Korea Północna' } },
  { tokens: ['irlande', 'du', 'nord'], display: { fr: 'Irlande du Nord', en: 'Northern Ireland', tr: 'Kuzey İrlanda', pl: 'Irlandia Północna' } },
  { tokens: ['arabie', 'saoudite'], display: { fr: 'Arabie saoudite', en: 'Saudi Arabia', tr: 'Suudi Arabistan', pl: 'Arabia Saudyjska' } },
  { tokens: ['bosnie', 'herzegovine'], display: { fr: 'Bosnie-Herzegovine', en: 'Bosnia and Herzegovina', tr: 'Bosna-Hersek', pl: 'Bośnia i Hercegowina' } },
  { tokens: ['costa', 'rica'], display: { fr: 'Costa Rica', en: 'Costa Rica', tr: 'Kosta Rika', pl: 'Kostaryka' } },
  { tokens: ['porto', 'rico'], display: { fr: 'Porto Rico', en: 'Puerto Rico', tr: 'Porto Riko', pl: 'Portoryko' } },
  { tokens: ['sri', 'lanka'], display: { fr: 'Sri Lanka', en: 'Sri Lanka', tr: 'Sri Lanka', pl: 'Sri Lanka' } },
  { tokens: ['el', 'salvador'], display: { fr: 'El Salvador', en: 'El Salvador', tr: 'El Salvador', pl: 'Salwador' } },
  { tokens: ['cap', 'vert'], display: { fr: 'Cap vert', en: 'Cape Verde', tr: 'Yeşil Burun Adaları', pl: 'Republika Zielonego Przylądka' } },
  { tokens: ['cote', 'd', 'rsquo', 'ivoire'], display: { fr: "Cote d'ivoire", en: 'Ivory Coast', tr: 'Fildişi Sahili', pl: 'Wybrzeże Kości Słoniowej' } },
  { tokens: ['cote', 'd', 'ivoire'], display: { fr: "Cote d'ivoire", en: 'Ivory Coast', tr: 'Fildişi Sahili', pl: 'Wybrzeże Kości Słoniowej' } },
  { tokens: ['royaume', 'uni'], display: { fr: 'Royaume uni', en: 'United Kingdom', tr: 'Birleşik Krallık', pl: 'Zjednoczone Królestwo' } },
  { tokens: ['pays', 'bas'], display: { fr: 'Pays bas', en: 'Netherlands', tr: 'Hollanda', pl: 'Holandia' } },
  { tokens: ['emirats', 'arabes', 'unis'], display: { fr: 'Emirats arabes unis', en: 'United Arab Emirates', tr: 'Birleşik Arap Emirlikleri', pl: 'Zjednoczone Emiraty Arabskie' } },
  { tokens: ['etats', 'unis'], display: { fr: 'Etats-Unis', en: 'United States', tr: 'Amerika Birleşik Devletleri', pl: 'Stany Zjednoczone' } },
  { tokens: ['nouvelle', 'zelande'], display: { fr: 'Nouvelle Zelande', en: 'New Zealand', tr: 'Yeni Zelanda', pl: 'Nowa Zelandia' } },
  { tokens: ['viet', 'nam'], display: { fr: 'Viet nam', en: 'Vietnam', tr: 'Vietnam', pl: 'Wietnam' } },
  { tokens: ['burkina', 'faso'], display: { fr: 'Burkina Faso', en: 'Burkina Faso', tr: 'Burkina Faso', pl: 'Burkina Faso' } },
  { tokens: ['birmanie', 'myanmar'], display: { fr: 'Birmanie', en: 'Myanmar', tr: 'Myanmar', pl: 'Mjanma' } },
  { tokens: ['hemisphere', 'sud'], display: { fr: 'Hemisphere sud', en: 'Southern Hemisphere', tr: 'Güney Yarımküre', pl: 'Półkula południowa' } },
  { tokens: ['hemisphere', 'nord'], display: { fr: 'Hemisphere nord', en: 'Northern Hemisphere', tr: 'Kuzey Yarımküre', pl: 'Półkula północna' } },
]

function matchCompoundPlaceParts(parts: string[], lang: Lang = 'fr'): { display: string } | null {
  const norm = parts.map(normalizeToken)
  for (const place of FR_COMPOUND_PLACE_SEQUENCES) {
    if (norm.length !== place.tokens.length) continue
    if (place.tokens.every((t, i) => t === norm[i])) {
      return { display: place.display[lang] ?? place.display.fr }
    }
  }
  return null
}

/** Entrées figées : sens équivalent par langue (pas de calque mot-à-mot). */
const SEMANTIC_SINGLE_BY_BASE: Record<string, Record<Lang, string>> = {
  plutot_mourir_que: {
    fr: 'Plutot mourir que',
    en: 'Rather die than',
    tr: 'Ölmektense',
    pl: 'Raczej umrzeć niż',
  },
  quand_meme: {
    fr: 'Quand meme',
    en: 'Anyway',
    tr: 'Yine de',
    pl: 'Tak czy inaczej',
  },
  la_bas: {
    fr: 'La bas',
    en: 'Over there',
    tr: 'Orada',
    pl: 'Tam',
  },
  fer_a_cheval_de_trait: {
    fr: 'Fer à cheval',
    en: 'Horseshoe',
    tr: 'Nal',
    pl: 'Podkowa',
  },
  fils_de_pute: {
    fr: 'Fils de pute',
    en: 'Son of a bitch',
    tr: 'Orospu çocuğu',
    pl: 'Sukinsyn',
  },
  koh_lanta: {
    fr: 'Koh Lanta',
    en: 'Koh Lanta',
    tr: 'Koh-Lanta',
    pl: 'Koh Lanta',
  },
  wi_fi: { fr: 'Wifi', en: 'Wifi', tr: 'Wifi', pl: 'Wifi' },
  t_shirt: { fr: 'T-shirt', en: 'T-shirt', tr: 'T-shirt', pl: 'T-shirt' },
  post_it: { fr: 'Post-it', en: 'Post-it', tr: 'Post-it', pl: 'Post-it' },
  s_rsquo_il_vous_plait_svp: {
    fr: "S'il vous plaît",
    en: 'Please',
    tr: 'Lütfen',
    pl: 'Proszę',
  },
  // Domaine informatique / réseau — un sens global, pas « bilgisayar » partout
  configuration_informatique: {
    fr: 'Configuration informatique',
    en: 'Computer setup',
    tr: 'Bilgisayar kurulumu',
    pl: 'Konfiguracja komputera',
  },
  configuration_parametre_de_ls: {
    fr: 'Configuration / parametre',
    en: 'Settings',
    tr: 'Ayarlar',
    pl: 'Ustawienia',
  },
  licence_informatique: {
    fr: 'Licence informatique',
    en: 'Software license',
    tr: 'Yazılım lisansı',
    pl: 'Licencja oprogramowania',
  },
  pilote_informatique: {
    fr: 'Pilote informatique',
    en: 'Driver',
    tr: 'Sürücü',
    pl: 'Sterownik',
  },
  reseau_informatique: {
    fr: 'Reseau informatique',
    en: 'Computer network',
    tr: 'Bilgisayar ağı',
    pl: 'Sieć komputerowa',
  },
  reseau_social: {
    fr: 'Reseau social',
    en: 'Social network',
    tr: 'Sosyal ağ',
    pl: 'Sieć społecznościowa',
  },
  serveur_informatique: {
    fr: 'Serveur informatique',
    en: 'Server',
    tr: 'Sunucu',
    pl: 'Serwer',
  },
  serveur_restaurant_ou_cafe: {
    fr: 'Serveur',
    en: 'Waiter',
    tr: 'Garson',
    pl: 'Kelner',
  },
  ordinateur_portable: {
    fr: 'Ordinateur portable',
    en: 'Laptop',
    tr: 'Dizüstü bilgisayar',
    pl: 'Laptop',
  },
  hockey_sur_glace: {
    fr: 'Hockey sur glace',
    en: 'Ice hockey',
    tr: 'Buz hokeyi',
    pl: 'Hokej na lodzie',
  },
  hockey_sur_gazon: {
    fr: 'Hockey sur gazon',
    en: 'Field hockey',
    tr: 'Çim hokeyi',
    pl: 'Hokej na trawie',
  },
  dans_interieur_parmi: {
    fr: 'Dans / interieur / parmi',
    en: 'Inside / among',
    tr: 'İçinde / arasında',
    pl: 'Wewnątrz / wśród',
  },
  en_presentiel_face_a: {
    fr: 'En presentiel',
    en: 'In person',
    tr: 'Yüz yüze',
    pl: 'Na żywo',
  },
  en_face_l_un_de_l_autre_face_a_face: {
    fr: 'Face a face',
    en: 'Face to face',
    tr: 'Yüz yüze',
    pl: 'Twarzą w twarz',
  },
  se_lever_3_se_reveiller_2: {
    fr: 'Se lever / se reveiller',
    en: 'Get up / wake up',
    tr: 'Kalkmak / uyanmak',
    pl: 'Wstać / obudzić się',
  },
  circulation_dans_les_deux_sens_2: {
    fr: 'Circulation dans les deux sens',
    en: 'Two-way traffic',
    tr: 'Çift yönlü trafik',
    pl: 'Ruch dwukierunkowy',
  },
  parler_dans_le_dos: {
    fr: 'Parler dans le dos',
    en: 'Talk behind someone\'s back',
    tr: 'Arkasından konuşmak',
    pl: 'Mówić za plecami',
  },
  s_rsquo_evanouir_tomber_dans_les_pommes: {
    fr: 'S\'evanouir / tomber dans les pommes',
    en: 'Faint',
    tr: 'Bayılmak',
    pl: 'Zemdleć',
  },
  partout_sur_le_corps: {
    fr: 'Partout sur le corps',
    en: 'All over the body',
    tr: 'Vücudun her yerinde',
    pl: 'Po całym ciele',
  },
}

/** Temps grammaticaux — termes linguistiques, pas la glose machine. */
const GRAMMAR_TENSE_BY_LANG: Record<string, Record<Lang, string>> = {
  plus_que_parfait: {
    fr: 'Plus-que-parfait',
    en: 'Pluperfect',
    tr: 'Mişli geçmiş',
    pl: 'Czas zaprzeszły',
  },
  futur_simple: {
    fr: 'Futur simple',
    en: 'Simple future',
    tr: 'Gelecek zaman (basit)',
    pl: 'Czas przyszły prosty',
  },
  futur_anterieur: {
    fr: 'Futur antérieur',
    en: 'Future perfect',
    tr: 'Gelecek zamanın hikâyesi',
    pl: 'Czas przyszły uprzedni',
  },
  passe_compose: {
    fr: 'Passé composé',
    en: 'Compound past',
    tr: 'Geçmiş zaman (yakın)',
    pl: 'Czas przeszły złożony',
  },
  passe_simple: {
    fr: 'Passé simple',
    en: 'Simple past (literary)',
    tr: 'Belirli geçmiş',
    pl: 'Czas przeszły prosty',
  },
  passe_anterieur: {
    fr: 'Passé antérieur',
    en: 'Past anterior',
    tr: 'Mişli geçmişin hikâyesi',
    pl: 'Czas przeszły uprzedni',
  },
  imparfait: {
    fr: 'Imparfait',
    en: 'Imperfect',
    tr: 'Şimdiki zamanın hikâyesi',
    pl: 'Czas przeszły niedokonany',
  },
}

/**
 * Listes de synonymes / co-sens : équivalents sémantiques par langue.
 * (évite les calques du type « Date of that when when conjunction »)
 */
const SEMANTIC_SYNONYM_LISTS: Record<string, Record<Lang, string[]>> = {
  date_des_que_lorsque_quand_conjonction: {
    fr: ['Dès que', 'Lorsque', 'Quand'],
    en: ['As soon as', 'When', 'Whenever'],
    tr: ['Olur olmaz', 'İken', 'Ne zaman'],
    pl: ['Jak tylko', 'Gdy', 'Kiedy'],
  },
  ne_pas_aimer_detester_3: {
    fr: ['Ne pas aimer', 'Detester'],
    en: ['Dislike', 'Hate'],
    tr: ['Sevmemek', 'Nefret etmek'],
    pl: ['Nie lubić', 'Nienawidzić'],
  },
  ne_pas_avoir_peur: {
    fr: ['Ne pas avoir peur'],
    en: ['Not be afraid'],
    tr: ['Korkmamak'],
    pl: ['Nie bać się'],
  },
  ne_pas_avoir_peur_1_trop_facile: {
    fr: ['Ne pas avoir peur'],
    en: ['Not be afraid'],
    tr: ['Korkmamak'],
    pl: ['Nie bać się'],
  },
  ne_pas_comprendre_tout: {
    fr: ['Ne pas comprendre tout'],
    en: ['Not understand everything'],
    tr: ['Her şeyi anlamamak'],
    pl: ['Nie rozumieć wszystkiego'],
  },
  ne_pas_etre_capable_de_faire: {
    fr: ['Ne pas etre capable de faire'],
    en: ['Be unable to do'],
    tr: ['Yapamamak'],
    pl: ['Nie potrafić'],
  },
  ne_pas_finir_pas_encore: {
    fr: ['Ne pas finir', 'Pas encore'],
    en: ['Not finish', 'Not yet'],
    tr: ['Bitirmemek', 'Henüz değil'],
    pl: ['Nie kończyć', 'Jeszcze nie'],
  },
  ignorer_ne_pas_savoir: {
    fr: ['Ignorer', 'Ne pas savoir'],
    en: ['Ignore', 'Not know'],
    tr: ['Görmezden gelmek', 'Bilmemek'],
    pl: ['Ignorować', 'Nie wiedzieć'],
  },
  aile_s_rsquo_envoler_voler_oiseau: {
    fr: ['Aile', "S'envoler", 'Voler', 'Oiseau'],
    en: ['Wing', 'Take off', 'Fly', 'Bird'],
    tr: ['Kanat', 'Havalanmak', 'Uçmak', 'Kuş'],
    pl: ['Skrzydło', 'Odlatywać', 'Latać', 'Ptak'],
  },
  chaise_s_rsquo_asseoir: {
    fr: ['Chaise', "S'asseoir"],
    en: ['Chair', 'Sit down'],
    tr: ['Sandalye', 'Oturmak'],
    pl: ['Krzesło', 'Siadać'],
  },
  bagarre_se_battre: {
    fr: ['Bagarre', 'Se battre'],
    en: ['Brawl', 'Fight'],
    tr: ['Kavga', 'Dövüşmek'],
    pl: ['Bójka', 'Bić się'],
  },
  balader_se_promener: {
    fr: ['Balader', 'Se promener'],
    en: ['Stroll', 'Walk'],
    tr: ['Gezinmek', 'Yürümek'],
    pl: ['Przechadzać się', 'Spacerować'],
  },
  informatique_ordinateur: {
    fr: ['Informatique', 'Ordinateur'],
    en: ['Computing', 'Computer'],
    tr: ['Bilişim', 'Bilgisayar'],
    pl: ['Informatyka', 'Komputer'],
  },
  pilote_d_rsquo_avion: {
    fr: ['Pilote', 'Avion'],
    en: ['Pilot', 'Airplane'],
    tr: ['Pilot', 'Uçak'],
    pl: ['Pilot', 'Samolot'],
  },
  d_accord: {
    fr: ["D'accord"],
    en: ['OK / Agreed'],
    tr: ['Tamam'],
    pl: ['Zgoda'],
  },
  patins_a_glace_patins_a_roulettes_1: {
    fr: ['Patins a glace', 'Patins a roulettes'],
    en: ['Ice skates', 'Roller skates'],
    tr: ['Buz pateni', 'Tekerlekli paten'],
    pl: ['Łyżwy', 'Wrotki'],
  },
  proteger_quelqu_rsquo_un_d_rsquo_autre: {
    fr: ["Proteger quelqu'un", "D'autre"],
    en: ['Protect someone', 'Someone else'],
    tr: ['Birini korumak', 'Başka biri'],
    pl: ['Chronić kogoś', 'Ktoś inny'],
  },
}

function sensesFromWords(signId: string, words: string[]): DictionarySense[] {
  return words.map((word) => {
    const lemma = normalizeToken(word)
    return { word, lemma, senseKey: `${lemma}@${signId}`, signId }
  })
}

function extractSemanticSynonymListSenses(
  signId: string,
  lang: Lang,
): DictionarySense[] | null {
  const base = signId.replace(/_\d+$/, '')
  const byLang = SEMANTIC_SYNONYM_LISTS[signId] ?? SEMANTIC_SYNONYM_LISTS[base]
  if (!byLang) return null
  const words = byLang[lang] ?? byLang.fr
  if (!words || words.length === 0) return null
  return sensesFromWords(signId, words)
}

/** Traduction sémantique d’un sens FR pour une langue cible (maps dédiées). */
export function semanticTranslationForSense(
  signId: string,
  frWord: string,
  frLemma: string,
  lang: Lang,
): string | null {
  if (lang === 'fr') return frWord
  const base = signId.replace(/_\d+$/, '')

  const place = matchCompoundPlaceParts(base.split('_').filter(Boolean), lang)
  if (place) {
    const frPlace = matchCompoundPlaceParts(base.split('_').filter(Boolean), 'fr')
    if (frPlace && normalizeLemma(frPlace.display) === frLemma) return place.display
  }

  const single = SEMANTIC_SINGLE_BY_BASE[base]
  if (single) {
    const frDisplay = single.fr
    if (normalizeLemma(frDisplay) === frLemma || normalizeLemma(frWord) === normalizeLemma(frDisplay)) {
      return single[lang] ?? single.fr
    }
  }

  if (/^s_rsquo_il_vous_plait/.test(base)) {
    return SEMANTIC_SINGLE_BY_BASE.s_rsquo_il_vous_plait_svp?.[lang] ?? null
  }

  if (signId.endsWith('_temps_de_l_indicatif')) {
    const tenseId = signId.slice(0, -'_temps_de_l_indicatif'.length)
    return GRAMMAR_TENSE_BY_LANG[tenseId]?.[lang] ?? null
  }

  const lists = SEMANTIC_SYNONYM_LISTS[signId] ?? SEMANTIC_SYNONYM_LISTS[base]
  if (lists) {
    const frList = lists.fr
    const idx = frList.findIndex(
      (w) => normalizeLemma(w) === frLemma || normalizeLemma(w) === normalizeLemma(frWord),
    )
    if (idx >= 0) {
      const localized = lists[lang] ?? lists.fr
      return localized[idx] ?? null
    }
  }

  return null
}

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
  ['afrique', 'du', 'sud'],
  ['amerique', 'du', 'sud'],
  ['amerique', 'du', 'nord'],
  ['coree', 'du', 'sud'],
  ['coree', 'du', 'nord'],
  ['irlande', 'du', 'nord'],
  ['nouvelle', 'zelande'],
  ['el', 'salvador'],
  ['cap', 'vert'],
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
  ['quand', 'meme'],
  ['des', 'que'],
  ['wi', 'fi'],
  ['t', 'shirt'],
  ['post', 'it'],
  ['koh', 'lanta'],
  ['costa', 'rica'],
  ['porto', 'rico'],
  ['sri', 'lanka'],
  ['el', 'salvador'],
  ['cap', 'vert'],
  ['royaume', 'uni'],
  ['pays', 'bas'],
  ['nouvelle', 'zelande'],
  ['viet', 'nam'],
  ['burkina', 'faso'],
  ['arabie', 'saoudite'],
  ['bosnie', 'herzegovine'],
  ['hemisphere', 'sud'],
  ['hemisphere', 'nord'],
]

/** Groupes figés dans les listes de synonymes (sign_id → un segment chacun). */
const FR_SYNONYM_GROUP_SEQUENCES: string[][] = [
  ['ne', 'pas', 'faire', 'savoir'],
  ['ne', 'pas', 'voir', 'directement'],
  ['ne', 'pas', 'montrer'],
  ['ne', 'pas'],
  ['n', 'rsquo', 'importe'],
  ['n', 'rsquo', 'est'],
  ['n', 'rsquo', 'en'],
  ['n', 'en'],
  ['s', 'rsquo', 'il', 'vous', 'plait'],
  ['s', 'rsquo', 'envoler'],
  ['s', 'rsquo', 'asseoir'],
  ['s', 'rsquo', 'efforcer'],
  ['s', 'rsquo', 'appeler'],
  ['s', 'rsquo', 'entailler'],
  ['s', 'rsquo', 'evanouir'],
  ['koh', 'lanta'],
  ['fils', 'de', 'pute'],
  ['va', 'te', 'faire', 'foutre'],
  ['travailleuse', 'du', 'sexe'],
  ['il', 'n', 'rsquo', 'y', 'a', 'pas'],
  ['il', 'n', 'y', 'a', 'pas'],
  ['il', 'y', 'a'],
  ['s', 'rsquo', 'y'],
  ['s', 'y'],
  ['ca', 'y', 'est'],
  ['y', 'aller'],
  ['y', 'compris'],
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
  ['d', 'rsquo', 'eau'],
  ['d', 'eau'],
  ['courrier', 'electronique'],
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
  ['en', 'largeur'],
  ['en', 'hauteur'],
  ['en', 'longueur'],
  ['en', 'profondeur'],
  ['en', 'epaisseur'],
  ['il', 'etait', 'une', 'fois'],
  ['quelqu', 'rsquo', 'un', 'd', 'rsquo', 'autre'],
  ['quelqu', 'un', 'd', 'rsquo', 'autre'],
  ['quelqu', 'rsquo', 'un'],
  ['quelqu', 'un'],
  ['d', 'rsquo', 'un'],
  ['d', 'rsquo', 'une'],
  ['d', 'un'],
  ['d', 'une'],
  ['c', 'est', 'a', 'dire', 'que'],
  ['c', 'est'],
  ['il', 's', 'agit', 'de'],
  ['s', 'agit', 'de'],
  ['a', 'part', 'ca'],
  ['tout', 'juste'],
  ['tous', 'les', 'ans'],
  ['tous', 'les', 'mois'],
  ['une', 'fois', 'par', 'mois'],
  ['une', 'fois', 'par', 'an'],
  ['une', 'fois', 'par', 'semaine'],
  ['fois', 'par', 'mois'],
  ['face', 'a', 'face'],
  ['a', 'cause', 'de'],
  ['a', 'bout'],
  ['a', 'fond'],
  ['rien', 'a', 'faire'],
  ['mettre', 'a', 'jour'],
  ['mise', 'a', 'jour'],
  ['plutot', 'mourir', 'que'],
  ['plus', 'que', 'parfait'],
  ['futur', 'simple'],
  ['futur', 'anterieur'],
  ['passe', 'compose'],
  ['passe', 'simple'],
  ['passe', 'anterieur'],
  ['des', 'que'],
  ['quand', 'meme'],
]

/** Adjectifs de taille — tête générique avant une variante « en largeur/hauteur… ». */
const FR_SIZE_ADJECTIVE_HEADS = new Set([
  'petit', 'grand', 'gros', 'long', 'court', 'etroit', 'large', 'haut', 'bas', 'mince', 'epais',
])

/** Noms de dimension après « en » (petit en largeur, grand en hauteur…). */
const FR_DIMENSION_NOUNS = new Set([
  'largeur', 'hauteur', 'longueur', 'profondeur', 'epaisseur',
])

const FR_SIZE_INTENSIFIERS = new Set(['vraiment', 'tres', 'trop', 'bien', 'assez', 'fort', 'plutot'])

/** Connecteurs qui ne sont pas des entrées (ex. energie vitalite ou force). */
const FR_SYNONYM_LIST_NOISE = new Set(['et', 'ou'])

/** Tags en fin de sign_id, pas des synonymes (ex. travailler après boulot emploi…). */
const FR_SYNONYM_TRAILING_SKIP = new Set(['utiliser', 'travailler', 'frontiere', 'ca'])

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

/** Faux infinitifs en -re (ex. autre ≠ verbe). */
const FR_FALSE_INFINITIVES = new Set([
  'autre', 'notre', 'votre', 'centre', 'titre', 'lettre', 'fenetre', 'coffre', 'ordre', 'cadre', 'genre',
  'arbre', 'sucre', 'beurre', 'poivre', 'verre', 'pierre', 'guerre', 'terre',
  // Noms propres / patronymes en -er
  'hitler', 'foster', 'wagner', 'miller', 'baker', 'turner', 'parker', 'carter', 'cooper',
])

/** Infinitif français (ex. echouer, gronder, rater). */
function isFrenchInfinitive(token: string): boolean {
  const n = normalizeToken(token)
  if (n.length < 5) return false
  if (FR_NAME_PARTICLES.has(n)) return false
  if (FR_FALSE_INFINITIVES.has(n)) return false
  // -aire = adjectif (dentaire), pas infinitif (-re)
  if (/aire$/.test(n)) return false
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
  // « Adolf + Hitler » : -er ≠ infinitif si les deux tokens sont des noms propres
  if (
    parts.length === 2 &&
    isNounInfinitiveSynonymPair(parts[0]!, parts[1]!, lang) &&
    !(isNameLikeToken(parts[0]!) && isNameLikeToken(parts[1]!))
  ) {
    return false
  }

  if (parts.length >= 2 && parts.length <= 4) {
    return parts.every(isNameLikeToken)
  }

  return false
}

function extractProperNameSenses(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  const signTokens = stripTrailingVariantSuffix(splitSignId(signId), signId)
  const content = contentTokens(signTokens, lang, signId)
  if (!isProperNameSign(signId, signTokens, content, label, lang)) return null

  // Capitaliser chaque segment du nom (Adolf Hitler, non « Adolf hitler »)
  const display = label
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .map((w) => capitalizeWord(w))
    .join(' ')
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
    'a', 'à', 'au', 'aux', 'c', 'ca', 'ce', 'cet', 'cette', 'ces', 'd', 'dans', 'de', 'des', 'du', 'en', 'l', 'la',
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
    if (
      n0 === 'plutot' &&
      normalizeToken(merged[i + 1] ?? '') === 'mourir' &&
      normalizeToken(merged[i + 2] ?? '') === 'que'
    ) {
      out.push([merged[i], merged[i + 1], merged[i + 2]].join(' '))
      i += 2
      continue
    }
    if (
      n0 === 'plus' &&
      normalizeToken(merged[i + 1] ?? '') === 'que' &&
      normalizeToken(merged[i + 2] ?? '') === 'parfait'
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
    if (t === 'c' && raw[i + 1] === 'est') {
      out.push("c'est")
      i++
      continue
    }
    if (t === 'il' && raw[i + 1] === 'y' && raw[i + 2] === 'a') {
      out.push('il y a')
      i += 2
      continue
    }
    if (t === 's' && raw[i + 1] === 'rsquo' && raw[i + 2] === 'y') {
      out.push("s'y")
      i += 2
      continue
    }
    if (t === 's' && raw[i + 1] === 'y') {
      out.push("s'y")
      i++
      continue
    }
    if (t === 'quelqu' && raw[i + 1] === 'un') {
      out.push("quelqu'un")
      i++
      continue
    }
    if (t === 'quelqu' && raw[i + 1] === 'rsquo' && raw[i + 2] === 'un') {
      out.push("quelqu'un")
      i += 2
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
    // « il y a 4 ans / 2 mois » — durée, pas un compteur de synonymes
    if (
      normalizeToken(parts[i - 1] ?? '') === 'a' &&
      normalizeToken(parts[i - 2] ?? '') === 'y' &&
      FR_DURATION_UNITS.has(normalizeToken(parts[i + 1] ?? ''))
    ) {
      continue
    }
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

/** Particules inutiles seules (« N », « Ne », « S », « Se ») — pas des entrées dictionnaire. */
function isBareCliticParticle(word: string): boolean {
  const n = normalizeToken(word)
  if (n === 'n' || n === 'ne' || n === 's' || n === 'se') return true
  // fragments réfléchis incomplets
  if (n === "s'est" || n === 's est') return true
  if (/^s['']envoyer en$/.test(n)) return true
  // lettre isolée issue d'un composé (T de t-shirt, G de gramme g…) — pas le signe alphabet dédié
  if (/^[a-z]$/.test(n)) return true
  return false
}

/** Prépositions / mots-outils orphelins extraits d’un composé (ex. « sur » dans hockey_sur_glace). */
const ORPHAN_FUNCTION_WORDS = new Set([
  'sur', 'dans', 'en', 'de', 'du', 'des', 'a', 'au', 'aux', 'par', 'pour', 'avec', 'sans',
  'chez', 'entre', 'parmi', 'sous', 'vers', 'et', 'ou', 'que', 'qui', 'ne', 'pas',
  'le', 'la', 'les', 'un', 'une', 'ce', 'cette', 'ces', 'se', 'y', 'd', 'l',
])

function isOrphanFunctionWord(word: string, signId: string): boolean {
  const n = normalizeToken(word)
  if (!ORPHAN_FUNCTION_WORDS.has(n)) return false
  const parts = signIdBaseParts(signId).filter((p) => !/^\d+$/.test(p) && normalizeToken(p) !== 'rsquo')
  if (parts.length <= 1) return false
  const head = normalizeToken(parts[0] ?? '')
  // garder le signe dédié (sur_1, dans_… court) si la tête EST le mot-outil
  if (parts.length <= 2 && (head === n || head === `d ${n}` || head === `l ${n}`)) return false
  return true
}

function filterDictionarySenses(senses: DictionarySense[], signId: string): DictionarySense[] {
  return senses.filter(
    (s) =>
      !isDictionaryNoiseDigit(s.word, signId) &&
      !isBareCliticParticle(s.word) &&
      !isOrphanFunctionWord(s.word, signId),
  )
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
    .replace(/d'un\b/gi, 'd_un')
    .replace(/d'une\b/gi, 'd_une')
    .replace(/d'autre\b/gi, 'd_autre')
    .replace(/d'eau\b/gi, 'd_eau')
    .replace(/s'envoler/gi, "s'envoler")
    .replace(/quelqu'un/gi, "quelqu'un")
    .split(/\s+/u)
    .filter(Boolean)
    .map((t) =>
      t
        .replace(/^d_un$/i, "d'un")
        .replace(/^d_une$/i, "d'une")
        .replace(/^d_autre$/i, "d'autre")
        .replace(/^d_eau$/i, "d'eau"),
    )
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
      // Garder d'un / d'une / d'autre / d'eau comme unités sémantiques
      if (/^d'/i.test(w) && !/^d'(un|une|autre|eau|accord|avis)\b/i.test(w)) w = w.slice(2)
      if (/^s'/i.test(w) && !/^s'il\b/i.test(w)) w = w.slice(2)
    }
    const cleaned = cleanWord(w, { allowNumeric })
    if (!cleaned || isStopWord(cleaned, lang)) continue
    words.push(cleaned)
  }
  return words
}

/** Mots de nombre français (quatre cents, cent dix, quatre-vingts…). */
const FR_NUMBER_WORDS = new Set([
  'zero', 'un', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
  'vingt', 'vingts', 'trente', 'quarante', 'cinquante', 'soixante',
  'septante', 'huitante', 'octante', 'nonante',
  'cent', 'cents', 'mille', 'milles', 'million', 'millions', 'milliard', 'milliards',
])

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
  if (isSpelledNumberSign(signId)) return true
  return false
}

function isSpelledNumberParts(parts: string[]): boolean {
  if (parts.length === 0) return false
  return parts.every((p) => FR_NUMBER_WORDS.has(normalizeToken(p)))
}

/** Nombre en lettres (quatre_cents, cent_dix…) avec ou sans chiffre en tête du sign_id. */
function isSpelledNumberSign(signId: string): boolean {
  const base = signId.replace(/_\d+$/, '')
  const parts = base.split('_').filter(Boolean)
  if (parts.length === 0) return false
  if (/^[0-9]+$/.test(parts[0]!)) {
    const rest = parts.slice(1)
    if (rest.length === 0) return false
    // 2_mois, 10_heures… = durée/heure, pas un nom de nombre
    if (rest.length === 1 && FR_DURATION_UNITS.has(normalizeToken(rest[0]!))) return false
    if (rest.some((p) => /^(heures?|h)$/i.test(p))) return false
    return isSpelledNumberParts(rest)
  }
  return parts.length >= 2 && isSpelledNumberParts(parts)
}

function spelledNumberDisplay(signId: string, label: string): string {
  const trimmed = label.trim().replace(/^\d+\s+/, '')
  if (trimmed && !/^\d+$/.test(trimmed)) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
  }
  const base = signId.replace(/_\d+$/, '')
  const parts = base.split('_').filter((p) => !/^[0-9]+$/.test(p))
  const joined = parts.map(decodeSignToken).join(' ')
  return joined.charAt(0).toUpperCase() + joined.slice(1)
}

/**
 * ex. 400_quatre_cents → « 400 » · « Quatre cents »
 * (chiffre + expression en lettres, pas Quatre | Cents séparés).
 */
function extractNumericDualSenses(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  if (lang !== 'fr' || !isSpelledNumberSign(signId)) return null

  const base = signId.replace(/_\d+$/, '')
  const parts = base.split('_').filter(Boolean)
  const written = spelledNumberDisplay(signId, label)
  const writtenLemma = normalizeToken(written)
  if (!writtenLemma) return null

  const senses: DictionarySense[] = []
  if (/^[0-9]+$/.test(parts[0]!)) {
    const digit = parts[0]!
    senses.push({
      word: digit,
      lemma: digit,
      senseKey: `${digit}@${signId}`,
      signId,
    })
  }
  senses.push({
    word: written,
    lemma: writtenLemma,
    senseKey: `${writtenLemma}@${signId}`,
    signId,
  })
  return senses.length > 0 ? senses : null
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

/** Noms courants finissant en -ois/-ais/-ue confondus avec des adjectifs (ex. mois ≠ moisissure). */
const FR_NOUN_NOT_ADJECTIVE = new Set([
  'mois', 'fois', 'pays', 'bois', 'poids', 'repas', 'coque', 'lorsque',
])

const FR_COLOR_ADJECTIVES = new Set([
  'rouge', 'jaune', 'blanc', 'noir', 'vert', 'bleu', 'gris', 'rose', 'brun', 'violet', 'orange',
])

function isFrenchAdjective(token: string): boolean {
  const n = normalizeToken(token)
  if (FR_COLOR_ADJECTIVES.has(n)) return true
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
  if (norm[0] === 'il' && norm[1] === 'y' && norm[2] === 'a') {
    return 'il y a'
  }
  if (norm[0] === 's' && (norm[1] === 'rsquo' ? norm[2] === 'y' : norm[1] === 'y')) {
    const hasRsquo = norm[1] === 'rsquo'
    const rest = seq.slice(hasRsquo ? 3 : 2)
    if (rest.length === 0) return "s'y"
    return `s'y ${rest.map(decodeSignToken).join(' ')}`
  }
  if (norm[0] === 'ca' && norm[1] === 'y' && norm[2] === 'est') {
    return 'ca y est'
  }
  if (norm[0] === 'y' && norm[1] === 'aller') return 'y aller'
  if (norm[0] === 'y' && norm[1] === 'compris') return 'y compris'
  if (norm[0] === 'chute' && norm[1] === 'd' && norm[2] === 'rsquo') {
    return `chute d'${decodeSignToken(seq[3]!)}`
  }
  if (norm[0] === 'bras' && norm[1] === 'd' && norm[2] === 'rsquo') {
    return `bras d'${decodeSignToken(seq[3]!)}`
  }
  if (norm[0] === 'd' && norm[1] === 'rsquo' && norm[2] === 'eau') {
    return "d'eau"
  }
  if (norm[0] === 'd' && norm[1] === 'eau') {
    return "d'eau"
  }
  if (norm[0] === 'd' && norm[1] === 'rsquo' && (norm[2] === 'un' || norm[2] === 'une')) {
    return `d'${decodeSignToken(seq[2]!)}`
  }
  if (norm[0] === 'd' && (norm[1] === 'un' || norm[1] === 'une')) {
    return `d'${decodeSignToken(seq[1]!)}`
  }
  if (norm[0] === 'il' && norm[1] === 'etait' && norm[2] === 'une' && norm[3] === 'fois') {
    return 'il etait une fois'
  }
  if (norm[0] === 'c' && norm[1] === 'est' && norm[2] === 'a' && norm[3] === 'dire' && norm[4] === 'que') {
    return "c'est-a-dire que"
  }
  if (norm[0] === 'plutot' && norm[1] === 'mourir' && norm[2] === 'que') {
    return 'plutot mourir que'
  }
  if (norm[0] === 'plus' && norm[1] === 'que' && norm[2] === 'parfait') {
    return 'plus-que-parfait'
  }
  if (norm[0] === 'des' && norm[1] === 'que') {
    return 'des que'
  }
  if (norm[0] === 'quand' && norm[1] === 'meme') {
    return 'quand meme'
  }
  if (norm[0] === 'ne' && norm[1] === 'pas') {
    const rest = seq.slice(2)
    return rest.length ? `ne pas ${rest.map(decodeSignToken).join(' ')}` : 'ne pas'
  }
  if (norm[0] === 'n' && norm[1] === 'rsquo' && norm[2] === 'importe') {
    return "n'importe"
  }
  if (norm[0] === 'n' && norm[1] === 'rsquo' && norm[2] === 'est') {
    return "n'est"
  }
  if (norm[0] === 'n' && norm[1] === 'rsquo' && norm[2] === 'en') {
    return "n'en"
  }
  if (norm[0] === 'n' && norm[1] === 'en') {
    return "n'en"
  }
  if (norm[0] === 's' && norm[1] === 'rsquo' && norm[2] === 'il' && norm[3] === 'vous' && norm[4] === 'plait') {
    return "s'il vous plait"
  }
  if (norm[0] === 's' && norm[1] === 'rsquo' && norm[2]) {
    return `s'${decodeSignToken(seq[2]!)}`
  }
  if (norm[0] === 's' && norm[1] && norm[1] !== 'rsquo' && norm[1] !== 'y' && norm[1] !== 'en') {
    return `s'${decodeSignToken(seq[1]!)}`
  }
  if (norm[0] === 'c' && norm[1] === 'est') {
    return "c'est"
  }
  if (norm[0] === 'il' && norm[1] === 's' && norm[2] === 'agit' && norm[3] === 'de') {
    return "il s'agit de"
  }
  if (norm[0] === 's' && norm[1] === 'agit' && norm[2] === 'de') {
    return "s'agit de"
  }
  if (norm[0] === 'a' && norm[1] === 'part' && norm[2] === 'ca') {
    return 'a part ca'
  }
  if (norm[0] === 'tous' && norm[1] === 'les' && (norm[2] === 'ans' || norm[2] === 'mois')) {
    return `tous les ${decodeSignToken(seq[2]!)}`
  }
  if (norm[0] === 'une' && norm[1] === 'fois' && norm[2] === 'par' && FR_DURATION_UNITS.has(norm[3] ?? '')) {
    return `une fois par ${decodeSignToken(seq[3]!)}`
  }
  if (norm[0] === 'fois' && norm[1] === 'par' && FR_DURATION_UNITS.has(norm[2] ?? '')) {
    return `fois par ${decodeSignToken(seq[2]!)}`
  }
  if (norm[0] === 'face' && norm[1] === 'a' && norm[2] === 'face') {
    return 'face a face'
  }
  if (norm[0] === 'a' && norm[1] === 'cause' && norm[2] === 'de') {
    return 'a cause de'
  }
  if (norm[0] === 'a' && (norm[1] === 'bout' || norm[1] === 'fond')) {
    return `a ${decodeSignToken(seq[1]!)}`
  }
  if (norm[0] === 'rien' && norm[1] === 'a' && norm[2] === 'faire') {
    return 'rien a faire'
  }
  if ((norm[0] === 'mettre' || norm[0] === 'mise') && norm[1] === 'a' && norm[2] === 'jour') {
    return `${decodeSignToken(seq[0]!)} a jour`
  }
  if (norm[0] === 'tout' && norm[1] === 'juste') {
    return 'tout juste'
  }
  if (norm[0] === 'quelqu' && (norm[1] === 'rsquo' ? norm[2] === 'un' : norm[1] === 'un')) {
    const hasRsquo = norm[1] === 'rsquo'
    const rest = seq.slice(hasRsquo ? 3 : 2)
    if (
      rest.length >= 2 &&
      normalizeToken(rest[0]!) === 'd' &&
      (normalizeToken(rest[1]!) === 'rsquo'
        ? normalizeToken(rest[2] ?? '') === 'autre'
        : normalizeToken(rest[1]!) === 'autre')
    ) {
      return "quelqu'un d'autre"
    }
    return "quelqu'un"
  }
  return seq.map(decodeSignToken).join(' ')
}

const FR_ARTICLE_TOKENS = new Set([
  'un', 'une', 'le', 'la', 'les', 'du', 'des', 'de', 'd', 'l', 'a', 'rsquo', 'c', 'ca', 'ce', 'cet', 'cette', 'y',
  // Négation / élision / pronom réfléchi — jamais des boutons isolés (« N », « Ne », « S », « Se »)
  'n', 'ne', 's', 'se',
])

/** Unités de durée — jamais des entrées isolées hors signes dédiés (mois_1, an_1…). */
const FR_DURATION_UNITS = new Set([
  'an', 'ans', 'annee', 'annees',
  'mois',
  'semaine', 'semaines',
  'jour', 'jours',
  'heure', 'heures',
  'minute', 'minutes',
  'seconde', 'secondes',
])

const FR_DURATION_DEDICATED = new Set([
  'an', 'ans', 'mois', 'semaine', 'semaines', 'jour', 'jours', 'heure', 'heures', 'minute', 'minutes',
])

function isBareArticleOrClitic(token: string): boolean {
  return FR_ARTICLE_TOKENS.has(normalizeToken(token))
}

function isCestBoundaryToken(token: string): boolean {
  const n = normalizeToken(token)
  return n === 'c' || n === 'ca' || n === "c'est" || n === 'c est'
}

function isArticlePhraseContentToken(token: string): boolean {
  const n = normalizeToken(token)
  if (!n || isBareArticleOrClitic(n)) return false
  if (/^[0-9]+$/.test(n)) return false
  if (FR_SYNONYM_LIST_NOISE.has(n) || FR_SYNONYM_TRAILING_SKIP.has(n)) return false
  return true
}

/**
 * Attache un/une/d'un… au contenu voisin pour ne jamais exposer l'article comme sens isolé
 * (ex. tronc d'un arbre, envoyer un sms, trouver une idée).
 */
function mergeArticleBoundParts(parts: string[]): string[] {
  const out: string[] = []
  let i = 0

  while (i < parts.length) {
    const n = normalizeToken(parts[i]!)
    const n1 = normalizeToken(parts[i + 1] ?? '')
    const n2 = normalizeToken(parts[i + 2] ?? '')
    const n3 = normalizeToken(parts[i + 3] ?? '')

    // s' + verbe / expression (s'envoler, s'asseoir, s'il vous plaît…)
    if (n === 's' && n1 === 'rsquo' && isArticlePhraseContentToken(parts[i + 2] ?? '')) {
      const head = decodeSignToken(parts[i + 2]!)
      if (
        normalizeToken(head) === 'il' &&
        normalizeToken(parts[i + 3] ?? '') === 'vous' &&
        normalizeToken(parts[i + 4] ?? '') === 'plait'
      ) {
        out.push("s'il vous plait")
        i += 5
        continue
      }
      // s'envoyer en l'air
      if (
        normalizeToken(head) === 'envoyer' &&
        normalizeToken(parts[i + 3] ?? '') === 'en'
      ) {
        let end = i + 3
        const chunk = ["s'envoyer", 'en']
        if (normalizeToken(parts[end + 1] ?? '') === 'l' && normalizeToken(parts[end + 2] ?? '') === 'rsquo') {
          end += 2
          chunk.push("l'")
          if (parts[end + 1]) {
            end++
            chunk.push(decodeSignToken(parts[end]!))
          }
        } else if (normalizeToken(parts[end + 1] ?? '') === 'l' && isArticlePhraseContentToken(parts[end + 2] ?? '')) {
          end += 2
          chunk.push(`l'${decodeSignToken(parts[end]!)}`)
        } else if (isArticlePhraseContentToken(parts[end + 1] ?? '')) {
          end++
          chunk.push(decodeSignToken(parts[end]!))
        }
        out.push(chunk.join(' ').replace(/l' /g, "l'"))
        i = end + 1
        continue
      }
      out.push(`s'${head}`)
      i += 3
      continue
    }
    if (n === 's' && isArticlePhraseContentToken(parts[i + 1] ?? '') && n1 !== 'rsquo' && n1 !== 'y' && n1 !== 'en') {
      // ça s'est …
      if (n1 === 'est') {
        let end = i + 1
        const chunk = ["s'est"]
        while (end + 1 < parts.length && isArticlePhraseContentToken(parts[end + 1]!)) {
          end++
          chunk.push(decodeSignToken(parts[end]!))
          if (isFrenchInfinitive(parts[end]!) || normalizeToken(parts[end]!) === 'retourne') {
            // take one participle then stop before karma/meta
            break
          }
        }
        if (out.length > 0 && /^(ca|ça)$/i.test(out[out.length - 1]!)) {
          out[out.length - 1] = `ça ${chunk.join(' ')}`
        } else {
          out.push(chunk.join(' '))
        }
        i = end + 1
        continue
      }
      out.push(`s'${decodeSignToken(parts[i + 1]!)}`)
      i += 2
      continue
    }

    // se + infinitif (se battre, se promener…)
    if (n === 'se' && isArticlePhraseContentToken(parts[i + 1] ?? '')) {
      let end = i + 1
      const chunk = ['se', decodeSignToken(parts[end]!)]
      // se faire + verbe ; se renfermer sur soi ; se pencher sur
      while (end + 1 < parts.length) {
        const next = parts[end + 1]!
        const nextN = normalizeToken(next)
        if (FR_SYNONYM_LIST_NOISE.has(nextN)) break
        if (
          nextN === 'sur' ||
          nextN === 'faire' ||
          nextN === 'soi' ||
          (isFrenchInfinitive(next) && normalizeToken(parts[end]!) === 'faire')
        ) {
          end++
          chunk.push(decodeSignToken(next))
          continue
        }
        break
      }
      out.push(chunk.join(' '))
      i = end + 1
      continue
    }

    // à part ça
    if (n === 'a' && n1 === 'part' && n2 === 'ca') {
      out.push('a part ca')
      i += 3
      continue
    }
    if ((n === 'a part' || n === 'a part ca') && n.includes('part')) {
      if (n === 'a part' && n1 === 'ca') {
        out.push('a part ca')
        i += 2
        continue
      }
      if (n === 'a part ca') {
        out.push('a part ca')
        i++
        continue
      }
    }

    // il y a (+ durée « 2 ans », ignore « la/là » parasite en liste de synonymes)
    if ((n === 'il' && n1 === 'y' && n2 === 'a') || n === 'il y a') {
      let end = n === 'il' ? i + 2 : i
      const chunk = ['il y a']
      const nextN = normalizeToken(parts[end + 1] ?? '')
      if (/^[0-9]+$/.test(nextN)) {
        end++
        chunk.push(decodeSignToken(parts[end]!))
        if (FR_DURATION_UNITS.has(normalizeToken(parts[end + 1] ?? ''))) {
          end++
          chunk.push(decodeSignToken(parts[end]!))
        }
      } else if (nextN === 'la') {
        end++ // « il y a là » → garder « il y a » en synonyme
      }
      out.push(chunk.join(' '))
      i = end + 1
      continue
    }

    // s'y (+ verbe)
    if (
      (n === 's' && n1 === 'y') ||
      (n === 's' && n1 === 'rsquo' && n2 === 'y') ||
      n === "s'y"
    ) {
      const hasRsquo = n1 === 'rsquo'
      let end = n === "s'y" ? i : hasRsquo ? i + 2 : i + 1
      const chunk = ["s'y"]
      if (end + 1 < parts.length && isArticlePhraseContentToken(parts[end + 1]!)) {
        end++
        chunk.push(decodeSignToken(parts[end]!))
      }
      out.push(chunk.join(' '))
      i = end + 1
      continue
    }

    // y + verbe/mot (y aller, y compris) — jamais « y » seul
    if (n === 'y' && isArticlePhraseContentToken(parts[i + 1] ?? '')) {
      out.push(`y ${decodeSignToken(parts[i + 1]!)}`)
      i += 2
      continue
    }

    // ça y est
    if ((n === 'ca' && n1 === 'y' && n2 === 'est') || n === 'ca y est') {
      out.push('ça y est')
      i += n === 'ca' ? 3 : 1
      continue
    }

    // durée : 2 mois / 1 an / tous les mois / une fois par mois
    if (/^[0-9]+$/.test(n) && FR_DURATION_UNITS.has(n1)) {
      out.push(`${parts[i]} ${decodeSignToken(parts[i + 1]!)}`)
      i += 2
      continue
    }
    if (n === 'tous' && n1 === 'les' && FR_DURATION_UNITS.has(n2)) {
      out.push(`tous les ${decodeSignToken(parts[i + 2]!)}`)
      i += 3
      continue
    }
    if (/^tous les /.test(n) && FR_DURATION_UNITS.has(n.split(/\s+/).pop()!)) {
      out.push(n)
      i++
      continue
    }
    if (n === 'tous les' && FR_DURATION_UNITS.has(n1)) {
      out.push(`tous les ${decodeSignToken(parts[i + 1]!)}`)
      i += 2
      continue
    }
    if (n === 'dans' && /^[0-9]+$/.test(n1) && FR_DURATION_UNITS.has(n2)) {
      out.push(`dans ${parts[i + 1]} ${decodeSignToken(parts[i + 2]!)}`)
      i += 3
      continue
    }
    if (
      (n === 'une' && n1 === 'fois' && n2 === 'par' && FR_DURATION_UNITS.has(n3)) ||
      (n === 'une fois' && n1 === 'par' && FR_DURATION_UNITS.has(n2)) ||
      (n === 'fois' && n1 === 'par' && FR_DURATION_UNITS.has(n2))
    ) {
      if (n === 'une') {
        out.push(`une fois par ${decodeSignToken(parts[i + 3]!)}`)
        i += 4
      } else if (n === 'une fois') {
        out.push(`une fois par ${decodeSignToken(parts[i + 2]!)}`)
        i += 3
      } else {
        out.push(`fois par ${decodeSignToken(parts[i + 2]!)}`)
        i += 3
      }
      continue
    }
    if (/^une fois par /.test(n) || /^fois par /.test(n)) {
      out.push(n)
      i++
      continue
    }

    // à + nom (mettre à jour, sac à dos, face à face, à cause de…)
    if (n === 'a' && isArticlePhraseContentToken(parts[i + 1] ?? '')) {
      let end = i + 1
      const chunk = ['à', decodeSignToken(parts[end]!)]
      // à cause de / à la X / à l'X
      if (normalizeToken(parts[end]!) === 'cause' && normalizeToken(parts[end + 1] ?? '') === 'de') {
        end++
        chunk.push('de')
      } else if (
        (normalizeToken(parts[end]!) === 'la' || normalizeToken(parts[end]!) === 'l') &&
        isArticlePhraseContentToken(parts[end + 1] ?? '')
      ) {
        end++
        chunk.push(decodeSignToken(parts[end]!))
      } else if (
        end + 1 < parts.length &&
        isArticlePhraseContentToken(parts[end + 1]!) &&
        !isFrenchInfinitive(parts[end + 1]!) &&
        (isFrenchAdjective(parts[end + 1]!) ||
          FR_SPECIFIER_NOUNS.has(normalizeToken(parts[end + 1]!)) ||
          normalizeToken(parts[end]!) === normalizeToken(parts[end + 1]!)) // face à face
      ) {
        end++
        chunk.push(decodeSignToken(parts[end]!))
      }
      const phrase = chunk.join(' ')
      if (out.length > 0 && isArticlePhraseContentToken(out[out.length - 1]!.split(/\s+/).pop()!)) {
        out[out.length - 1] = `${out[out.length - 1]} ${phrase}`
      } else {
        out.push(phrase)
      }
      i = end + 1
      continue
    }

    // c'est (+ complément jusqu'au prochain c'est/ça)
    if ((n === 'c' && n1 === 'est') || n === "c'est" || n === 'c est') {
      let end = n === 'c' ? i + 1 : i
      const chunk = ["c'est"]
      while (end + 1 < parts.length) {
        const next = parts[end + 1]!
        const nextN = normalizeToken(next)
        if (isCestBoundaryToken(next)) break
        if (FR_SYNONYM_LIST_NOISE.has(nextN)) break
        // « tout juste » est un synonyme séparé après une série de c'est…
        if (
          (nextN === 'tout' || nextN === 'tout juste') &&
          chunk.length > 1
        ) {
          break
        }
        end++
        if (nextN === 'un' || nextN === 'une') {
          chunk.push(decodeSignToken(next))
          if (end + 1 < parts.length && isArticlePhraseContentToken(parts[end + 1]!)) {
            end++
            chunk.push(decodeSignToken(parts[end]!))
          }
          continue
        }
        chunk.push(decodeSignToken(next))
      }
      out.push(chunk.join(' '))
      i = end + 1
      continue
    }

    // ça + complément (ça monte, ça ne marche pas…)
    if (n === 'ca' && isArticlePhraseContentToken(parts[i + 1] ?? '')) {
      const chunk = ['ça', decodeSignToken(parts[i + 1]!)]
      let end = i + 1
      while (end + 1 < parts.length) {
        const next = parts[end + 1]!
        const nextN = normalizeToken(next)
        if (isCestBoundaryToken(next)) break
        if (FR_SYNONYM_LIST_NOISE.has(nextN)) break
        if (
          isFrenchInfinitive(next) &&
          !['ne', 'pas', 'veut', 'dire', 'marche', 'va', 'monte', 'descend'].includes(
            normalizeToken(chunk[chunk.length - 1]!),
          ) &&
          chunk.length >= 3
        ) {
          break
        }
        end++
        chunk.push(decodeSignToken(next))
      }
      out.push(chunk.join(' '))
      i = end + 1
      continue
    }

    // quelqu'un / quelqu'un d'autre déjà fusionnés
    if (/^quelqu['']?un(?:\s+d['']?autre)?$/i.test(parts[i]!) || n.replace(/['']/g, '') === 'quelquun' || n.replace(/['']/g, '') === 'quelquun dautre') {
      const rawSeg = parts[i]!
      let phrase = /d['']?autre/i.test(rawSeg) ? "quelqu'un d'autre" : "quelqu'un"
      let end = i
      const nNext = normalizeToken(parts[i + 1] ?? '').replace(/['']/g, '')
      if (phrase === "quelqu'un" && (nNext === 'dautre' || nNext === 'd autre'.replace(/ /g, '') || normalizeToken(parts[i + 1] ?? '') === "d'autre")) {
        phrase = "quelqu'un d'autre"
        end = i + 1
      }
      if (out.length > 0 && isArticlePhraseContentToken(out[out.length - 1]!.split(/\s+/).pop()!)) {
        out[out.length - 1] = `${out[out.length - 1]} ${phrase}`
      } else {
        out.push(phrase)
      }
      i = end + 1
      continue
    }

    // quelqu'un (+ optionnel d'autre)
    if (n === 'quelqu' && (n1 === 'un' || (n1 === 'rsquo' && n2 === 'un'))) {
      const hasRsquo = n1 === 'rsquo'
      let end = hasRsquo ? i + 2 : i + 1
      let phrase = "quelqu'un"
      const after = normalizeToken(parts[end + 1] ?? '')
      const after2 = normalizeToken(parts[end + 2] ?? '')
      const after3 = normalizeToken(parts[end + 3] ?? '')
      if (after === 'd' && ((after2 === 'rsquo' && after3 === 'autre') || after2 === 'autre')) {
        const viaRsquo = after2 === 'rsquo'
        end += viaRsquo ? 3 : 2
        phrase = "quelqu'un d'autre"
      }
      if (out.length > 0 && isArticlePhraseContentToken(out[out.length - 1]!.split(/\s+/).pop()!)) {
        out[out.length - 1] = `${out[out.length - 1]} ${phrase}`
      } else {
        out.push(phrase)
      }
      i = end + 1
      continue
    }

    // d'un / d'une déjà fusionnés + nom
    if ((n === "d'un" || n === "d'une" || n === 'd un' || n === 'd une') && isArticlePhraseContentToken(parts[i + 1] ?? '')) {
      const article = n.includes('une') ? "d'une" : "d'un"
      let end = i + 1
      const chunk = [article, decodeSignToken(parts[end]!)]
      if (isFrenchAdjective(parts[end + 1] ?? '') && !isFrenchAdjective(parts[end]!)) {
        end++
        chunk.push(decodeSignToken(parts[end]!))
      }
      const phrase = chunk.join(' ')
      if (out.length > 0 && isArticlePhraseContentToken(out[out.length - 1]!.split(/\s+/).pop()!)) {
        out[out.length - 1] = `${out[out.length - 1]} ${phrase}`
      } else {
        out.push(phrase)
      }
      i = end + 1
      continue
    }

    // d'un / d'une + nom (+ adj), éventuellement collé au nom précédent
    if (
      n === 'd' &&
      ((n1 === 'rsquo' && (n2 === 'un' || n2 === 'une') && isArticlePhraseContentToken(parts[i + 3] ?? '')) ||
        ((n1 === 'un' || n1 === 'une') && isArticlePhraseContentToken(parts[i + 2] ?? '')))
    ) {
      const viaRsquo = n1 === 'rsquo'
      const article = viaRsquo ? parts[i + 2]! : parts[i + 1]!
      let end = viaRsquo ? i + 3 : i + 2
      const chunk = [`d'${decodeSignToken(article)}`, decodeSignToken(parts[end]!)]
      if (isFrenchAdjective(parts[end + 1] ?? '') && !isFrenchAdjective(parts[end]!)) {
        end++
        chunk.push(decodeSignToken(parts[end]!))
      }
      const phrase = chunk.join(' ')
      if (out.length > 0 && isArticlePhraseContentToken(out[out.length - 1]!.split(/\s+/).pop()!)) {
        out[out.length - 1] = `${out[out.length - 1]} ${phrase}`
      } else {
        out.push(phrase)
      }
      i = end + 1
      continue
    }

    // d' + nom (conseil d'administration), collé au nom précédent — hors d'un/d'une/d'eau déjà gérés
    if (
      n === 'd' &&
      isArticlePhraseContentToken(parts[i + 1] ?? '') &&
      n1 !== 'un' &&
      n1 !== 'une' &&
      n1 !== 'rsquo' &&
      n1 !== 'eau' &&
      n1 !== 'avis' &&
      n1 !== 'honneur'
    ) {
      let end = i + 1
      const chunk = [`d'${decodeSignToken(parts[end]!)}`]
      if (isFrenchAdjective(parts[end + 1] ?? '') && !isFrenchAdjective(parts[end]!)) {
        end++
        chunk.push(decodeSignToken(parts[end]!))
      }
      const phrase = chunk.join(' ')
      if (out.length > 0 && isArticlePhraseContentToken(out[out.length - 1]!.split(/\s+/).pop()!)) {
        out[out.length - 1] = `${out[out.length - 1]} ${phrase}`
      } else {
        out.push(phrase)
      }
      i = end + 1
      continue
    }

    // autre + nom (autre thème)
    if (n === 'autre' && isArticlePhraseContentToken(parts[i + 1] ?? '') && !isFrenchInfinitive(parts[i + 1]!)) {
      out.push(`autre ${decodeSignToken(parts[i + 1]!)}`)
      i += 2
      continue
    }

    // un / une + nom (+ adj optionnel), collé au verbe/nom précédent
    if ((n === 'un' || n === 'une') && isArticlePhraseContentToken(parts[i + 1] ?? '')) {
      let end = i + 1
      const chunk = [decodeSignToken(parts[i]!), decodeSignToken(parts[end]!)]
      if (
        end + 1 < parts.length &&
        isFrenchAdjective(parts[end + 1]!) &&
        !isFrenchAdjective(parts[end]!) &&
        !isFrenchInfinitive(parts[end + 1]!)
      ) {
        end++
        chunk.push(decodeSignToken(parts[end]!))
      }
      const phrase = chunk.join(' ')
      if (out.length > 0 && isArticlePhraseContentToken(out[out.length - 1]!.split(/\s+/).pop()!)) {
        out[out.length - 1] = `${out[out.length - 1]} ${phrase}`
      } else {
        out.push(phrase)
      }
      i = end + 1
      continue
    }

    out.push(parts[i]!)
    i++
  }

  // Nom + adjectif restants (extraction dentaire)
  const compacted: string[] = []
  for (let j = 0; j < out.length; j++) {
    const cur = out[j]!
    const next = out[j + 1]
    if (
      next &&
      !/\s/.test(cur) &&
      !/\s/.test(next) &&
      isArticlePhraseContentToken(cur) &&
      isFrenchAdjective(next) &&
      !isFrenchAdjective(cur) &&
      !isFrenchInfinitive(cur) &&
      !FR_VERB_LIKE.has(normalizeToken(cur))
    ) {
      compacted.push(`${decodeSignToken(cur)} ${decodeSignToken(next)}`)
      j++
      continue
    }
    compacted.push(cur)
  }

  return compacted.filter((s) => !isBareArticleOrClitic(s))
}

function signEndsWithDeau(signId: string): boolean {
  const base = signId.replace(/_\d+$/, '')
  return /_d_(?:rsquo_)?eau$/.test(base)
}

function isDeauSynonymListSign(signId: string): boolean {
  const base = signId.replace(/_\d+$/, '')
  if (/^cascade_chute_d(?:_rsquo|_)?eau_/.test(base)) return true
  const merged = mergeSynonymGroupParts(rawSynonymParts(signId))
  return (
    merged.length >= 3 &&
    merged.some((s) => normalizeToken(s).replace(/['’]/g, ' ') === 'chute d eau')
  )
}

/** Composé nominal en … d'eau (chasse d'eau, araignée d'eau…) — une seule entrée, sauf listes de synonymes. */
function isDeauCompoundSign(signId: string, lang: Lang): boolean {
  if (lang !== 'fr' || !signEndsWithDeau(signId)) return false
  return !isDeauSynonymListSign(signId)
}

function extractDeauCompoundSenses(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  if (!isDeauCompoundSign(signId, lang)) return null
  const display = verbalPhraseDisplay(label.trim())
  const lemma = normalizeToken(display)
  return [{ word: display, lemma, senseKey: `${lemma}@${signId}`, signId }]
}

function isEnSynonymListSign(signId: string, lang: Lang): boolean {
  if (lang !== 'fr') return false
  const base = signId.replace(/_\d+$/, '')
  if (/^beaucoup_en_abondance/.test(base)) return true
  if (/^en_distanciel_\d+_teletravail/.test(base)) return true
  const segments = getFlatSynonymSegments(signId)
  if (!segments || segments.length < 3) return false
  if (segments.some((s) => normalizeToken(s) === 'en')) return false
  return segments.some((s) => /\ben\s/.test(s))
}

/** Expression figée avec « en » (mettre en garde, plus en plus…) — une seule entrée. */
function isEnLinkerCompoundSign(signId: string, lang: Lang): boolean {
  if (lang !== 'fr') return false
  if (isDeauCompoundSign(signId, lang)) return false
  if (isEnSynonymListSign(signId, lang)) return false
  if (getEnDimensionSynonymSplit(signId, lang)) return false

  const base = signId.replace(/_\d+$/, '')
  if (/^a_partir_de/.test(base)) return false
  if (/^s_(?:rsquo_)?en(?:_|$)/.test(base)) return false

  const parts = signIdBaseParts(signId)
  const enIndices = parts.map((p, i) => (normalizeToken(p) === 'en' ? i : -1)).filter((i) => i >= 0)
  if (enIndices.length !== 1) return false

  const enIdx = enIndices[0]!
  return enIdx > 0 && enIdx < parts.length - 1
}

function extractEnLinkerCompoundSenses(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  if (!isEnLinkerCompoundSign(signId, lang)) return null
  const display = verbalPhraseDisplay(label.trim())
  const lemma = normalizeToken(display)
  return [{ word: display, lemma, senseKey: `${lemma}@${signId}`, signId }]
}

/**
 * ex. petit_vraiment_petit_en_largeur → « Petit » · « Vraiment petit en largeur »
 * (adjectif général + variante dimensionnelle, pas une expression figée unique).
 */
function getEnDimensionSynonymSplit(
  signId: string,
  lang: Lang,
): { head: string; tailParts: string[] } | null {
  if (lang !== 'fr') return null

  const parts = signIdBaseParts(signId)
  const enIdx = parts.findIndex((p) => normalizeToken(p) === 'en')
  if (enIdx < 2) return null

  const dimension = parts[enIdx + 1]
  if (!dimension || !FR_DIMENSION_NOUNS.has(normalizeToken(dimension))) return null

  const head = parts[0]!
  const headNorm = normalizeToken(head)
  if (!FR_SIZE_ADJECTIVE_HEADS.has(headNorm)) return null

  const beforeEn = parts.slice(1, enIdx)
  if (beforeEn.length === 0) return null

  const beforeNorms = beforeEn.map(normalizeToken)
  const repeatedHead = beforeNorms.every((n) => n === headNorm)
  const intensifierHead =
    beforeNorms.length === 2 &&
    FR_SIZE_INTENSIFIERS.has(beforeNorms[0]!) &&
    beforeNorms[1] === headNorm
  if (!repeatedHead && !intensifierHead) return null

  return { head, tailParts: parts.slice(1) }
}

function extractEnDimensionSynonymSenses(
  signId: string,
  label: string,
  lang: Lang,
): DictionarySense[] | null {
  const split = getEnDimensionSynonymSplit(signId, lang)
  if (!split) return null

  const normalizedLabel = label.replace(/[,;]/g, ' ').replace(/\s+/g, ' ').trim()
  let remaining = normalizedLabel

  const headRaw =
    extractLeadingSegmentPhrase(remaining, [split.head]) ?? decodeSignToken(split.head)
  remaining = remaining.slice(headRaw.length).trim()

  const tailRaw =
    extractLeadingSegmentPhrase(remaining, split.tailParts) ??
    segmentFallbackPhrase(split.tailParts)
  const headDisplay = capitalizeWord(cleanWord(headRaw, { allowNumeric: true }) ?? headRaw)
  const tailDisplay = verbalPhraseDisplay(tailRaw)

  const headLemma = normalizeToken(headDisplay)
  const tailLemma = normalizeToken(tailDisplay)
  if (!headLemma || !tailLemma) return null

  return [
    { word: headDisplay, lemma: headLemma, senseKey: `${headLemma}@${signId}`, signId },
    { word: tailDisplay, lemma: tailLemma, senseKey: `${tailLemma}@${signId}`, signId },
  ]
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
  // Notes de tournage après un marqueur numérique (ex. etiqueter_une_personne_1_insistance_sur_l_actif)
  const cleanedId = signId.replace(/_\d+_insistance(?:_.*)?$/i, '')
  let parts = signIdBaseParts(cleanedId)
  // Tag grammatical « temps de l'indicatif » — pas des synonymes
  if (
    parts.length >= 4 &&
    normalizeToken(parts[parts.length - 4]!) === 'temps' &&
    normalizeToken(parts[parts.length - 3]!) === 'de' &&
    normalizeToken(parts[parts.length - 2]!) === 'l' &&
    normalizeToken(parts[parts.length - 1]!) === 'indicatif'
  ) {
    parts = parts.slice(0, -4)
  }
  const countMarker = getSynonymCountMarker(cleanedId)
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
  const base = signId.replace(/_\d+$/, '')
  // Conjonctions temporelles : dès que / lorsque / quand (pas « date » ni « conjonction »)
  if (base === 'date_des_que_lorsque_quand_conjonction') {
    return ['des que', 'lorsque', 'quand']
  }

  let segments = mergeSynonymGroupParts(rawSynonymParts(signId))
  segments = mergeArticleBoundParts(segments)
  segments = segments.filter((s) => !FR_SYNONYM_LIST_NOISE.has(normalizeToken(s)))
  segments = segments.filter((s) => !FR_SYNONYM_TRAILING_SKIP.has(normalizeToken(s)))
  segments = segments.filter((s) => !isSignCategoryMarker(s, signId))
  segments = segments.filter((s) => !isBareArticleOrClitic(s))
  segments = segments.filter((s) => {
    if (!FR_DURATION_UNITS.has(normalizeToken(s))) return true
    // unité seule OK seulement pour les signes dédiés (mois_1, an_1…)
    return FR_DURATION_DEDICATED.has(base)
  })
  if (base === 'courrier_electronique_e_mail_mail') {
    return ['courrier electronique', 'e-mail', 'mail']
  }
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
  if (isDeauCompoundSign(signId, lang)) return false
  if (isEnLinkerCompoundSign(signId, lang)) return false
  if (isSpelledNumberSign(signId)) return false

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
    // Prénoms / noms de personnes ou marques : garder ensemble (Adolf Hitler, Albert Einstein…)
    // Avant le test « nom + infinitif » : Hitler finit en -er mais n'est pas un verbe.
    if (
      segments.every((seg) =>
        seg
          .split(/\s+/)
          .filter(Boolean)
          .every((w) => isNameLikeToken(w)),
      )
    ) {
      return false
    }
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
  if (/^d['']?eau$/i.test(segment)) return ['d', 'rsquo', 'eau']
  if (/^d['']?un$/i.test(segment)) return ['d', 'rsquo', 'un']
  if (/^d['']?une$/i.test(segment)) return ['d', 'rsquo', 'une']
  if (/^quelqu['']?un$/i.test(segment)) return ['quelqu', 'un']
  if (/^c['']?est$/i.test(segment)) return ['c', 'est']
  if (/^c['']?est-à-dire que$/i.test(segment) || normalizeToken(segment) === 'c est a dire que') {
    return ['c', 'est', 'a', 'dire', 'que']
  }
  if (normalizeToken(segment) === 'a part ca') return ['a', 'part', 'ca']
  if (normalizeToken(segment) === 'e mail' || segment === 'e-mail') return ['e', 'mail']
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
  if (norm === 'e mail' || segment === 'e-mail') return 'E-mail'
  if (norm === 'a part ca') return 'À part ça'
  if (norm === 'tout juste') return 'Tout juste'
  if (norm === 'plus que parfait' || norm === 'plus-que-parfait') return 'Plus-que-parfait'
  if (norm === 'plutot mourir que') return 'Plutot mourir que'
  if (norm === 'des que') return 'Dès que'
  if (norm === 'quand meme') return 'Quand meme'
  if (norm === 'ne pas' || /^ne pas\b/.test(norm)) return verbalPhraseDisplay(trimmed || segment)
  if (norm === "n'importe" || norm === 'n importe') return "N'importe"
  if (norm === "n'est" || norm === 'n est') return "N'est"
  if (norm === "n'en" || norm === 'n en') return "N'en"
  if (norm === "s'il vous plait" || norm === "s'il vous plaît") return "S'il vous plaît"
  if (/^se\s/.test(norm)) return verbalPhraseDisplay(trimmed || segment)
  if (/^s['']/.test(segment) || /^s['']/.test(norm) || /^ça s['']/.test(norm) || /^ca s['']/.test(norm)) {
    return verbalPhraseDisplay(trimmed || segment)
  }
  if (norm === 'tous les ans') return 'Tous les ans'
  if (norm === 'face a face') return 'Face à face'
  if (norm === 'a cause de') return 'À cause de'
  if (norm === 'a bout') return 'À bout'
  if (norm === 'a fond') return 'À fond'
  if (norm === 'rien a faire') return 'Rien à faire'
  if (norm === 'mettre a jour') return 'Mettre à jour'
  if (norm === 'mise a jour') return 'Mise à jour'
  if (/^à\s/.test(segment) || /^a\s/.test(norm)) return verbalPhraseDisplay(trimmed)
  if (/\sà\s|\sa\s/.test(segment) || /\sa\s/.test(norm)) return verbalPhraseDisplay(trimmed)
  if (norm === 'tous les mois') return 'Tous les mois'
  if (/^une fois par /.test(norm)) return verbalPhraseDisplay(trimmed)
  if (
    /^\d+\s+(ans?|mois|semaines?|jours?|heures?)\b/i.test(norm) ||
    /^\d+\s+(ans?|mois|semaines?|jours?|heures?)\b/i.test(trimmed)
  ) {
    return verbalPhraseDisplay(trimmed)
  }
  if (norm === 'il y a' || normalizeToken(trimmed).startsWith('il y a')) {
    return verbalPhraseDisplay(trimmed.replace(/\bil\s+y\s+\S+/i, 'il y a'))
  }
  if (norm === "s'y" || /^s['']y\b/i.test(trimmed)) return verbalPhraseDisplay(trimmed)
  if (/^y (aller|compris)\b/i.test(norm) || /^y (aller|compris)\b/i.test(trimmed)) {
    return verbalPhraseDisplay(trimmed)
  }
  if (/^c['']?est/i.test(norm) || /^c['']?est/i.test(trimmed)) return verbalPhraseDisplay(trimmed)
  if (/^ça\b|^ca\b/i.test(trimmed) || /^ça\b|^ca\b/i.test(segment)) return verbalPhraseDisplay(trimmed)
  if (/^s'|^il n'/i.test(trimmed) || /^s'|^il n'/i.test(segment)) return verbalPhraseDisplay(trimmed)
  if (/\bd['']?eau\b/i.test(segment)) return verbalPhraseDisplay(trimmed)
  if (/\s/.test(segment)) return verbalPhraseDisplay(trimmed)
  return capitalizeWord(cleanWord(trimmed, { allowNumeric: true }) ?? trimmed)
}

function extractFlatSynonymListSenses(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  if (!isFlatSynonymListSign(signId, lang)) return null
  const segments = getFlatSynonymSegments(signId)
  if (!segments) return null

  const base = signId.replace(/_\d+$/, '')
  if (base === 'date_des_que_lorsque_quand_conjonction') {
    return segments.map((segment) => {
      const display = synonymSegmentDisplay(segment, segment)
      const lemma = normalizeToken(display)
      return { word: display, lemma, senseKey: `${lemma}@${signId}`, signId }
    })
  }

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

function extractDedicatedCompoundSenses(signId: string, label: string, lang: Lang): DictionarySense[] | null {
  const base = signId.replace(/_\d+$/, '')

  const place = matchCompoundPlaceParts(base.split('_').filter(Boolean), lang)
  if (place) {
    const lemma = normalizeToken(place.display)
    return [{ word: place.display, lemma, senseKey: `${lemma}@${signId}`, signId }]
  }

  const single = SEMANTIC_SINGLE_BY_BASE[base]
  if (single) {
    const display = single[lang] ?? single.fr
    const lemma = normalizeToken(display)
    return [{ word: display, lemma, senseKey: `${lemma}@${signId}`, signId }]
  }

  if (/^s_rsquo_il_vous_plait/.test(base)) {
    const display = SEMANTIC_SINGLE_BY_BASE.s_rsquo_il_vous_plait_svp![lang] ?? "S'il vous plaît"
    const lemma = normalizeToken(display)
    return [{ word: display, lemma, senseKey: `${lemma}@${signId}`, signId }]
  }

  if (signId.endsWith('_temps_de_l_indicatif')) {
    const tenseId = signId.slice(0, -'_temps_de_l_indicatif'.length)
    const byLang = GRAMMAR_TENSE_BY_LANG[tenseId]
    const display = byLang?.[lang] ?? byLang?.fr ?? formatPhraseDisplay(tenseId.replace(/_/g, ' '))
    const lemma = normalizeToken(display)
    return [{ word: display, lemma, senseKey: `${lemma}@${signId}`, signId }]
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
  if (/^c_est(?:_|$)/.test(signId) || /(?:^|_)ca_(?!$)/.test(signId) || /_ca$/.test(signId)) return true
  if (/^il_y_a(?:_|$)/.test(signId) || /_il_y_a(?:_|$)/.test(signId)) return true
  if (
    /^(?:dans_)?\d+_(?:ans?|mois|semaines?|jours?|heures?|minutes?|secondes?)$/.test(signId.replace(/_\d+$/, '')) ||
    /^tous_les_(?:ans|mois)$/.test(signId.replace(/_\d+$/, ''))
  ) {
    return true
  }
  if (/_a_/.test(signId) || /^a_/.test(signId)) return true
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

  const segments = label.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
  if (segments.length !== 2) return false

  const [beforeComma, afterComma] = segments
  if (!beforeComma || !afterComma) return false
  if (!/\b(d'|d |de |du |des )/i.test(beforeComma)) return false

  const afterWords = afterComma.split(/\s+/).filter(Boolean)
  if (afterWords.length !== 1) return false

  // Tag démonstratif « ça » / « ca » — pas une entrée dictionnaire
  if (/^(ça|ca)$/i.test(afterWords[0]!)) return true

  if (!hasPhraseConnector(signId, signTokens, lang)) return false

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

    const display = /\s/.test(cleaned)
      ? verbalPhraseDisplay(cleaned)
      : formatPhraseDisplay(cleaned)
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
  'un', 'une', 'rsquo', 'quelqu', 'y',
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
  let trimmed = raw
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\bd\s+avis\b/gi, "d'avis")
  trimmed = trimmed
    .replace(/\bd\s+honneur\b/gi, "d'honneur")
    .replace(/\bd\s+eau\b/gi, "d'eau")
    .replace(/\bd\s+un\b/gi, "d'un")
    .replace(/\bd\s+une\b/gi, "d'une")
    .replace(/\bd\s+administration\b/gi, "d'administration")
    .replace(/\bc\s+est\s+a\s+dire\s+que\b/gi, "c'est-a-dire que")
    .replace(/\bc\s+est\b/gi, "c'est")
    .replace(/\bil\s+s\s+agit\s+de\b/gi, "il s'agit de")
    .replace(/\ba\s+part\s+ca\b/gi, 'a part ca')
    .replace(/\bil\s+n\s+y\s+a\s+pas\b/gi, "il n'y a pas")
    .replace(/\bil\s+y\s+a\b/gi, 'il y a')
    .replace(/\bs\s+y\b/gi, "s'y")
    .replace(/\bca\s+y\s+est\b/gi, 'ca y est')
    .replace(/\by\s+aller\b/gi, 'y aller')
    .replace(/\by\s+compris\b/gi, 'y compris')
    .replace(/\bmettre\s+a\s+jour\b/gi, 'mettre à jour')
    .replace(/\bmise\s+a\s+jour\b/gi, 'mise à jour')
    .replace(/\bface\s+a\s+face\b/gi, 'face à face')
    .replace(/\ba\s+cause\s+de\b/gi, 'à cause de')
    .replace(/\ba\s+bout\b/gi, 'à bout')
    .replace(/\ba\s+fond\b/gi, 'à fond')
    .replace(/\brien\s+a\s+faire\b/gi, 'rien à faire')
    .replace(/\btous\s+les\s+ans\b/gi, 'tous les ans')
    .replace(/\bsac\s+a\s+(dos|main)\b/gi, 'sac à $1')
    .replace(/\bbrosse\s+a\s+/gi, 'brosse à ')
    .replace(/\bpatins\s+a\s+/gi, 'patins à ')
    .replace(/\bfer\s+a\s+cheval\b/gi, 'fer à cheval')
    .replace(/\bca\b/gi, 'ça')
    .replace(/\ba part ca\b/gi, 'à part ça')
    .replace(/\bc'est-a-dire que\b/gi, "c'est-à-dire que")
    .replace(/\bca y est\b/gi, 'ça y est')
    .replace(/\bbras d honneur\b/gi, "bras d'honneur")
    .replace(/\bchute d eau\b/gi, "chute d'eau")
    .replace(/\bquelqu\s+un\b/gi, "quelqu'un")
    .replace(/\bil\s+etait\s+une\s+fois\b/gi, 'il etait une fois')
    .replace(/\bs\s+en\s+fuir\b/gi, "s'enfuir")
    .replace(/\bs\s+en\s+lasser\b/gi, "s'en lasser")
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
  if (content.length <= 1) {
    // « à cause de », « mettre à jour »… : les mots-outils partent en stop words, mais c'est une phrase
    if (
      lang === 'fr' &&
      signIdBaseParts(signId).length >= 2 &&
      (/^a_/.test(signId) || /_a_/.test(signId) || /^tous_les_ans/.test(signId) || /_(?:an|ans)$/.test(signId.replace(/_\d+$/, '')))
    ) {
      return 'phrase'
    }
    return 'dedicated'
  }
  // Noms de personnes / marques avant les listes de synonymes plates
  if (isProperNameSign(signId, signTokens, content, trimmed, lang)) return 'phrase'
  if (isFlatSynonymListSign(signId, lang)) return 'synonym_list'
  if (isPrepositionalVerbList(signId, content, lang)) return 'synonym_list'
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
  const keepLower = new Set([
    'a', 'à', 'au', 'aux', 'c', 'ca', 'ça', "c'est", 'd', "d'un", "d'une", "d'", 'de', 'des', 'du', 'en', 'et', 'la', 'le', 'les',
    'l', 'un', 'une', 'par', 'pour', 'sur', 'sous', 'avec', 'sans', 'ou',
  ])
  let normalized = text
    .replace(/\bc\s+est\b/gi, "c'est")
    .replace(/\bca\b/gi, 'ça')
  return normalized
    .split(/(\s+)/)
    .map((part, idx) => {
      if (/^\s+$/.test(part)) return part
      if (/^\d+$/.test(part)) return part
      const norm = normalizeToken(part)
      if (idx > 0 && (keepLower.has(norm) || keepLower.has(part.toLowerCase()) || /^d['']/i.test(part) || /^c['']est$/i.test(part))) {
        if (/^c['']est$/i.test(part)) return "c'est"
        if (norm === 'ca') return 'ça'
        return part.toLowerCase()
      }
      if (/^c['']est$/i.test(part) && idx === 0) return "C'est"
      if (norm === 'ca' && idx === 0) return 'Ça'
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
  if (fromLabel) {
    if (
      /^c['']est\b/i.test(fromLabel) ||
      /^(ça|ca)\b/i.test(fromLabel) ||
      /^il\s+s['']agit\b/i.test(fromLabel) ||
      /^il\s+y\s+a\b/i.test(fromLabel) ||
      /^à\s/i.test(fromLabel) ||
      /^a\s/i.test(fromLabel) ||
      /\sa\s/i.test(fromLabel) ||
      /^(tous les (?:ans|mois)|\d+\s+(?:ans?|mois|semaines?|jours?|heures?)|dans\s+\d+|une fois par)/i.test(fromLabel)
    ) {
      return verbalPhraseDisplay(fromLabel)
    }
    return formatPhraseDisplay(fromLabel)
  }
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

  const dedicatedCompound = extractDedicatedCompoundSenses(signId, trimmed, lang)
  if (dedicatedCompound) return filterDictionarySenses(dedicatedCompound, signId)

  const semanticList = extractSemanticSynonymListSenses(signId, lang)
  if (semanticList) return filterDictionarySenses(semanticList, signId)

  const deauCompound = extractDeauCompoundSenses(signId, trimmed, lang)
  if (deauCompound) return filterDictionarySenses(deauCompound, signId)

  const enDimensionSynonymSenses = extractEnDimensionSynonymSenses(signId, trimmed, lang)
  if (enDimensionSynonymSenses) return filterDictionarySenses(enDimensionSynonymSenses, signId)

  const enCompound = extractEnLinkerCompoundSenses(signId, trimmed, lang)
  if (enCompound) return filterDictionarySenses(enCompound, signId)

  // Noms de personnes / marques avant le découpage en synonymes plats
  const properNameSenses = extractProperNameSenses(signId, trimmed, lang)
  if (properNameSenses) return filterDictionarySenses(properNameSenses, signId)

  const numericDualSenses = extractNumericDualSenses(signId, trimmed, lang)
  if (numericDualSenses) return filterDictionarySenses(numericDualSenses, signId)

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

/**
 * Complète le lexique FR→EN/TR/PL sans API :
 * aligne les sens multi-mots quand les comptes correspondent,
 * et dérive les têtes depuis d’autres signes 1:1.
 */
import fs from 'fs'
import path from 'path'
import { SIGN_LABELS_FR, SIGN_LABELS_EN, SIGN_LABELS_TR, SIGN_LABELS_PL } from '../lib/signLabels'
import { extractDictionarySenses, normalizeLemma } from '../lib/dictionarySemantics'
import { buildDictionaryEntries } from '../lib/dictionaryEntries'
import { lexiconCoverage } from '../lib/dictionaryLexicon'

const OUT = path.join(process.cwd(), 'lib/generated/frSenseTranslations.json')

type Lang = 'en' | 'tr' | 'pl'

function capitalize(text: string): string {
  const t = text.trim()
  if (!t) return t
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function isJunk(lemma: string, t: string): boolean {
  if (!t || t.trim().length < 2) return true
  const a = lemma.toLowerCase()
  const b = t.toLowerCase().trim()
  if (a === b) return true
  if (/mymemory|limit|invalid|\.\.\.|^[-.,;:]+$/i.test(t)) return true
  if (t.trim() === '.') return true
  return false
}

function buildFromLabels(lang: Lang, labels: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}

  for (const [id, frLabel] of Object.entries(SIGN_LABELS_FR)) {
    const frSenses = extractDictionarySenses(id, frLabel, 'fr')
    const tLabel = labels[id]
    if (!tLabel) continue

    if (frSenses.length === 1) {
      const lemma = frSenses[0]!.lemma
      if (!out[lemma]) out[lemma] = tLabel.trim()
      continue
    }

    // Virgules côté cible
    const commaParts = tLabel.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
    if (commaParts.length === frSenses.length) {
      for (let i = 0; i < frSenses.length; i++) {
        const lemma = frSenses[i]!.lemma
        if (!out[lemma] && !isJunk(lemma, commaParts[i]!)) out[lemma] = capitalize(commaParts[i]!)
      }
      continue
    }

    const tSenses = extractDictionarySenses(id, tLabel, lang)
    if (tSenses.length === frSenses.length) {
      for (let i = 0; i < frSenses.length; i++) {
        const lemma = frSenses[i]!.lemma
        const w = tSenses[i]!.word
        if (!out[lemma] && !isJunk(lemma, w)) out[lemma] = w
      }
    }
  }

  return out
}

function main() {
  const existing = fs.existsSync(OUT)
    ? JSON.parse(fs.readFileSync(OUT, 'utf8'))
    : { en: {}, tr: {}, pl: {} }

  const packs: Record<Lang, Record<string, string>> = {
    en: SIGN_LABELS_EN,
    tr: SIGN_LABELS_TR,
    pl: SIGN_LABELS_PL,
  }

  const fr = buildDictionaryEntries({}, 'fr')
  const lemmas = [...new Set(fr.map((e) => e.lemma))]

  for (const lang of ['en', 'tr', 'pl'] as const) {
    const derived = buildFromLabels(lang, packs[lang])
    let added = 0
    for (const [lemma, word] of Object.entries(derived)) {
      if (!existing[lang][lemma] && !isJunk(lemma, word)) {
        existing[lang][lemma] = word
        added++
      }
    }
    const { missing } = lexiconCoverage(lang, lemmas)
    // Re-check after merge: lexiconCoverage uses module cache — report raw missing vs derived
    const still = missing.filter((l) => !existing[lang][l] && !derived[l] && !/^\d/.test(l))
    console.log(lang, 'derived+', added, 'stored', Object.keys(existing[lang]).length, 'still open ~', still.length)
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(existing, null, 2))
  console.log('Wrote', OUT)
}

main()

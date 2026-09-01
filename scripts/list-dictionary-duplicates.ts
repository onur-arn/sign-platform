#!/usr/bin/env node
/**
 * Liste les doublons du dictionnaire pour curation manuelle.
 * Usage : npx tsx scripts/list-dictionary-duplicates.ts [fr|en|tr|pl]
 */
import { SIGN_LABELS_FR, SIGN_LABELS_EN, SIGN_LABELS_TR } from '../lib/signLabels'
import { SIGN_LABELS_PL } from '../lib/signLabels-pl'
import { extractWordsFromSign } from '../lib/dictionaryEntries'
import { findDictionaryDuplicates } from '../lib/dictionaryPreferences'
import type { Lang } from '../lib/dictionaryEntries'

const lang = (process.argv[2] ?? 'fr') as Lang
const maps: Record<Lang, Record<string, string>> = {
  fr: SIGN_LABELS_FR,
  en: SIGN_LABELS_EN,
  tr: SIGN_LABELS_TR,
  pl: SIGN_LABELS_PL,
}

const labelsMap = maps[lang] ?? SIGN_LABELS_FR

const duplicates = findDictionaryDuplicates(labelsMap, lang, (signId, label) =>
  extractWordsFromSign(signId, label, lang).map(({ raw, normalized }) => ({
    word: raw,
    normalized,
  })),
)

console.log(`# Doublons dictionnaire (${lang}) : ${duplicates.length} mots\n`)

for (const dup of duplicates.slice(0, 80)) {
  console.log(`${dup.word} (${dup.normalized})`)
  for (const c of dup.candidates) {
    console.log(`  - ${c.signId}`)
  }
  console.log('')
}

if (duplicates.length > 80) {
  console.log(`… et ${duplicates.length - 80} autres (total ${duplicates.length})`)
}

console.log('\nPour fixer : éditer lib/dictionaryPreferences.ts → DICTIONARY_PREFERRED_SIGN')

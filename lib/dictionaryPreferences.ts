/**
 * Préférences manuelles pour les doublons du dictionnaire.
 * Clé = mot normalisé (sans accents, minuscules).
 * Valeur = sign_id à conserver quand plusieurs signes partagent le même mot.
 *
 * Exemple :
 *   jeter: 'jeter_2',
 *   avis: 'avis_1',
 */
export const DICTIONARY_PREFERRED_SIGN: Record<
  'fr' | 'en' | 'tr' | 'pl',
  Record<string, string>
> = {
  fr: {},
  en: {},
  tr: {},
  pl: {},
}

export type DictionaryDuplicate = {
  word: string
  normalized: string
  candidates: { signId: string; label: string }[]
}

/** Liste les mots présents dans plusieurs signes (pour curation manuelle). */
export function findDictionaryDuplicates(
  labelsMap: Record<string, string>,
  lang: 'fr' | 'en' | 'tr' | 'pl',
  expandWord: (signId: string, label: string) => { word: string; normalized: string }[],
): DictionaryDuplicate[] {
  const buckets = new Map<string, { signId: string; label: string; word: string }[]>()

  for (const [signId, label] of Object.entries(labelsMap)) {
    for (const { word, normalized } of expandWord(signId, label)) {
      const list = buckets.get(normalized) ?? []
      if (!list.some((x) => x.signId === signId)) {
        list.push({ signId, label, word })
      }
      buckets.set(normalized, list)
    }
  }

  const out: DictionaryDuplicate[] = []
  for (const [normalized, candidates] of buckets) {
    if (candidates.length < 2) continue
    out.push({
      word: candidates[0]!.word,
      normalized,
      candidates: candidates.map(({ signId, label }) => ({ signId, label })),
    })
  }

  return out.sort((a, b) => a.normalized.localeCompare(b.normalized))
}

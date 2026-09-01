import { SIGN_LABELS_EN, SIGN_LABELS_FR, SIGN_LABELS_TR } from '@/lib/signLabels'
import { SIGN_LABELS_PL } from '@/lib/signLabels-pl'
import type { Lang } from '@/lib/dictionaryEntries'

export function getSignLabelsMap(lang: Lang): Record<string, string> {
  if (lang === 'en') return SIGN_LABELS_EN
  if (lang === 'pl') return SIGN_LABELS_PL
  if (lang === 'tr') return SIGN_LABELS_TR
  return SIGN_LABELS_FR
}

import { prisma } from '@/lib/db'
import { DICTIONARY_PREFERRED_SIGN } from '@/lib/dictionaryPreferences'
import type { Lang } from '@/lib/dictionaryEntries'

export async function loadDictionaryPreferences(lang: Lang): Promise<Record<string, string>> {
  const rows = await prisma.dictionaryPreference.findMany({
    where: { lang },
    select: { normalized: true, signId: true },
  })

  const fromDb = Object.fromEntries(rows.map((r) => [r.normalized, r.signId]))
  return { ...DICTIONARY_PREFERRED_SIGN[lang], ...fromDb }
}

export async function saveDictionaryPreference(
  lang: Lang,
  normalized: string,
  signId: string,
  updatedBy?: string,
) {
  return prisma.dictionaryPreference.upsert({
    where: { lang_normalized: { lang, normalized } },
    create: { lang, normalized, signId, updatedBy },
    update: { signId, updatedBy },
  })
}

export async function countSavedDictionaryPreferences(lang: Lang): Promise<number> {
  return prisma.dictionaryPreference.count({ where: { lang } })
}

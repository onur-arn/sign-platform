import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { listDictionaryDuplicates } from '@/lib/dictionaryDuplicates'
import type { Lang } from '@/lib/dictionaryEntries'
import {
  countSavedDictionaryPreferences,
  loadDictionaryPreferences,
} from '@/lib/dictionaryPreferencesStore'

function parseLang(value: string | null): Lang {
  if (value === 'en' || value === 'tr' || value === 'pl') return value
  return 'fr'
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { searchParams } = req.nextUrl
  const lang = parseLang(searchParams.get('lang'))
  const search = searchParams.get('search') ?? ''
  const offset = Math.max(0, Number(searchParams.get('offset') ?? 0) || 0)
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 25) || 25))
  const onlyUnresolved = searchParams.get('onlyUnresolved') === '1'

  const preferences = await loadDictionaryPreferences(lang)
  const { items, total, manualCount } = listDictionaryDuplicates(lang, preferences, {
    search,
    offset,
    limit,
    onlyUnresolved,
  })
  const savedCount = await countSavedDictionaryPreferences(lang)

  return NextResponse.json({
    items,
    total,
    manualCount,
    savedCount,
    offset,
    limit,
    lang,
  })
}

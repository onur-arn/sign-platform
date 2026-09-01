import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { Lang } from '@/lib/dictionaryEntries'
import { loadDictionaryPreferences } from '@/lib/dictionaryPreferencesStore'

function parseLang(value: string | null): Lang {
  if (value === 'en' || value === 'tr' || value === 'pl') return value
  return 'fr'
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const lang = parseLang(req.nextUrl.searchParams.get('lang'))
  const preferences = await loadDictionaryPreferences(lang)

  return NextResponse.json({ lang, preferences })
}

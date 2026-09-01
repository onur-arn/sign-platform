import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSignLabelsMap } from '@/lib/signLabelsMap'
import type { Lang } from '@/lib/dictionaryEntries'
import { saveDictionaryPreference } from '@/lib/dictionaryPreferencesStore'

function parseLang(value: unknown): Lang | null {
  if (value === 'fr' || value === 'en' || value === 'tr' || value === 'pl') return value
  return null
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const body = await req.json().catch(() => ({}))
  const lang = parseLang(body.lang)
  const normalized = typeof body.normalized === 'string' ? body.normalized.trim().toLowerCase() : ''
  const signId = typeof body.signId === 'string' ? body.signId.trim() : ''

  if (!lang || !normalized || !signId) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const labelsMap = getSignLabelsMap(lang)
  if (!labelsMap[signId]) {
    return NextResponse.json({ error: 'Signe inconnu' }, { status: 400 })
  }

  await saveDictionaryPreference(lang, normalized, signId, auth.email)

  return NextResponse.json({ ok: true, lang, normalized, signId })
}

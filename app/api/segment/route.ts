import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { segmentToSlots, lookupWord } from '@/lib/normalize';
import { findSynonymSign } from '@/lib/synonym-ai';

// Overrides directs : ces mots jouent toujours le signe "you" (toi_tu)
const WORD_OVERRIDES: Record<string, Record<string, string>> = {
  fr: { tu: 'toi_tu', toi: 'toi_tu', vous: 'toi_tu' },
  tr: { sen: 'toi_tu', siz: 'toi_tu' },
  en: {},
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { text, language } = await req.json();
  if (!text?.trim()) return NextResponse.json({ signs: [], words: [] });

  const lang = language ?? 'fr';
  const slots = segmentToSlots(text.trim(), lang);

  const overrideMap = WORD_OVERRIDES[lang] ?? {};

  const resolved = await Promise.all(
    slots.map(async slot => {
      const wordKey = (slot.found ? slot.word : slot.token).toLowerCase();
      if (overrideMap[wordKey]) return { sign: overrideMap[wordKey], word: slot.found ? slot.word : slot.token };
      if (slot.found) return { sign: slot.sign, word: slot.word };
      const fallback = await findSynonymSign(slot.token, lang, lookupWord);
      if (fallback) return { sign: fallback.sign, word: slot.token };
      return null;
    })
  );

  const found = resolved.filter(Boolean) as { sign: string; word: string }[];
  return NextResponse.json({
    signs: found.map(s => s.sign),
    words: found.map(s => s.word),
  });
}

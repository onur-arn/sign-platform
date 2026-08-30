import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { segmentToSlots, lookupWord, findSimilarSign } from '@/lib/normalize';
import { findSynonymSign } from '@/lib/synonym-ai';
import { clientIp, rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { MAX_SEGMENT_CHARS, RATE } from '@/lib/request-limits';

// Overrides directs : ces mots jouent toujours le signe "you" (toi_tu)
const WORD_OVERRIDES: Record<string, Record<string, string>> = {
  fr: { tu: 'toi_tu', toi: 'toi_tu', vous: 'toi_tu' },
  tr: { sen: 'toi_tu', siz: 'toi_tu' },
  en: {},
  // Polonais → segmentation via EN après traduction ; overrides sur le texte source
  pl: { ty: 'toi_tu', wy: 'toi_tu', ciebie: 'toi_tu', tobie: 'toi_tu' },
}

async function translateToEnglish(text: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=pl|en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return text;
    const data = await res.json();
    const t: string = data?.responseData?.translatedText ?? text;
    if (t.toUpperCase().includes('LIMIT') || t.toUpperCase().includes('INVALID')) return text;
    return t;
  } catch {
    return text;
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const userKey = session.user?.id || session.user?.email || clientIp(req);
  const limited = await rateLimit(`segment:${userKey}`, RATE.segment.limit, RATE.segment.windowMs);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  const { text, language } = await req.json();
  if (!text?.trim()) return NextResponse.json({ signs: [], words: [] });

  if (String(text).length > MAX_SEGMENT_CHARS) {
    return NextResponse.json(
      { error: `Texte trop long (max ${MAX_SEGMENT_CHARS} caractères)` },
      { status: 413 },
    );
  }

  const lang = language ?? 'fr';
  let workingText = text.trim();
  let segmentLang = lang;

  // Pas de lexique PL natif : traduire vers l'anglais puis segmenter en EN
  if (lang === 'pl') {
    workingText = await translateToEnglish(workingText);
    segmentLang = 'en';
  }

  const slots = segmentToSlots(workingText, segmentLang);

  const overrideMap = WORD_OVERRIDES[lang] ?? {};

  const resolved = await Promise.all(
    slots.map(async slot => {
      const wordKey = (slot.found ? slot.word : slot.token).toLowerCase();
      if (overrideMap[wordKey]) return { sign: overrideMap[wordKey], word: slot.found ? slot.word : slot.token };
      if (slot.found) return { sign: slot.sign, word: slot.word };

      // Mots proches (academic → academy), toutes langues du lexique
      const similar = findSimilarSign(slot.token, segmentLang);
      if (similar) return { sign: similar.sign, word: slot.token };

      const fallback = await findSynonymSign(slot.token, segmentLang, lookupWord);
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

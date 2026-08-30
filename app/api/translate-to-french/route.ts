import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Détecte la langue depuis le texte complet via des caractères distinctifs
function detectLang(text: string): string {
  if (/[şıüöğç]/i.test(text)) return 'tr';
  if (/[؀-ۿ]/.test(text))  return 'ar';
  if (/[Ѐ-ӿ]/.test(text))  return 'ru';
  if (/[ñ¿¡]/i.test(text))           return 'es';
  if (/[äöüß]/i.test(text))          return 'de';
  if (/[àâêîôûùçœæ]/i.test(text))   return 'fr';
  return 'en';
}

async function translateWord(word: string, sourceLang: string): Promise<string> {
  if (sourceLang === 'fr') return word; // déjà en français
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${sourceLang}|fr`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return word;
    const data = await res.json();
    const t: string = data?.responseData?.translatedText ?? word;
    if (t.toUpperCase().includes('LIMIT') || t.toUpperCase().includes('INVALID')) return word;
    return t;
  } catch {
    return word;
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ translated: '' });

  const trimmed = text.trim();
  const sourceLang = detectLang(trimmed);
  const words = trimmed.split(/\s+/).filter(Boolean);
  const translations = await Promise.all(words.map((w: string) => translateWord(w, sourceLang)));
  return NextResponse.json({ translated: translations.join(' ') });
}

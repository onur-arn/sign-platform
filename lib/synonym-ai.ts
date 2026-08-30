import { prisma } from './db';

// Cache mémoire locale (warm instance) — la DB est la source de vérité partagée
const memCache = new Map<string, string | null>();

const LANG_PROMPTS: Record<string, string> = {
  fr: 'Donne 5 synonymes courants en français pour le mot "{word}", du plus simple au moins courant. Réponds uniquement avec les mots séparés par des virgules, sans explication.',
  en: 'Give 5 common English synonyms for the word "{word}", from most to least common. Reply only with the words separated by commas, no explanation.',
  tr: '"{word}" kelimesinin 5 yaygın Türkçe eşanlamlısını ver, en yaygından en az yaygına doğru. Sadece virgülle ayrılmış kelimeleri yaz, açıklama yapma.',
};

export async function findSynonymSign(
  token: string,
  language: string,
  lookupFn: (word: string, lang: string) => string | null,
): Promise<{ sign: string; synonym: string } | null> {
  const key = `${language}:${token}`;

  // 1. Cache mémoire (chaud)
  if (memCache.has(key)) {
    const cached = memCache.get(key)!;
    if (!cached) return null;
    const sign = lookupFn(cached, language);
    return sign ? { sign, synonym: cached } : null;
  }

  // 2. Cache DB (partagé entre toutes les instances)
  try {
    const row = await prisma.synonymCache.findUnique({ where: { key } });
    if (row) {
      memCache.set(key, row.synonym);
      if (!row.synonym) return null;
      const sign = lookupFn(row.synonym, language);
      return sign ? { sign, synonym: row.synonym } : null;
    }
  } catch {
    // DB indisponible — on continue vers l'IA
  }

  // 3. Fallback IA (temperature: 0 pour résultat déterministe)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    memCache.set(key, null);
    return null;
  }

  const prompt = (LANG_PROMPTS[language] ?? LANG_PROMPTS.fr).replace('{word}', token);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 64,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      memCache.set(key, null);
      return null;
    }

    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? '';
    const candidates = text.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);

    for (const candidate of candidates) {
      const sign = lookupFn(candidate, language);
      if (sign) {
        memCache.set(key, candidate);
        // Persiste en DB (fire-and-forget)
        prisma.synonymCache.upsert({
          where: { key },
          create: { key, synonym: candidate },
          update: { synonym: candidate },
        }).catch(() => {});
        return { sign, synonym: candidate };
      }
    }
  } catch {
    // API indisponible — skip silencieux
  }

  memCache.set(key, null);
  // Persiste "aucun synonyme" en DB pour éviter de rappeler l'IA
  prisma.synonymCache.upsert({
    where: { key },
    create: { key, synonym: null },
    update: { synonym: null },
  }).catch(() => {});
  return null;
}

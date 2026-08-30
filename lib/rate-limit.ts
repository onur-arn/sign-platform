import { prisma } from '@/lib/db'

type RateLimitResult = {
  ok: boolean
  remaining: number
  retryAfterSec: number
}

/**
 * Rate limit persistant (Postgres/SQLite via Prisma) — fonctionne en serverless.
 * Fenêtre glissante simple par clé (IP, email, userId…).
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now()
  const resetAt = new Date(now + windowMs)

  try {
    const existing = await prisma.rateLimitBucket.findUnique({ where: { key } })

    if (!existing || existing.resetAt.getTime() <= now) {
      await prisma.rateLimitBucket.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      })
      return { ok: true, remaining: limit - 1, retryAfterSec: Math.ceil(windowMs / 1000) }
    }

    if (existing.count >= limit) {
      const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt.getTime() - now) / 1000))
      return { ok: false, remaining: 0, retryAfterSec }
    }

    await prisma.rateLimitBucket.update({
      where: { key },
      data: { count: { increment: 1 } },
    })

    return {
      ok: true,
      remaining: limit - existing.count - 1,
      retryAfterSec: Math.ceil((existing.resetAt.getTime() - now) / 1000),
    }
  } catch (err) {
    // En cas d'erreur DB, on laisse passer (évite de bloquer le site)
    console.error('[rate-limit]', err)
    return { ok: true, remaining: limit, retryAfterSec: 0 }
  }
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}

export function rateLimitResponse(retryAfterSec: number) {
  return Response.json(
    { error: 'RATE_LIMITED', message: 'Trop de requêtes. Réessayez plus tard.' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSec) },
    },
  )
}

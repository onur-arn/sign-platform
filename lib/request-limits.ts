/** Limites anti-abus côté API */
export const MAX_SEGMENT_CHARS = 4_000
export const MAX_TRANSLATE_CHARS = 4_000
export const MAX_PDF_BYTES = 10 * 1024 * 1024

export const RATE = {
  register: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 / h / IP
  login: { limit: 20, windowMs: 15 * 60 * 1000 }, // 20 / 15 min / IP+email
  segment: { limit: 60, windowMs: 60 * 1000 }, // 60 / min / user
  upload: { limit: 15, windowMs: 60 * 60 * 1000 }, // 15 / h / user
  translate: { limit: 40, windowMs: 60 * 1000 }, // 40 / min / user
} as const

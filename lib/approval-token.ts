import { createHmac, timingSafeEqual } from 'crypto';

const EXPIRY_MS = 48 * 60 * 60 * 1000;

export function generateApprovalToken(userId: string, action: 'approve' | 'reject'): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET manquant');
  const ts = Date.now().toString();
  const payload = `${userId}.${action}.${ts}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

export function validateApprovalToken(token: string): { userId: string; action: string } | null {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return null;
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const lastDot = decoded.lastIndexOf('.');
    if (lastDot === -1) return null;
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);

    const parts = payload.split('.');
    if (parts.length !== 3) return null;
    const [userId, action, ts] = parts;

    if (Date.now() - parseInt(ts) > EXPIRY_MS) return null;
    if (!['approve', 'reject'].includes(action)) return null;

    const expectedSig = createHmac('sha256', secret).update(payload).digest('hex');
    const a = Buffer.from(sig.padEnd(expectedSig.length, '0'), 'hex');
    const b = Buffer.from(expectedSig, 'hex');
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    return { userId, action };
  } catch {
    return null;
  }
}

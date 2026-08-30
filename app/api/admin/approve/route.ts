import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendStatusEmail } from '@/lib/email';
import { validateApprovalToken } from '@/lib/approval-token';

// GET : appelé depuis le lien dans l'email (token HMAC signé, expiration 48h)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse('Lien invalide', { status: 400 });
  }

  const payload = validateApprovalToken(token);
  if (!payload) {
    return new NextResponse('Lien invalide ou expiré', { status: 401 });
  }

  const { userId, action } = payload;
  const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  await sendStatusEmail(user.email, status === 'APPROVED');

  return new NextResponse(`
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:sans-serif;text-align:center;padding:60px">
      <h2 style="color:${status === 'APPROVED' ? '#16a34a' : '#dc2626'}">
        ${status === 'APPROVED' ? '✓ Compte approuvé' : '✗ Compte rejeté'}
      </h2>
      <p>${user.email}</p>
      <a href="${process.env.NEXTAUTH_URL}/admin" style="color:#7c3aed">← Retour au panneau admin</a>
    </body></html>
  `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// POST : appelé depuis le panneau admin
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const currentUser = await prisma.user.findUnique({ where: { email: session.user!.email! } });
  if (currentUser?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { userId, action } = await req.json();
  if (!userId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }

  const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  await sendStatusEmail(user.email, status === 'APPROVED');

  return NextResponse.json({ ok: true, status });
}

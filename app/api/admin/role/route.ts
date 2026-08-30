import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const currentUser = await prisma.user.findUnique({ where: { email: session.user!.email! } });
  if (currentUser?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { userId, role } = await req.json();
  if (!userId || !['USER', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
  }

  // Protège le compte principal
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (targetUser?.email === process.env.PROTECTED_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Ce compte ne peut pas être modifié' }, { status: 403 });
  }

  // Empêche de se rétrograder soi-même
  if (userId === currentUser.id) {
    return NextResponse.json({ error: 'Vous ne pouvez pas modifier votre propre rôle' }, { status: 400 });
  }

  const updated = await prisma.user.update({ where: { id: userId }, data: { role } });
  return NextResponse.json({ ok: true, role: updated.role });
}

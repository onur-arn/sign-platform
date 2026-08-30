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

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'Paramètre manquant' }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  if (target.email === process.env.PROTECTED_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Ce compte ne peut pas être supprimé' }, { status: 403 });
  }

  // Supprime les traductions liées avant de supprimer l'utilisateur
  await prisma.translation.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ ok: true });
}

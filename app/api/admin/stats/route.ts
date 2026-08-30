import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const currentUser = await prisma.user.findUnique({ where: { email: session.user!.email! } });
  if (currentUser?.role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const userSelect = { id: true, email: true, name: true, status: true, role: true, createdAt: true, updatedAt: true };

  const [users, translations, signs] = await Promise.all([
    prisma.user.findMany({ select: userSelect, orderBy: { createdAt: 'desc' } }),
    prisma.translation.findMany({
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.sign.findMany({ orderBy: { word: 'asc' } }),
  ]);

  return NextResponse.json({ users, translations, signs });
}

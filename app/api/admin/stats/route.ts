import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SIGN_COUNT, SIGN_COUNT_LABEL } from '@/lib/signCount'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Vérifie le rôle en DB (le JWT peut être un peu en retard après un revoke)
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  })
  if (currentUser?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      name: true,
      status: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    users,
    signsCount: SIGN_COUNT,
    signsCountLabel: SIGN_COUNT_LABEL,
    protectedAdminEmail: process.env.PROTECTED_ADMIN_EMAIL || null,
  })
}

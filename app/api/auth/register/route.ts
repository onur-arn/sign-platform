import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { sendApprovalRequestEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'EMAIL_TAKEN' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, status: 'PENDING' },
    });

    // Notifie l'admin par email (silencieux si non configuré)
    await sendApprovalRequestEmail(user).catch(() => {});

    return NextResponse.json({
      message: 'Demande envoyée. Vous serez notifié par email une fois votre compte approuvé.',
    });
  } catch (error: any) {
    console.error('[register]', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Erreur serveur' }, { status: 500 });
  }
}

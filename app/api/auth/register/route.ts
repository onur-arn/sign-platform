import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { sendApprovalRequestEmail } from '@/lib/email'
import { fullName } from '@/lib/userName'
import { validatePassword } from '@/lib/password'
import { clientIp, rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { RATE } from '@/lib/request-limits'

export async function POST(req: Request) {
  try {
    const ip = clientIp(req)
    const limited = await rateLimit(`register:${ip}`, RATE.register.limit, RATE.register.windowMs)
    if (!limited.ok) return rateLimitResponse(limited.retryAfterSec)

    const body = await req.json()

    // Honeypot anti-bot (champ caché — doit rester vide)
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({
        message: 'Demande envoyée. Vous serez notifié par email une fois votre compte approuvé.',
      })
    }

    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const name = fullName(firstName, lastName, typeof body.name === 'string' ? body.name : null)

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 })
    }

    const pwd = validatePassword(password)
    if (!pwd.ok) {
      return NextResponse.json({ error: pwd.code }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'EMAIL_TAKEN' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name,
        status: 'PENDING',
      },
    })

    await sendApprovalRequestEmail(user).catch(() => {})

    return NextResponse.json({
      message: 'Demande envoyée. Vous serez notifié par email une fois votre compte approuvé.',
    })
  } catch (error: unknown) {
    console.error('[register]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim()
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!email || !password) {
    console.error('SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD doivent être définis dans .env')
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const firstName = 'Admin'
  const lastName = ''

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      firstName,
      lastName,
      name: 'Admin',
      status: 'APPROVED',
      role: 'ADMIN',
    },
    create: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      name: 'Admin',
      status: 'APPROVED',
      role: 'ADMIN',
    },
  })

  console.log('Compte admin prêt:', user.email, `(${user.role}, ${user.status})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

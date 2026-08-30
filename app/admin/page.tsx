import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user!.email! },
  })
  if (currentUser?.role !== 'ADMIN') redirect('/dashboard')

  redirect('/dashboard?tab=admin')
}

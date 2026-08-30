import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <div className="landing">
      <div className="landing-inner">
        <nav className="landing-nav">
          <div>
            <div className="font-display text-2xl font-semibold tracking-tight">Sign</div>
            <div className="text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--ink-muted)' }}>
              Platform
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/login" className="btn btn-ghost">
              Connexion
            </Link>
            <Link href="/register" className="btn btn-primary">
              Créer un compte
            </Link>
          </div>
        </nav>

        <section className="landing-hero">
          <h1>Sign</h1>
          <p>
            Traduisez texte et documents en langue des signes, avec des avatars et un dictionnaire
            vivant.
          </p>
          <div className="landing-cta">
            <Link href="/register" className="btn btn-primary">
              Commencer
            </Link>
            <Link href="/login" className="btn btn-ghost">
              J&apos;ai déjà un compte
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

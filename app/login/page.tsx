'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) setError(result.error)
      else if (result?.ok) router.push('/dashboard')
    } catch {
      setError(t.auth.errorOccurred)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="absolute top-6 right-6">
        <LanguageSelector variant="compact" />
      </div>
      <div className="auth-card">
        <p className="text-xs uppercase tracking-[0.14em] mb-3" style={{ color: 'var(--indigo)' }}>
          Sign Platform
        </p>
        <h1>{t.auth.loginTitle}</h1>
        <p className="sub">{t.auth.loginSubtitle}</p>

        {error && (
          <div
            className="mb-4 p-3 rounded-xl text-sm"
            style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">{t.auth.email}</label>
            <input
              className="field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="field-label">{t.auth.password}</label>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? '…' : t.auth.loginButton}
          </button>
        </form>

        <p className="mt-6 text-sm" style={{ color: 'var(--ink-muted)' }}>
          {t.auth.noAccount}{' '}
          <Link href="/register" style={{ color: 'var(--indigo)', fontWeight: 600 }}>
            {t.auth.createLink}
          </Link>
        </p>
        <Link href="/" className="block mt-3 text-sm" style={{ color: 'var(--ink-muted)' }}>
          {t.auth.backHome}
        </Link>
      </div>
    </div>
  )
}

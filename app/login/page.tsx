'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { translateAuthError } from '@/lib/authErrors'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
      if (result?.error) setError(translateAuthError(result.error, t.auth))
      else if (result?.ok) {
        // replace : pas d’historique login → dashboard ; évite un aller-retour lent
        router.replace('/dashboard')
      }
    } catch {
      setError(t.auth.errorOccurred)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="absolute top-6 left-6">
        <DarkModeToggle variant="overlay" />
      </div>
      <div className="absolute top-6 right-6">
        <LanguageSelector variant="compact" />
      </div>
      <div className="auth-card">
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
            <div className="relative">
              <input
                className="field pr-12"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: 'var(--text-sub)', background: 'none', border: 'none', padding: 0 }}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={t.auth.password}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? '…' : t.auth.loginButton}
          </button>
        </form>

        <div className="auth-card-foot">
          <p className="text-center">
            {t.auth.noAccount}{' '}
            <Link href="/register">{t.auth.createLink}</Link>
          </p>
          <Link href="/" className="auth-back text-center">
            {t.auth.backHome}
          </Link>
        </div>
      </div>
    </div>
  )
}

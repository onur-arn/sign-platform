'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { PASSWORD_MIN_LENGTH, validatePassword } from '@/lib/password'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    website: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError(t.auth.errorOccurred)
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t.auth.passwordMismatch)
      return
    }
    const pwd = validatePassword(formData.password)
    if (!pwd.ok) {
      setError(pwd.code === 'PASSWORD_WEAK' ? t.auth.passwordWeak : t.auth.passwordTooShort)
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          password: formData.password,
          website: formData.website,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 429 || data.error === 'RATE_LIMITED') setError(t.auth.rateLimited)
        else if (data.error === 'EMAIL_TAKEN') setError(t.auth.emailTaken)
        else if (data.error === 'PASSWORD_WEAK') setError(t.auth.passwordWeak)
        else if (data.error === 'PASSWORD_SHORT') setError(t.auth.passwordTooShort)
        else setError(t.auth.errorOccurred)
        setLoading(false)
        return
      }
      setSuccess(true)
    } catch {
      setError(t.auth.errorOccurred)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  if (success) {
    return (
      <div className="auth-page">
        <div className="absolute top-6 left-6">
          <DarkModeToggle variant="overlay" />
        </div>
        <div className="absolute top-6 right-6">
          <LanguageSelector variant="compact" />
        </div>
        <div className="auth-card text-center">
          <h1>{t.auth.successTitle}</h1>
          <p className="sub">
            {t.auth.successBodyBefore} <strong>{t.auth.successPending}</strong>. {t.auth.successBodyAfter}
          </p>
          <Link href="/login" className="btn btn-primary">
            {t.auth.backToLogin}
          </Link>
        </div>
      </div>
    )
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
        <h1>{t.auth.registerTitle}</h1>
        <p className="sub">{t.auth.registerSubtitle}</p>

        {error && (
          <div
            className="mb-4 p-3 rounded-xl text-sm"
            style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, opacity: 0 }}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">{t.auth.firstName}</label>
              <input
                className="field"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="field-label">{t.auth.lastName}</label>
              <input
                className="field"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
              />
            </div>
          </div>
          <div>
            <label className="field-label">{t.auth.email}</label>
            <input
              className="field"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={PASSWORD_MIN_LENGTH}
                autoComplete="new-password"
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
          <div>
            <label className="field-label">{t.auth.confirmPassword}</label>
            <div className="relative">
              <input
                className="field pr-12"
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={PASSWORD_MIN_LENGTH}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: 'var(--text-sub)', background: 'none', border: 'none', padding: 0 }}
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={t.auth.confirmPassword}
              >
                {showConfirm ? (
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
          <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
            {loading ? `${t.auth.registerButton}…` : t.auth.registerButton}
          </button>
        </form>

        <div className="auth-card-foot">
          <p className="text-center">
            {t.auth.hasAccount}{' '}
            <Link href="/login">{t.auth.loginLink}</Link>
          </p>
          <Link href="/" className="auth-back text-center">
            {t.auth.backHome}
          </Link>
        </div>
      </div>
    </div>
  )
}

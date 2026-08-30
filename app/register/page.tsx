'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) {
      setError(t.auth.passwordMismatch)
      return
    }
    if (formData.password.length < 6) {
      setError(t.auth.passwordTooShort)
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error === 'EMAIL_TAKEN' ? t.auth.emailTaken : t.auth.errorOccurred)
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
      <div className="absolute top-6 right-6">
        <LanguageSelector variant="compact" />
      </div>
      <div className="auth-card">
        <p className="text-xs uppercase tracking-[0.14em] mb-3" style={{ color: 'var(--indigo)' }}>
          Sign Platform
        </p>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">{t.auth.firstName}</label>
              <input className="field" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div>
              <label className="field-label">{t.auth.lastName}</label>
              <input className="field" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <label className="field-label">{t.auth.email}</label>
            <input className="field" type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="field-label">{t.auth.password}</label>
            <input
              className="field"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="field-label">{t.auth.confirmPassword}</label>
            <input
              className="field"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
            {loading ? '…' : t.auth.registerButton}
          </button>
        </form>

        <p className="mt-6 text-sm" style={{ color: 'var(--ink-muted)' }}>
          {t.auth.hasAccount}{' '}
          <Link href="/login" style={{ color: 'var(--indigo)', fontWeight: 600 }}>
            {t.auth.loginLink}
          </Link>
        </p>
      </div>
    </div>
  )
}

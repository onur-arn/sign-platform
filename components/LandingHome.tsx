'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'
import { DarkModeToggle } from '@/components/DarkModeToggle'

export default function LandingHome() {
  const { t } = useLanguage()
  const hasPrefix = Boolean(t.hero.titlePrefix?.trim())

  return (
    <div className="landing-page">
      <div className="landing-atmosphere" aria-hidden>
        <div className="landing-orb landing-orb-a" />
        <div className="landing-orb landing-orb-b" />
        <div className="landing-orb landing-orb-c" />
        <div className="landing-grid" />
        <div className="landing-glow" />
      </div>

      <header className="landing-top">
        <DarkModeToggle variant="overlay" />
        <LanguageSelector variant="compact" />
      </header>

      <main className="landing-hero-stage">
        <div className="landing-hero-copy">
          <p className="landing-kicker landing-rise" style={{ animationDelay: '40ms' }}>
            {t.hero.badge.replace(/✨/g, '').trim()}
          </p>

          <h1 className="landing-brand landing-rise" style={{ animationDelay: '120ms' }}>
            {hasPrefix ? (
              <>
                <span className="landing-brand-soft">{t.hero.titlePrefix}</span>{' '}
                <span className="landing-brand-strong">{t.hero.title}</span>
              </>
            ) : (
              <>
                <span className="landing-brand-strong">{t.hero.title}</span>{' '}
                <span className="landing-brand-soft">{t.hero.titleBold}</span>
              </>
            )}
          </h1>

          <p className="landing-lead landing-rise" style={{ animationDelay: '220ms' }}>
            {t.hero.subtitle}
          </p>

          <div className="landing-actions landing-rise" style={{ animationDelay: '320ms' }}>
            <Link href="/register" className="landing-btn landing-btn-primary">
              {t.hero.cta}
            </Link>
            <Link href="/login" className="landing-btn landing-btn-secondary">
              {t.hero.login}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

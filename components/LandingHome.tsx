'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'
import { DarkModeToggle } from '@/components/DarkModeToggle'

export default function LandingHome() {
  const { t, language } = useLanguage()
  const hasPrefix = Boolean(t.hero.titlePrefix?.trim())
  const badge = t.hero.badge.replace(/✨/g, '').trim()
  const ctaLabel = t.hero.cta
  const loginLabel = t.hero.login

  return (
    <div className="landing-page notranslate" lang={language} translate="no">
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
          <p className="landing-kicker">{badge}</p>

          <h1 className="landing-brand">
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

          <p className="landing-lead">{t.hero.subtitle}</p>

          <div className="landing-actions">
            {/* <a> natif : Next <Link> peut garder l’ancien libellé après changement i18n */}
            <a
              href="/register"
              className="landing-btn landing-btn-primary notranslate"
              hrefLang={language}
              translate="no"
            >
              {ctaLabel}
            </a>
            <a
              href="/login"
              className="landing-btn landing-btn-secondary notranslate"
              hrefLang={language}
              translate="no"
            >
              {loginLabel}
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

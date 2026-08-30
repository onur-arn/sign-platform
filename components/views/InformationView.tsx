'use client'

import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

type Carrier = {
  src: string
  name: string
  href?: string
}

type Partner = {
  src: string
  alt: string
  href?: string
}

const carriers: Carrier[] = [
  {
    src: '/logo-project.jpg',
    name: 'Hearken the Youth',
  },
  {
    href: 'https://letsdoitturkey.com',
    src: '/logo-letsdoitturkey.png',
    name: "Let's Do It Türkiye",
  },
]

const partners: Partner[] = [
  { src: '/logo-project.jpg', alt: 'Hearken the Youth' },
  { src: '/logo-letsdoitturkey.png', alt: "Let's Do It Turkey", href: 'https://letsdoitturkey.com' },
  { src: '/logo-youthstation.png', alt: 'Youth Station' },
  { src: '/logo-ulusal-ajans.png', alt: 'Türkiye Ulusal Ajansı', href: 'https://www.ua.gov.tr' },
  {
    src: '/logo-eu.png',
    alt: 'Co-funded by the European Union',
    href: 'https://european-union.europa.eu',
  },
]

export default function InformationView() {
  const { t } = useLanguage()

  const features = [
    { emoji: '📄', title: t.features.pdf.title, desc: t.features.pdf.desc },
    { emoji: '🎤', title: t.features.voice.title, desc: t.features.voice.desc },
    { emoji: '🎥', title: t.features.video.title, desc: t.features.video.desc },
  ]

  const tags = [t.about.tagDeaf, t.about.tagMute, t.about.tagMobility]

  const developedBy = t.about.developedBy
  const contactLabel = t.about.contact

  return (
    <div className="info-page">
      <section className="panel info-block">
        <p className="info-eyebrow">{t.about.carriedBy}</p>

        <div className="info-carriers">
          {carriers.map((org) => {
            const inner = (
              <>
                <Image
                  src={org.src}
                  alt={org.name}
                  width={160}
                  height={80}
                  className="info-carrier-logo"
                />
                <span className="info-carrier-name">{org.name}</span>
                {org.href ? (
                  <span className="info-carrier-visit">{t.about.visit} →</span>
                ) : null}
              </>
            )

            if (org.href) {
              return (
                <a
                  key={org.src}
                  href={org.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-carrier"
                >
                  {inner}
                </a>
              )
            }

            return (
              <div key={org.src} className="info-carrier info-carrier-static">
                {inner}
              </div>
            )
          })}
        </div>

        <p className="info-lead">{t.about.description}</p>

        <div className="info-tags">
          {tags.map((tag) => (
            <span key={tag} className="info-tag">
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="panel info-block">
        <div className="info-features">
          {features.map((f) => (
            <div key={f.title} className="info-feature">
              <div className="info-feature-emoji" aria-hidden>
                {f.emoji}
              </div>
              <h3 className="info-feature-title">{f.title}</h3>
              <p className="info-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel info-block">
        <p className="info-eyebrow">{t.about.partners}</p>
        <div className="info-partners">
          {partners.map((logo) => {
            const img = (
              <Image
                src={logo.src}
                alt={logo.alt}
                width={220}
                height={100}
                className="info-partner-logo"
              />
            )

            if (logo.href) {
              return (
                <a
                  key={logo.src}
                  href={logo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-partner"
                  title={logo.alt}
                >
                  {img}
                </a>
              )
            }

            return (
              <div key={logo.src} className="info-partner info-partner-static" title={logo.alt}>
                {img}
              </div>
            )
          })}
        </div>
      </section>

      <p className="info-foot">
        {developedBy} <strong>Onur Arslan</strong>
        {' · '}
        {contactLabel}{' '}
        <a href="mailto:secretaire@youthstation.org">secretaire@youthstation.org</a>
      </p>
    </div>
  )
}

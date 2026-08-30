'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import type { Language } from '@/lib/i18n/translations'

interface LanguageSelectorProps {
  variant?: 'default' | 'compact'
}

export default function LanguageSelector({ variant = 'default' }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage()

  const languages: { code: Language; label: string }[] = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
    { code: 'tr', label: 'TR' },
  ]

  return (
    <div
      className="flex gap-1 p-1 rounded-[10px]"
      style={{ border: '1px solid var(--line)', background: 'color-mix(in srgb, var(--paper) 70%, transparent)' }}
    >
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => setLanguage(lang.code)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          style={
            language === lang.code
              ? { background: 'var(--indigo)', color: '#f7f4ee' }
              : { color: 'var(--ink-muted)', background: 'transparent' }
          }
          title={lang.label}
        >
          {variant === 'compact' ? lang.label : lang.label}
        </button>
      ))}
    </div>
  )
}

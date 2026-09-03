'use client'

import { startTransition } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useDarkMode } from '@/contexts/DarkModeContext'
import type { Language } from '@/lib/i18n/translations'

interface LanguageSelectorProps {
  variant?: 'default' | 'compact'
}

export default function LanguageSelector({ variant = 'default' }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage()
  const { dark } = useDarkMode()

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  ]

  const onSelect = (code: Language) => {
    startTransition(() => setLanguage(code))
  }

  if (variant === 'compact') {
    return (
      <div
        className="flex gap-1 p-1 rounded-xl border font-sans"
        style={{
          background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
          borderColor: 'rgba(91,164,176,0.25)',
        }}
      >
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => onSelect(lang.code)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer font-sans"
            style={
              language === lang.code
                ? { background: '#5ba4b0', color: '#ffffff' }
                : { color: dark ? 'rgba(255,255,255,0.65)' : '#5ba4b0' }
            }
            title={lang.label}
          >
            {lang.flag}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div
      className="border rounded-2xl p-2 shadow-md flex gap-2 font-sans"
      style={{
        background: dark ? 'rgba(255,255,255,0.06)' : '#ffffff',
        borderColor: 'rgba(91,164,176,0.2)',
      }}
    >
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onSelect(lang.code)}
          className="px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer font-sans"
          style={
            language === lang.code
              ? { background: '#5ba4b0', color: '#ffffff' }
              : { color: dark ? 'rgba(255,255,255,0.65)' : '#4a7a84' }
          }
        >
          <span className="mr-2">{lang.flag}</span>
          {lang.label}
        </button>
      ))}
    </div>
  )
}

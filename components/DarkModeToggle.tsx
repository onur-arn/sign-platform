'use client'

import { useDarkMode } from '@/contexts/DarkModeContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface Props {
  variant?: 'overlay' | 'solid'
}

export function DarkModeToggle({ variant = 'solid' }: Props) {
  const { dark, toggleDark } = useDarkMode()
  const { t } = useLanguage()

  return (
    <button
      type="button"
      onClick={toggleDark}
      title={dark ? t.dashboard.lightMode : t.dashboard.darkMode}
      className="inline-flex items-center justify-center cursor-pointer"
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        background: variant === 'overlay' ? 'var(--bg)' : 'var(--teal-soft)',
        border: '1px solid var(--teal-border-strong)',
      }}
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f0d060" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5ba4b0" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}

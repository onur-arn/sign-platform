'use client'

import { useDarkMode } from '@/contexts/DarkModeContext'

interface Props {
  variant?: 'overlay' | 'solid'
}

export function DarkModeToggle({ variant = 'solid' }: Props) {
  const { dark, toggleDark } = useDarkMode()

  return (
    <button
      type="button"
      onClick={toggleDark}
      title={dark ? 'Mode clair' : 'Mode sombre'}
      className="inline-flex items-center justify-center cursor-pointer"
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background:
          variant === 'overlay'
            ? 'color-mix(in srgb, var(--paper) 80%, transparent)'
            : 'var(--indigo-wash)',
        border: '1px solid var(--line)',
      }}
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}

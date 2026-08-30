'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { translations, type Language } from '@/lib/i18n/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (typeof translations)[Language]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function isLanguage(value: string | null): value is Language {
  return !!value && value in translations
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr')

  useEffect(() => {
    const saved = localStorage.getItem('language')
    if (isLanguage(saved)) {
      setLanguageState(saved)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    // i18n géré par l'app — empêche Chrome/Safari de traduire et laisser des textes figés
    document.documentElement.setAttribute('translate', 'no')
    document.documentElement.classList.add('notranslate')
  }, [language])

  const setLanguage = useCallback((lang: Language) => {
    if (!isLanguage(lang)) return
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }, [])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language],
    }),
    [language, setLanguage],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

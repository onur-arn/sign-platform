'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface DarkModeCtx {
  dark: boolean
  toggleDark: () => void
}

const DarkModeContext = createContext<DarkModeCtx>({ dark: false, toggleDark: () => {} })

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved === 'true') setDark(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const toggleDark = () => {
    setDark((d) => {
      localStorage.setItem('darkMode', String(!d))
      return !d
    })
  }

  return <DarkModeContext.Provider value={{ dark, toggleDark }}>{children}</DarkModeContext.Provider>
}

export const useDarkMode = () => useContext(DarkModeContext)

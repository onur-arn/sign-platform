'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Sidebar, { type DashboardTab } from '@/components/layout/Sidebar'
import LanguageSelector from '@/components/LanguageSelector'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import TraduireView from '@/components/views/TraduireView'
import DictionnaireView from '@/components/views/DictionnaireView'
import DocumentsView from '@/components/views/DocumentsView'
import AvatarStudioView from '@/components/views/AvatarStudioView'
import InformationView from '@/components/views/InformationView'
import AdminPanelView from '@/components/views/AdminPanelView'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  const [tab, setTab] = useState<DashboardTab>('traduire')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('tab')
    if (
      q === 'traduire' ||
      q === 'dictionnaire' ||
      q === 'documents' ||
      q === 'avatar' ||
      q === 'information' ||
      q === 'admin'
    ) {
      setTab(q)
    }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    const sync = () => setSidebarOpen(!mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Préchauffe le dictionnaire hors chemin critique (évite de bloquer le clic langue)
  useEffect(() => {
    const id = window.setTimeout(() => {
      void import('@/lib/dictionaryEntries').then(({ warmDictionaryCache }) => {
        warmDictionaryCache('all')
      })
    }, 600)
    return () => window.clearTimeout(id)
  }, [])

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'ADMIN'

  useEffect(() => {
    if (!isAdmin && tab === 'admin') setTab('traduire')
  }, [isAdmin, tab])

  if (status === 'loading') {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-14 w-14 border-4 mx-auto"
            style={{ borderColor: 'rgba(91,164,176,0.2)', borderTopColor: '#5ba4b0' }}
          />
          <p className="mt-5 font-medium" style={{ color: 'var(--text-sub)' }}>
            {t.dashboard.loading}
          </p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const titles: Record<DashboardTab, string> = {
    traduire: t.dashboard.navTranslate,
    dictionnaire: t.dashboard.navDictionary,
    documents: t.dashboard.navDocuments,
    avatar: t.dashboard.navAvatar,
    information: t.dashboard.navInformation,
    admin: t.dashboard.navAdmin,
  }

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar
        active={tab}
        onChange={setTab}
        isAdmin={isAdmin}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => signOut({ callbackUrl: '/' })}
      />

      <div className="shell-main">
        <header className="shell-top">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="sidebar-toggle btn btn-ghost"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={t.dashboard.toggleMenu}
              aria-expanded={sidebarOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1>{titles[tab]}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector variant="compact" />
            <DarkModeToggle />
          </div>
        </header>

        <main className="shell-content">
          {tab === 'traduire' && <TraduireView />}
          {tab === 'dictionnaire' && <DictionnaireView />}
          {tab === 'documents' && <DocumentsView />}
          {tab === 'avatar' && <AvatarStudioView />}
          {tab === 'information' && <InformationView />}
          {tab === 'admin' && isAdmin && <AdminPanelView />}
        </main>
      </div>
    </div>
  )
}

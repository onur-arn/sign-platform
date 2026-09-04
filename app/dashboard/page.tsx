'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Sidebar, { type DashboardTab } from '@/components/layout/Sidebar'
import LanguageSelector from '@/components/LanguageSelector'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import TraduireView from '@/components/views/TraduireView'
import { useLanguage } from '@/contexts/LanguageContext'

function ViewFallback() {
  const { t } = useLanguage()
  return (
    <div className="grid place-items-center min-h-[240px]">
      <p style={{ color: 'var(--text-sub)' }}>{t.dashboard.loading}</p>
    </div>
  )
}

/** Vues secondaires : chargées à la demande (évite de bloquer le login). */
const DictionnaireView = dynamic(() => import('@/components/views/DictionnaireView'), {
  ssr: false,
  loading: () => <ViewFallback />,
})
const DocumentsView = dynamic(() => import('@/components/views/DocumentsView'), {
  ssr: false,
  loading: () => <ViewFallback />,
})
const AvatarStudioView = dynamic(() => import('@/components/views/AvatarStudioView'), {
  ssr: false,
  loading: () => <ViewFallback />,
})
const InformationView = dynamic(() => import('@/components/views/InformationView'), {
  ssr: false,
  loading: () => <ViewFallback />,
})
const AdminPanelView = dynamic(() => import('@/components/views/AdminPanelView'), {
  ssr: false,
  loading: () => <ViewFallback />,
})

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

  // Précharge les autres onglets hors chemin critique (après affichage de Traduire)
  useEffect(() => {
    if (status !== 'authenticated') return
    const id = window.setTimeout(() => {
      void import('@/components/views/DictionnaireView')
      void import('@/components/views/DocumentsView')
      void import('@/components/views/AvatarStudioView')
      void import('@/components/views/InformationView')
      void import('@/components/views/AdminPanelView')
      void import('@/lib/dictionaryEntries').then(({ warmDictionaryCache }) => {
        warmDictionaryCache('fr')
      })
    }, 2500)
    return () => window.clearTimeout(id)
  }, [status])

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
          <Suspense fallback={<ViewFallback />}>
            {tab === 'traduire' && <TraduireView />}
            {tab === 'dictionnaire' && <DictionnaireView />}
            {tab === 'documents' && <DocumentsView />}
            {tab === 'avatar' && <AvatarStudioView />}
            {tab === 'information' && <InformationView />}
            {tab === 'admin' && isAdmin && <AdminPanelView />}
          </Suspense>
        </main>
      </div>
    </div>
  )
}

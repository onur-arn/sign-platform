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
import ParametresView from '@/components/views/ParametresView'
import AdminPanelView from '@/components/views/AdminPanelView'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  const [tab, setTab] = useState<DashboardTab>('traduire')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen grid place-items-center">
        <p style={{ color: 'var(--ink-muted)' }}>{t.dashboard.loading}</p>
      </div>
    )
  }

  if (!session) return null

  const isAdmin = (session.user as { role?: string }).role === 'ADMIN'
  const labels: Record<DashboardTab, string> = {
    traduire: t.dashboard.translate,
    dictionnaire: t.admin.dictionary,
    documents: t.dashboard.pdf,
    avatar: 'Avatar',
    parametres: 'Paramètres',
    admin: t.dashboard.admin,
  }

  const titles: Record<DashboardTab, string> = {
    traduire: 'Traduire',
    dictionnaire: 'Dictionnaire',
    documents: 'Documents',
    avatar: 'Avatar',
    parametres: 'Paramètres',
    admin: 'Admin',
  }

  return (
    <div className="app-shell">
      <Sidebar
        active={tab}
        onChange={setTab}
        isAdmin={isAdmin}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => signOut({ callbackUrl: '/' })}
        labels={labels}
        logoutLabel={t.dashboard.logout}
      />

      <div className="shell-main">
        <header className="shell-top">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="mobile-nav-toggle btn btn-ghost"
              onClick={() => setSidebarOpen(true)}
              aria-label="Menu"
            >
              ☰
            </button>
            <h1 className="font-display text-xl m-0">{titles[tab]}</h1>
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
          {tab === 'parametres' && <ParametresView />}
          {tab === 'admin' && isAdmin && <AdminPanelView />}
        </main>
      </div>
    </div>
  )
}

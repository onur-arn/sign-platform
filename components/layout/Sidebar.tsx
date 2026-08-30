'use client'

import type { ReactNode } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export type DashboardTab =
  | 'traduire'
  | 'dictionnaire'
  | 'documents'
  | 'avatar'
  | 'information'
  | 'admin'

type NavItem = {
  id: DashboardTab
  label: string
  icon: ReactNode
  adminOnly?: boolean
}

const icons = {
  traduire: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 7h11M9 7V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2M7 21l3.5-10h1L15 21M8.5 17h5" />
      <path d="M17 11h3M18.5 11v8M17 19h3" />
    </svg>
  ),
  dictionnaire: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  documents: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  avatar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  information: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.75" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="currentColor"
        fontSize="12"
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        i
      </text>
    </svg>
  ),
  admin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
}

type Props = {
  active: DashboardTab
  onChange: (tab: DashboardTab) => void
  isAdmin: boolean
  open: boolean
  onClose: () => void
  onLogout: () => void
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: NavItem
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {item.icon}
      <span>{item.label}</span>
    </button>
  )
}

export default function Sidebar({
  active,
  onChange,
  isAdmin,
  open,
  onClose,
  onLogout,
}: Props) {
  const { t } = useLanguage()

  const mainItems: NavItem[] = [
    { id: 'traduire', label: t.dashboard.navTranslate, icon: icons.traduire },
    { id: 'dictionnaire', label: t.dashboard.navDictionary, icon: icons.dictionnaire },
    { id: 'documents', label: t.dashboard.navDocuments, icon: icons.documents },
  ]

  const footItems: NavItem[] = [
    { id: 'avatar', label: t.dashboard.navAvatar, icon: icons.avatar },
    { id: 'information', label: t.dashboard.navInformation, icon: icons.information },
    { id: 'admin', label: t.dashboard.navAdmin, icon: icons.admin, adminOnly: true },
  ]

  const selectTab = (id: DashboardTab) => {
    onChange(id)
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches) {
      onClose()
    }
  }

  const visibleFoot = footItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label={t.dashboard.closeMenu}
          className="sidebar-backdrop"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            {t.dashboard.titlePrefix ? (
              <>
                <span>{t.dashboard.titlePrefix}</span> {t.dashboard.title}
              </>
            ) : (
              <>
                {t.dashboard.title} <span>{t.dashboard.titleBold}</span>
              </>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {mainItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={active === item.id}
              onClick={() => selectTab(item.id)}
            />
          ))}
        </nav>

        <div className="sidebar-foot">
          {visibleFoot.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={active === item.id}
              onClick={() => selectTab(item.id)}
            />
          ))}
          <div className="sidebar-foot-divider" aria-hidden />
          <button type="button" className="nav-item" onClick={onLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>{t.dashboard.logout}</span>
          </button>
        </div>
      </aside>
    </>
  )
}

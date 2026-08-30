'use client'

import type { ReactNode } from 'react'

export type DashboardTab =
  | 'traduire'
  | 'dictionnaire'
  | 'documents'
  | 'avatar'
  | 'parametres'
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
  parametres: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
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
  labels: Record<DashboardTab, string>
  logoutLabel: string
}

export default function Sidebar({
  active,
  onChange,
  isAdmin,
  open,
  onClose,
  onLogout,
  labels,
  logoutLabel,
}: Props) {
  const items: NavItem[] = [
    { id: 'traduire', label: labels.traduire, icon: icons.traduire },
    { id: 'dictionnaire', label: labels.dictionnaire, icon: icons.dictionnaire },
    { id: 'documents', label: labels.documents, icon: icons.documents },
    { id: 'avatar', label: labels.avatar, icon: icons.avatar },
    { id: 'parametres', label: labels.parametres, icon: icons.parametres },
    { id: 'admin', label: labels.admin, icon: icons.admin, adminOnly: true },
  ]

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">Sign</div>
          <div className="brand-sub">Platform</div>
        </div>

        <nav className="sidebar-nav">
          {items
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${active === item.id ? 'active' : ''}`}
                onClick={() => {
                  onChange(item.id)
                  onClose()
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
        </nav>

        <div className="sidebar-foot">
          <button type="button" className="nav-item" onClick={onLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>{logoutLabel}</span>
          </button>
        </div>
      </aside>
    </>
  )
}

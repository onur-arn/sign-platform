'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { SIGN_LABELS_FR } from '@/lib/signLabels'
import { displayParts } from '@/lib/userName'

const SIGNS_COUNT = Object.keys(SIGN_LABELS_FR).length

interface UserRow {
  id: string
  firstName?: string | null
  lastName?: string | null
  name: string | null
  email: string
  status: string
  role: string
  createdAt: string
}

function statusClass(status: string) {
  if (status === 'APPROVED') return 'admin-badge admin-badge-ok'
  if (status === 'REJECTED') return 'admin-badge admin-badge-no'
  return 'admin-badge admin-badge-wait'
}

export default function AdminPanelView() {
  const { data: session } = useSession()
  const { t, language } = useLanguage()
  const [users, setUsers] = useState<UserRow[]>([])
  const [protectedEmail, setProtectedEmail] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const currentEmail = session?.user?.email?.toLowerCase() ?? null
  const currentUserId = (session?.user as { id?: string } | undefined)?.id ?? null

  const locale =
    language === 'tr'
      ? 'tr-TR'
      : language === 'en'
        ? 'en-GB'
        : language === 'pl'
          ? 'pl-PL'
          : 'fr-FR'

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) {
        setError(t.dashboard.loadUsersError)
        return
      }
      const data = await res.json()
      setUsers(data.users ?? [])
      setProtectedEmail(data.protectedAdminEmail ?? null)
      setLastUpdate(new Date())
      setError(null)
    } catch {
      setError(t.dashboard.networkError)
    }
  }, [t])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 30000)
    return () => clearInterval(id)
  }, [refresh])

  const pending = users.filter((u) => u.status === 'PENDING')
  const rejected = users.filter((u) => u.status === 'REJECTED')

  const act = async (path: string, body: object, userId: string) => {
    setLoadingId(userId)
    setError(null)
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (path.includes('/role')) {
          setError(
            res.status === 400
              ? t.admin.cannotChangeOwnRole
              : typeof data.error === 'string'
                ? data.error
                : t.admin.roleChangeFailed,
          )
        } else {
          setError(typeof data.error === 'string' ? data.error : t.dashboard.networkError)
        }
      }
    } catch {
      setError(t.dashboard.networkError)
    }
    setLoadingId(null)
    await refresh()
  }

  const person = (u: UserRow) => displayParts(u)

  return (
    <div className="space-y-5">
      <div className="admin-stats">
        <div className="panel admin-stat">
          <p className="panel-desc" style={{ marginBottom: 0 }}>
            {t.admin.users}
          </p>
          <p className="admin-stat-value">{users.length}</p>
        </div>
        <div className="panel admin-stat">
          <p className="panel-desc" style={{ marginBottom: 0 }}>
            {t.admin.availableWords}
          </p>
          <p className="admin-stat-value">{SIGNS_COUNT}</p>
        </div>
        <div className="admin-refresh">
          <p className="text-xs" style={{ color: 'var(--text-sub)' }}>
            {t.admin.lastUpdate}
          </p>
          <p className="font-mono text-xs" style={{ color: 'var(--text-sub)' }}>
            {lastUpdate
              ? lastUpdate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : '—'}
          </p>
          <button type="button" className="btn btn-ghost mt-2" onClick={refresh}>
            {t.admin.refresh}
          </button>
        </div>
      </div>
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

      {pending.length > 0 && (
        <div className="panel admin-pending">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg m-0">{t.admin.pendingSection}</h3>
            <span className="admin-count">{pending.length}</span>
          </div>
          <ul className="space-y-2">
            {pending.map((u) => {
              const { firstName, lastName } = person(u)
              return (
                <li key={u.id} className="admin-user-row">
                  <div>
                    <strong>
                      {firstName} {lastName}
                    </strong>
                    <div style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>{u.email}</div>
                    <div style={{ color: 'var(--text-sub)', fontSize: '0.75rem' }}>
                      {new Date(u.createdAt).toLocaleString(locale)}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={loadingId === u.id}
                      onClick={() => act('/api/admin/approve', { userId: u.id, action: 'approve' }, u.id)}
                    >
                      {loadingId === u.id ? '…' : t.admin.approve}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={loadingId === u.id}
                      onClick={() => act('/api/admin/approve', { userId: u.id, action: 'reject' }, u.id)}
                    >
                      {t.admin.reject}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {rejected.length > 0 && (
        <div className="panel admin-rejected">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg m-0">{t.admin.rejectedSection}</h3>
            <span className="admin-count admin-count-no">{rejected.length}</span>
          </div>
          <ul className="space-y-2">
            {rejected.map((u) => {
              const { firstName, lastName } = person(u)
              return (
                <li key={u.id} className="admin-user-row">
                  <div>
                    <strong>
                      {firstName} {lastName}
                    </strong>
                    <div style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>{u.email}</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={loadingId === u.id}
                    onClick={() => act('/api/admin/approve', { userId: u.id, action: 'approve' }, u.id)}
                  >
                    {t.admin.approveAnyway}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="panel">
        <h3 className="text-lg mb-3">
          {t.admin.usersTable} ({users.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t.admin.colFirstName}</th>
                <th>{t.admin.colLastName}</th>
                <th>{t.admin.colEmail}</th>
                <th>{t.admin.colStatus}</th>
                <th>{t.admin.colRole}</th>
                <th>{t.admin.colAdminAccess}</th>
                <th>{t.admin.colCreated}</th>
                <th>{t.admin.colAction}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const { firstName, lastName } = person(u)
                const isProtected = Boolean(protectedEmail && u.email === protectedEmail)
                const isSelf =
                  (currentUserId != null && u.id === currentUserId) ||
                  (currentEmail != null && u.email.toLowerCase() === currentEmail)
                const roleLocked = isProtected || isSelf

                return (
                  <tr key={u.id}>
                    <td>{firstName || '—'}</td>
                    <td>{lastName || '—'}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={statusClass(u.status)}>{u.status}</span>
                    </td>
                    <td>
                      <span className={u.role === 'ADMIN' ? 'admin-badge admin-badge-role' : 'admin-badge'}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {isProtected ? (
                        <span style={{ color: 'var(--text-sub)', fontSize: '0.8rem' }}>{t.admin.mainAccount}</span>
                      ) : isSelf ? (
                        <span style={{ color: 'var(--text-sub)', fontSize: '0.8rem' }}>{t.admin.ownAccount}</span>
                      ) : u.role === 'ADMIN' ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={loadingId === u.id}
                          onClick={() => act('/api/admin/role', { userId: u.id, role: 'USER' }, u.id)}
                        >
                          {t.admin.revokeAccess}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={loadingId === u.id}
                          onClick={() => act('/api/admin/role', { userId: u.id, role: 'ADMIN' }, u.id)}
                        >
                          {t.admin.grantAccess}
                        </button>
                      )}
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString(locale)}</td>
                    <td>
                      {!roleLocked && (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger-text"
                          disabled={loadingId === u.id}
                          onClick={() => {
                            if (confirm(`${t.admin.deleteConfirm} "${u.email}" ?`)) {
                              act('/api/admin/delete-user', { userId: u.id }, u.id)
                            }
                          }}
                        >
                          {t.admin.deleteAccount}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

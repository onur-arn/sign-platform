'use client'

import { useEffect, useState, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface UserRow {
  id: string
  name: string | null
  email: string
  status: string
  role: string
  createdAt: string
}

export default function AdminPanelView() {
  const { t } = useLanguage()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) {
        setError('Impossible de charger les utilisateurs')
        return
      }
      const data = await res.json()
      setUsers(data.users ?? [])
      setError(null)
    } catch {
      setError('Erreur réseau')
    }
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 30000)
    return () => clearInterval(id)
  }, [refresh])

  const pending = users.filter((u) => u.status === 'PENDING')
  const rejected = users.filter((u) => u.status === 'REJECTED')

  const act = async (path: string, body: object, userId: string) => {
    setLoadingId(userId)
    await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setLoadingId(null)
    await refresh()
  }

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="panel-title">{t.admin.title}</h2>
            <p className="panel-desc" style={{ marginBottom: 0 }}>
              {users.length} utilisateurs
            </p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={refresh}>
            {t.admin.refresh}
          </button>
        </div>
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      </div>

      {pending.length > 0 && (
        <div className="panel">
          <h3 className="font-display text-lg mb-3">{t.admin.pendingSection}</h3>
          <ul className="space-y-2">
            {pending.map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
                style={{ borderBottom: '1px solid var(--line)' }}
              >
                <div>
                  <strong>{u.name ?? '—'}</strong>
                  <div style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>{u.email}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={loadingId === u.id}
                    onClick={() => act('/api/admin/approve', { userId: u.id, action: 'approve' }, u.id)}
                  >
                    {t.admin.approve}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={loadingId === u.id}
                    onClick={() => act('/api/admin/approve', { userId: u.id, action: 'reject' }, u.id)}
                  >
                    {t.admin.reject}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rejected.length > 0 && (
        <div className="panel">
          <h3 className="font-display text-lg mb-3">{t.admin.rejectedSection}</h3>
          <ul className="space-y-2">
            {rejected.map((u) => (
              <li key={u.id} className="flex justify-between gap-2 py-2" style={{ borderBottom: '1px solid var(--line)' }}>
                <span>{u.email}</span>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={loadingId === u.id}
                  onClick={() => act('/api/admin/approve', { userId: u.id, action: 'approve' }, u.id)}
                >
                  {t.admin.approveAnyway}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="panel">
        <h3 className="font-display text-lg mb-3">{t.admin.usersTable}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--ink-muted)', textAlign: 'left' }}>
                <th className="py-2">Nom</th>
                <th>Email</th>
                <th>Statut</th>
                <th>Rôle</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: '1px solid var(--line)' }}>
                  <td className="py-2">{u.name ?? '—'}</td>
                  <td>{u.email}</td>
                  <td>{u.status}</td>
                  <td>{u.role}</td>
                  <td className="py-2">
                    <div className="flex gap-2 justify-end">
                      {u.role !== 'ADMIN' ? (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          disabled={loadingId === u.id}
                          onClick={() => act('/api/admin/role', { userId: u.id, role: 'ADMIN' }, u.id)}
                        >
                          {t.admin.grantAccess}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          disabled={loadingId === u.id}
                          onClick={() => act('/api/admin/role', { userId: u.id, role: 'USER' }, u.id)}
                        >
                          {t.admin.revokeAccess}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={loadingId === u.id}
                        onClick={() => {
                          if (confirm(`${t.admin.deleteConfirm} "${u.email}" ?`)) {
                            act('/api/admin/delete-user', { userId: u.id }, u.id)
                          }
                        }}
                        style={{ color: 'var(--danger)' }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

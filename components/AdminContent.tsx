'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import SignDictionary from '@/components/SignDictionary';
import { SIGN_LABELS_FR } from '@/lib/signLabels';

const SIGNS_COUNT = Object.keys(SIGN_LABELS_FR).length;

interface User {
  id: string;
  name: string | null;
  email: string;
  status: string;
  role: string;
  createdAt: Date;
}

interface AdminContentProps {
  users: User[];
}

export default function AdminContent(initial: AdminContentProps) {
  const { t, language } = useLanguage();
  const { dark } = useDarkMode();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [users, setUsers] = useState(initial.users);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => { setLastUpdate(new Date()); }, []);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/admin/stats');
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.users);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const pendingUsers = users.filter(u => u.status === 'PENDING');
  const rejectedUsers = users.filter(u => u.status === 'REJECTED');

  const handleRoleChange = async (userId: string, role: 'USER' | 'ADMIN') => {
    setLoadingId(userId);
    await fetch('/api/admin/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    setLoadingId(null);
    await refresh();
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`${t.admin.deleteConfirm} "${email}" ?`)) return;
    setLoadingId(userId);
    await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    setLoadingId(null);
    await refresh();
  };

  const handleApproval = async (userId: string, action: 'approve' | 'reject') => {
    setLoadingId(userId);
    await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    });
    setLoadingId(null);
    await refresh();
  };

  const bg       = dark ? '#05191e' : '#ffffff';
  const hdrBg    = dark ? '#07202a' : '#ffffff';
  const textMain = dark ? 'rgba(255,255,255,0.9)' : '#1e3a40';
  const textSub  = dark ? 'rgba(255,255,255,0.5)' : '#4a7a84';
  const cardBg   = dark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const border   = 'rgba(91,164,176,0.2)';
  const sectionBg = dark ? 'rgba(91,164,176,0.06)' : 'rgba(91,164,176,0.04)';
  const rowHover  = dark ? 'rgba(91,164,176,0.06)' : 'rgba(91,164,176,0.03)';

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: bg }}>
      {/* Header */}
      <header className="shadow-sm border-b transition-colors duration-500" style={{ background: hdrBg, borderColor: border }}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: textMain }}>🔧 {t.admin.title}</h1>
              <p className="text-sm mt-1" style={{ color: textSub }}>{t.admin.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DarkModeToggle />
              <LanguageSelector variant="compact" />
              <Link
                href="/dashboard"
                className="px-5 py-2.5 text-white rounded-xl font-medium text-sm transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer"
                style={{ background: '#5ba4b0' }}
              >
                ← {t.admin.back}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div className="rounded-2xl shadow-sm p-6 border-l-4" style={{ background: cardBg, borderLeftColor: '#5ba4b0', borderTop: `1px solid ${border}`, borderRight: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: textSub }}>{t.admin.users}</p>
                  <p className="text-4xl font-bold mt-2" style={{ color: textMain }}>{users.length}</p>
                </div>
                <div className="text-5xl">👥</div>
              </div>
            </div>
            <div className="rounded-2xl shadow-sm p-6" style={{ background: cardBg, border: `1px solid ${border}`, borderLeftWidth: 4, borderLeftColor: '#10b981' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: textSub }}>
                    {language === 'fr' ? 'Mots disponibles' : language === 'tr' ? 'Mevcut kelimeler' : 'Available words'}
                  </p>
                  <p className="text-4xl font-bold mt-2" style={{ color: textMain }}>{SIGNS_COUNT}</p>
                </div>
                <div className="text-5xl">🤟</div>
              </div>
            </div>
          </div>
          <div className="ml-6 text-right text-xs shrink-0" style={{ color: textSub }}>
            <p>{t.admin.lastUpdate}</p>
            <p className="font-mono">
              {lastUpdate ? `${String(lastUpdate.getHours()).padStart(2,'0')}:${String(lastUpdate.getMinutes()).padStart(2,'0')}:${String(lastUpdate.getSeconds()).padStart(2,'0')}` : '—'}
            </p>
            <button onClick={refresh} className="mt-2 px-3 py-1 rounded-lg transition-all hover:shadow-sm cursor-pointer"
              style={{ background: sectionBg, color: '#5ba4b0', border: `1px solid ${border}` }}>
              ↻ {t.admin.refresh}
            </button>
          </div>
        </div>

        {/* Demandes en attente */}
        {pendingUsers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '2px solid #f59e0b' }}>
            <div className="px-6 py-4 border-b border-amber-200 bg-amber-50 flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <h2 className="text-xl font-bold" style={{ color: '#1e3a40' }}>{t.admin.pendingSection}</h2>
              <span className="ml-auto bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full">{pendingUsers.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {pendingUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between px-6 py-4 hover:bg-amber-50/30 transition-colors">
                  <div>
                    <p className="font-semibold" style={{ color: '#1e3a40' }}>{user.name || '—'}</p>
                    <p className="text-sm" style={{ color: '#4a7a84' }}>{user.email}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#4a7a84' }}>{new Date(user.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproval(user.id, 'approve')}
                      disabled={loadingId === user.id}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loadingId === user.id ? '…' : `✓ ${t.admin.approve}`}
                    </button>
                    <button
                      onClick={() => handleApproval(user.id, 'reject')}
                      disabled={loadingId === user.id}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loadingId === user.id ? '…' : `✗ ${t.admin.reject}`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comptes refusés */}
        {rejectedUsers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '2px solid #fca5a5' }}>
            <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center gap-3">
              <span className="text-2xl">✗</span>
              <h2 className="text-xl font-bold" style={{ color: '#1e3a40' }}>{t.admin.rejectedSection}</h2>
              <span className="ml-auto bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">{rejectedUsers.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {rejectedUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between px-6 py-4 hover:bg-red-50/30 transition-colors">
                  <div>
                    <p className="font-semibold" style={{ color: '#1e3a40' }}>{user.name || '—'}</p>
                    <p className="text-sm" style={{ color: '#4a7a84' }}>{user.email}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#4a7a84' }}>{new Date(user.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                  <button
                    onClick={() => handleApproval(user.id, 'approve')}
                    disabled={loadingId === user.id}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loadingId === user.id ? '…' : `✓ ${t.admin.approveAnyway}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-2xl shadow-sm overflow-hidden border" style={{ background: cardBg, borderColor: border }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: border, background: sectionBg }}>
            <h2 className="text-2xl font-bold" style={{ color: textMain }}>👥 {t.admin.usersTable} ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: border }}>
              <thead style={{ background: sectionBg }}>
                <tr>
                  {[t.admin.colId, t.admin.colName, t.admin.colEmail, t.admin.colStatus, t.admin.colRole, t.admin.colAdminAccess, t.admin.colCreated, t.admin.colAction].map(col => (
                    <th key={col} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: textSub }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: border }}>
                {users.map((user) => (
                  <tr key={user.id} className="transition-colors" onMouseEnter={e => (e.currentTarget.style.background = rowHover)} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono" style={{ color: textSub }}>{user.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: textMain }}>{user.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: textMain }}>{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        user.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        user.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{user.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-bold"
                        style={user.role === 'ADMIN'
                          ? { background: 'rgba(91,164,176,0.15)', color: '#5ba4b0' }
                          : { background: dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', color: textSub }}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email === 'secretaire@youthstation.org' ? (
                        <span className="px-3 py-1.5 text-xs italic" style={{ color: textSub }}>{t.admin.mainAccount}</span>
                      ) : user.role === 'ADMIN' ? (
                        <button onClick={() => handleRoleChange(user.id, 'USER')} disabled={loadingId === user.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 hover:bg-red-100 hover:text-red-700 cursor-pointer"
                          style={{ background: dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', color: textSub }}>
                          {loadingId === user.id ? '…' : `✕ ${t.admin.revokeAccess}`}
                        </button>
                      ) : (
                        <button onClick={() => handleRoleChange(user.id, 'ADMIN')} disabled={loadingId === user.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                          style={{ background: 'rgba(91,164,176,0.1)', color: '#5ba4b0' }}>
                          {loadingId === user.id ? '…' : `+ ${t.admin.grantAccess}`}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: textSub }}>
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email !== 'secretaire@youthstation.org' && (
                        <button onClick={() => handleDelete(user.id, user.email)} disabled={loadingId === user.id}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 cursor-pointer">
                          {loadingId === user.id ? '…' : `🗑 ${t.admin.deleteAccount}`}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dictionnaire par lettre */}
        <SignDictionary />
      </main>
    </div>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';

const ROLES = ['Admin', 'Sales Manager', 'Regional Director', 'Sales Ops', 'Account Manager'] as const;

export function UserManagement() {
  const { t } = useTranslation('admin');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', role: 'Account Manager' as string, team: '', region: '' });
  const [confirmDeactivate, setConfirmDeactivate] = useState<string | null>(null);

  const { data: users, refetch } = trpc.admin.listUsers.useQuery({ search });
  const createMutation = trpc.admin.createUser.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setForm({ name: '', email: '', role: 'Account Manager', team: '', region: '' }); } });
  const deactivateMutation = trpc.admin.deactivateUser.useMutation({ onSuccess: () => { refetch(); setConfirmDeactivate(null); } });

  function roleBadge(role: string) {
    const map: Record<string, string> = {
      Admin: 'badge-red',
      'Sales Manager': 'badge-purple',
      'Regional Director': 'badge-blue',
      'Sales Ops': 'badge-amber',
      'Account Manager': 'badge-green',
    };
    return map[role] ?? 'badge-gray';
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="section-title">{t('users.title')}</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          + {t('users.addUser')}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card p-5 space-y-4 animate-slide-up">
          <h3 className="font-semibold text-gray-800 dark:text-white">{t('users.addUser')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t('users.name')} *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="form-label">{t('users.email')} *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="form-label">{t('users.role')}</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="input-field">
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">{t('users.team')}</label>
              <input value={form.team} onChange={e => setForm(p => ({ ...p, team: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>{t('common:actions.cancel')}</button>
            <button className="btn-primary"
              disabled={!form.name || !form.email || createMutation.isPending}
              onClick={() => createMutation.mutate(form as any)}>
              {createMutation.isPending ? 'Creating...' : t('common:actions.save')}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        className="input-field max-w-xs"
        placeholder={t('common:common.searchPlaceholder')} />

      {/* Table */}
      <div className="card overflow-hidden">
        {!users?.length ? (
          <div className="p-8 text-center text-gray-400">{t('users.noUsers')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('users.name')}</th>
                <th>{t('users.email')}</th>
                <th>{t('users.role')}</th>
                <th>{t('users.team')}</th>
                <th>{t('users.status')}</th>
                <th>{t('users.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {(users as any[]).map((u: any) => (
                <tr key={u.user_id}>
                  <td className="font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="text-gray-500">{u.email}</td>
                  <td><span className={roleBadge(u.role)}>{u.role}</span></td>
                  <td>{u.team ?? '—'}</td>
                  <td>
                    <span className={u.is_active ? 'badge-green' : 'badge-gray'}>
                      {u.is_active ? t('users.active') : t('users.inactive')}
                    </span>
                  </td>
                  <td>
                    {u.is_active && (
                      <button className="text-xs text-red-600 hover:underline"
                        onClick={() => setConfirmDeactivate(u.user_id)}>
                        {t('users.deactivate')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Deactivate confirm modal */}
      {confirmDeactivate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="card p-6 max-w-sm mx-4 space-y-4 animate-slide-up">
            <p className="font-semibold text-gray-900 dark:text-white">{t('users.deactivateConfirm')}</p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setConfirmDeactivate(null)}>{t('common:actions.cancel')}</button>
              <button className="btn-danger flex-1" onClick={() => deactivateMutation.mutate({ userId: confirmDeactivate })}>
                {t('users.deactivate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

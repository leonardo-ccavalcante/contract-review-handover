import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';

const SEVERITIES = ['P1', 'P2', 'P3', 'P4'] as const;

function severityBadge(s: string) {
  return { P1: 'badge-red', P2: 'badge-amber', P3: 'badge-blue', P4: 'badge-gray' }[s] ?? 'badge-gray';
}

export function ExceptionLogViewer() {
  const { t } = useTranslation('admin');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [severityFilter, setSeverityFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { data: exceptions, refetch } = trpc.admin.listExceptions.useQuery({
    status: statusFilter as any,
    severity: severityFilter as any,
    search: search || undefined,
    limit: 100,
  });

  const resolveMutation = trpc.admin.resolveException.useMutation({
    onSuccess: () => { refetch(); setResolvingId(null); setResolutionNotes(''); }
  });

  return (
    <div className="space-y-5">
      <h2 className="section-title">{t('exceptions.title')}</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input-field w-48" placeholder="Search errors..." />
        <select value={statusFilter ?? ''} onChange={e => setStatusFilter(e.target.value || undefined)} className="input-field w-36">
          <option value="">{t('exceptions.filters.all')}</option>
          <option value="OPEN">{t('exceptions.filters.open')}</option>
          <option value="RESOLVED">{t('exceptions.filters.resolved')}</option>
          <option value="IN_PROGRESS">In Progress</option>
        </select>
        <select value={severityFilter ?? ''} onChange={e => setSeverityFilter(e.target.value || undefined)} className="input-field w-28">
          <option value="">All</option>
          {SEVERITIES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {!exceptions?.length ? (
          <div className="p-8 text-center text-gray-400">{t('exceptions.noExceptions')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('exceptions.severity')}</th>
                <th>{t('exceptions.type')}</th>
                <th>{t('exceptions.message')}</th>
                <th>{t('exceptions.merchant')}</th>
                <th>{t('exceptions.status')}</th>
                <th>{t('exceptions.createdAt')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(exceptions as any[]).map((ex: any) => (
                <tr key={ex.exception_id}>
                  <td><span className={severityBadge(ex.severity)}>{ex.severity}</span></td>
                  <td className="font-medium text-gray-900 dark:text-white text-xs">{ex.exception_type}</td>
                  <td className="max-w-xs">
                    <p className="text-xs line-clamp-2 text-gray-500">{ex.error_message}</p>
                  </td>
                  <td className="text-xs">{ex.merchant_id ?? '—'}</td>
                  <td>
                    <span className={ex.status === 'OPEN' ? 'badge-red' : ex.status === 'RESOLVED' ? 'badge-green' : 'badge-amber'}>
                      {ex.status}
                    </span>
                  </td>
                  <td className="text-xs text-gray-400">{new Date(ex.created_at).toLocaleDateString()}</td>
                  <td>
                    {ex.status === 'OPEN' && (
                      <button className="btn-secondary py-1 px-3 text-xs"
                        onClick={() => { setResolvingId(ex.exception_id); setResolutionNotes(''); }}>
                        {t('exceptions.resolveBtn')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Resolve modal */}
      {resolvingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md mx-4 space-y-4 animate-slide-up">
            <h3 className="section-title">{t('exceptions.resolveBtn')} Exception</h3>
            <div>
              <label className="form-label">{t('exceptions.resolutionNotes')} *</label>
              <textarea value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)}
                rows={4} className="input-field resize-none"
                placeholder="Describe how this was resolved..." />
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setResolvingId(null)}>
                {t('common:actions.cancel')}
              </button>
              <button className="btn-primary flex-1"
                disabled={resolutionNotes.length < 10 || resolveMutation.isPending}
                onClick={() => resolveMutation.mutate({ exceptionId: resolvingId, notes: resolutionNotes })}>
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

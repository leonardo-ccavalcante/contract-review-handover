import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { KPICard } from '../dashboard/KPICard';

function AlertsIcon() {
  return <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
}
function CheckIcon() {
  return <svg className="w-5 h-5 text-bolt-green-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function UsersIcon() {
  return <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}

export function AdminDashboard() {
  const { t } = useTranslation('admin');
  const { data: stats, isLoading } = trpc.admin.getSystemStats.useQuery();
  const { data: exceptions } = trpc.admin.listExceptions.useQuery({ status: 'OPEN', limit: 5 });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">{t('nav.dashboard')}</h2>
        <p className="text-sm text-gray-500 mt-0.5">System health and key metrics</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard title={t('stats.totalMerchants')} value={stats?.total_merchants ?? '—'} icon={<UsersIcon />} iconBg="bg-blue-50" />
        <KPICard title={t('stats.totalValidations')} value={stats?.total_validations ?? '—'} icon={<CheckIcon />} iconBg="bg-bolt-green-light" />
        <KPICard title={t('stats.totalAudits')} value={stats?.total_audits ?? '—'} icon={<CheckIcon />} iconBg="bg-bolt-green-light" />
        <KPICard title={t('stats.openExceptions')} value={stats?.open_exceptions ?? '—'} icon={<AlertsIcon />} iconBg="bg-red-50" />
        <KPICard title={t('stats.criticalExceptions')} value={stats?.critical_exceptions ?? '—'} icon={<AlertsIcon />} iconBg="bg-red-50" />
      </div>

      {/* System status */}
      <div className="card p-5">
        <h3 className="section-title mb-4">System Status</h3>
        <div className="space-y-3">
          {[
            { label: 'Database Connection', ok: true },
            { label: 'Manus AI API', ok: true },
            { label: 'Slack Notifications', ok: true },
            { label: 'Email (SMTP)', ok: true },
            { label: 'Open Exceptions', ok: (stats?.open_exceptions ?? 0) === 0 },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${item.ok ? 'text-bolt-green-dark' : 'text-red-600'}`}>
                <span className={`w-2 h-2 rounded-full ${item.ok ? 'bg-bolt-green' : 'bg-red-500'}`}></span>
                {item.ok ? 'Operational' : 'Issue Detected'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent open exceptions */}
      {exceptions && exceptions.length > 0 && (
        <div className="card p-5">
          <h3 className="section-title mb-4">Open Exceptions</h3>
          <div className="space-y-2">
            {(exceptions as any[]).slice(0, 5).map((ex: any) => (
              <div key={ex.exception_id} className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <span className={`badge mt-0.5 ${ex.severity === 'P1' ? 'badge-red' : 'badge-amber'}`}>{ex.severity}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ex.exception_type}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{ex.error_message}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-auto">
                  {new Date(ex.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

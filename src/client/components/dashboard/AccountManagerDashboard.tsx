import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { KPICard } from './KPICard';
import { MerchantListView } from './MerchantListView';

function ShopIcon() {
  return <svg className="w-5 h-5 text-bolt-green-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-9H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
}
function ClipboardIcon() {
  return <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
}
function AuditIcon() {
  return <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function ProfileIcon() {
  return <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}

export function AccountManagerDashboard() {
  const { t } = useTranslation('dashboard');
  const nav = useNavigate();

  const { data: stats } = trpc.merchantProfile.getStats.useQuery();
  const { data: adminStats } = trpc.admin.getSystemStats.useQuery();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('page.title')}</h1>
          <p className="page-subtitle">{t('page.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => nav('/transcription/upload')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            {t('quickActions.uploadTranscription')}
          </button>
          <button className="btn-secondary" onClick={() => nav('/contract-audit')}>
            {t('quickActions.uploadContract')}
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title={t('kpi.totalMerchants')}
          value={adminStats?.total_merchants ?? '—'}
          icon={<ShopIcon />}
          iconBg="bg-bolt-green-light"
        />
        <KPICard
          title={t('kpi.pendingValidations')}
          value={adminStats?.total_validations ?? '—'}
          icon={<ClipboardIcon />}
          iconBg="bg-amber-50"
        />
        <KPICard
          title={t('kpi.openAudits')}
          value={adminStats?.total_audits ?? '—'}
          icon={<AuditIcon />}
          iconBg="bg-blue-50"
        />
        <KPICard
          title={t('kpi.profilesComplete')}
          value={stats ? `${stats.total_current_profiles}` : '—'}
          subtitle={`${stats?.avg_confidence_pct ?? 0}% avg confidence`}
          icon={<ProfileIcon />}
          iconBg="bg-purple-50"
        />
      </div>

      {/* Quick actions row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('quickActions.uploadTranscription'), path: '/transcription/upload', color: 'border-bolt-green bg-bolt-green-50' },
          { label: t('quickActions.uploadAudio'), path: '/audio/upload', color: 'border-blue-200 bg-blue-50' },
          { label: t('quickActions.uploadContract'), path: '/contract-audit', color: 'border-amber-200 bg-amber-50' },
          { label: t('quickActions.viewQueue'), path: '/validation', color: 'border-purple-200 bg-purple-50' },
        ].map(action => (
          <button
            key={action.path}
            onClick={() => nav(action.path)}
            className={`card p-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-2 ${action.color}
                       hover:shadow-card-md transition-all duration-150 text-left`}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Merchant list */}
      <MerchantListView />
    </div>
  );
}

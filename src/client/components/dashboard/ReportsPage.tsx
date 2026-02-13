import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';

function StatBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span><span>{value}</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ReportsPage() {
  const { t } = useTranslation('reports');
  const { data: stats, isLoading } = trpc.reports.getValidationStats.useQuery({
    startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    endDate: new Date().toISOString(),
  });
  const { data: daily } = trpc.reports.getDailyReport.useQuery({
    date: new Date().toISOString().slice(0, 10),
  });
  const { data: missing } = trpc.reports.getMostCommonMissingFields.useQuery({ limit: 5 });

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bolt-green" />
    </div>
  );

  const total = (stats?.total_validations ?? 0);

  return (
    <div className="page-container">
      <div>
        <h1 className="page-title">{t('title')}</h1>
        <p className="page-subtitle">{t('subtitle')}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('stats.total'), value: total, color: 'text-gray-900 dark:text-white' },
          { label: t('stats.passed'), value: stats?.passed_count ?? 0, color: 'text-bolt-green-dark' },
          { label: t('stats.failed'), value: stats?.failed_count ?? 0, color: 'text-red-600' },
          { label: t('stats.manualReview'), value: stats?.manual_review_count ?? 0, color: 'text-amber-600' },
        ].map(card => (
          <div key={card.label} className="kpi-card">
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pass rate bar */}
        <div className="card p-5 space-y-4">
          <h2 className="section-title">{t('statusBreakdown')}</h2>
          {total > 0 ? (
            <div className="space-y-3">
              <StatBar label={t('stats.passed')} value={stats?.passed_count ?? 0} max={total} />
              <StatBar label={t('stats.manualReview')} value={stats?.manual_review_count ?? 0} max={total} />
              <StatBar label={t('stats.failed')} value={stats?.failed_count ?? 0} max={total} />
              <StatBar label={t('stats.overrides')} value={stats?.override_count ?? 0} max={total} />
            </div>
          ) : (
            <p className="text-sm text-gray-400">{t('common:common.noData')}</p>
          )}
        </div>

        {/* Most common missing fields */}
        <div className="card p-5 space-y-4">
          <h2 className="section-title">{t('mostMissingFields')}</h2>
          {missing && missing.length > 0 ? (
            <div className="space-y-3">
              {(missing as any[]).map((item: any) => (
                <StatBar key={item.field} label={item.field} value={item.count} max={(missing[0] as any).count} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">{t('common:common.noData')}</p>
          )}
        </div>
      </div>

      {/* Daily report */}
      {daily && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="section-title">{t('dailyReport.title')}</h2>
            <span className="badge-gray">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: t('stats.passed'), value: (daily as any).passed_count ?? 0, cls: 'text-bolt-green-dark' },
              { label: t('stats.manualReview'), value: (daily as any).manual_review_count ?? 0, cls: 'text-amber-600' },
              { label: t('stats.failed'), value: (daily as any).failed_count ?? 0, cls: 'text-red-600' },
            ].map(d => (
              <div key={d.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className={`text-2xl font-bold ${d.cls}`}>{d.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{d.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

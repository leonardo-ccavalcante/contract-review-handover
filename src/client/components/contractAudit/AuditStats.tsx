import { useTranslation } from 'react-i18next';

interface AuditStatsProps {
  stats: {
    period_days: number;
    total_audits: number;
    pass_rate: number;
    with_discrepancies: number;
    by_severity: {
      high: number;
      medium: number;
      low: number;
    };
    by_resolution_status: {
      pending: number;
      in_progress: number;
      resolved: number;
    };
  };
}

export function AuditStats({ stats }: AuditStatsProps) {
  const { t } = useTranslation('contractAudit');

  return (
    <div className="audit-stats">
      <div className="stats-header">
        <h2>{t('stats.title')}</h2>
        <span className="period">
          {t('stats.lastDays', { days: stats.period_days })}
        </span>
      </div>

      <div className="stats-grid">
        {/* Total Audits */}
        <div className="stat-card">
          <div className="stat-value">{stats.total_audits}</div>
          <div className="stat-label">{t('stats.totalAudits')}</div>
        </div>

        {/* Pass Rate */}
        <div className="stat-card">
          <div className="stat-value">{stats.pass_rate}%</div>
          <div className="stat-label">{t('stats.passRate')}</div>
          <div className="stat-progress">
            <div
              className="progress-bar bg-green-500"
              style={{ width: `${stats.pass_rate}%` }}
            />
          </div>
        </div>

        {/* With Discrepancies */}
        <div className="stat-card">
          <div className="stat-value text-orange-600">{stats.with_discrepancies}</div>
          <div className="stat-label">{t('stats.withDiscrepancies')}</div>
        </div>

        {/* By Severity */}
        <div className="stat-card severity-breakdown">
          <div className="stat-label">{t('stats.bySeverity')}</div>
          <div className="severity-list">
            <div className="severity-item">
              <span className="badge bg-red-100 text-red-800">
                {t('stats.high')}
              </span>
              <span className="count">{stats.by_severity.high}</span>
            </div>
            <div className="severity-item">
              <span className="badge bg-orange-100 text-orange-800">
                {t('stats.medium')}
              </span>
              <span className="count">{stats.by_severity.medium}</span>
            </div>
            <div className="severity-item">
              <span className="badge bg-yellow-100 text-yellow-800">
                {t('stats.low')}
              </span>
              <span className="count">{stats.by_severity.low}</span>
            </div>
          </div>
        </div>

        {/* Resolution Status */}
        <div className="stat-card resolution-breakdown">
          <div className="stat-label">{t('stats.resolutionStatus')}</div>
          <div className="resolution-list">
            <div className="resolution-item">
              <span className="dot bg-yellow-500" />
              <span className="label">{t('stats.pending')}</span>
              <span className="count">{stats.by_resolution_status.pending}</span>
            </div>
            <div className="resolution-item">
              <span className="dot bg-blue-500" />
              <span className="label">{t('stats.inProgress')}</span>
              <span className="count">{stats.by_resolution_status.in_progress}</span>
            </div>
            <div className="resolution-item">
              <span className="dot bg-green-500" />
              <span className="label">{t('stats.resolved')}</span>
              <span className="count">{stats.by_resolution_status.resolved}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

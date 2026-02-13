import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import clsx from 'clsx';
import { ResolutionForm } from './ResolutionForm';

export function DiscrepancyReport() {
  const { auditId } = useParams<{ auditId: string }>();
  const { t } = useTranslation('contractAudit');

  const { data: audit, isLoading } = trpc.contractAudit.getAudit.useQuery(
    { auditId: auditId! },
    { enabled: !!auditId }
  );

  if (isLoading) {
    return <div className="loading">{t('report.loading')}</div>;
  }

  if (!audit) {
    return <div className="error">{t('report.notFound')}</div>;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'LOW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="discrepancy-report">
      {/* Header */}
      <div className="report-header">
        <div>
          <h1>{t('report.title')}</h1>
          <p className="audit-id">
            {t('report.auditId')}: {audit.audit_id}
          </p>
        </div>
        <div className="header-badges">
          <span
            className={clsx(
              'badge',
              audit.resolution_status === 'Pending'
                ? 'bg-yellow-100 text-yellow-800'
                : audit.resolution_status === 'In Progress'
                ? 'bg-blue-100 text-blue-800'
                : audit.resolution_status === 'Resolved'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            )}
          >
            {t(`report.status.${audit.resolution_status.replace(' ', '_').toLowerCase()}`)}
          </span>
          {audit.blocks_go_live && (
            <span className="badge bg-red-100 text-red-800">
              {t('report.blocksGoLive')}
            </span>
          )}
        </div>
      </div>

      {/* Merchant Details */}
      <div className="merchant-details card">
        <h2>{t('report.merchantDetails')}</h2>
        <dl>
          <dt>{t('report.merchantId')}</dt>
          <dd>{audit.merchant_id}</dd>
          <dt>{t('report.contractId')}</dt>
          <dd>{audit.contract_id}</dd>
          <dt>{t('report.auditDate')}</dt>
          <dd>{new Date(audit.audit_timestamp).toLocaleString()}</dd>
          <dt>{t('report.auditedBy')}</dt>
          <dd>{audit.audited_by} {audit.ai_model && `(${audit.ai_model})`}</dd>
        </dl>
      </div>

      {/* Audit Summary */}
      <div className="audit-summary card">
        <h2>{t('report.summary')}</h2>
        {audit.discrepancies_found ? (
          <div className="summary-content">
            <div className="summary-stat">
              <span className="stat-value">{audit.discrepancy_count}</span>
              <span className="stat-label">{t('report.discrepanciesFound')}</span>
            </div>
            <div className="summary-action">
              <p>
                <strong>{t('report.actionRequired')}:</strong>{' '}
                {t(`report.actions.${audit.action_required.toLowerCase()}`)}
              </p>
              {audit.sla_hours && (
                <p>
                  <strong>{t('report.sla')}:</strong> {audit.sla_hours} {t('report.hours')}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="no-discrepancies">
            <span className="icon">✅</span>
            <p>{t('report.noDiscrepancies')}</p>
          </div>
        )}
      </div>

      {/* Discrepancies List */}
      {audit.discrepancies && audit.discrepancies.length > 0 && (
        <div className="discrepancies-list">
          <h2>{t('report.discrepanciesDetails')}</h2>
          {(audit.discrepancies as any[]).map((discrepancy, idx) => (
            <div
              key={idx}
              className={clsx(
                'discrepancy-item card',
                getSeverityColor(discrepancy.severity)
              )}
            >
              <div className="discrepancy-header">
                <h3>{t(`fields.${discrepancy.field}`)}</h3>
                <span className={clsx('severity-badge', getSeverityColor(discrepancy.severity))}>
                  {t(`report.severity.${discrepancy.severity.toLowerCase()}`)}
                </span>
              </div>

              <div className="comparison">
                <div className="comparison-item">
                  <label>{t('report.verbalPromise')}</label>
                  <div className="value">{discrepancy.verbal_promise}</div>
                  {discrepancy.call_timestamp && (
                    <span className="timestamp">
                      @ {discrepancy.call_timestamp}
                    </span>
                  )}
                </div>
                <div className="comparison-arrow">→</div>
                <div className="comparison-item">
                  <label>{t('report.contractTerm')}</label>
                  <div className="value">{discrepancy.contract_term}</div>
                </div>
              </div>

              <div className="impact">
                <strong>{t('report.impact')}:</strong> {discrepancy.impact}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Section */}
      {audit.resolution_status === 'Pending' || audit.resolution_status === 'In Progress' ? (
        <ResolutionForm auditId={audit.audit_id} />
      ) : audit.resolution_notes ? (
        <div className="resolution-details card">
          <h2>{t('report.resolutionDetails')}</h2>
          <dl>
            <dt>{t('report.resolvedBy')}</dt>
            <dd>{audit.resolved_by}</dd>
            <dt>{t('report.resolvedAt')}</dt>
            <dd>{audit.resolved_at && new Date(audit.resolved_at).toLocaleString()}</dd>
            <dt>{t('report.resolutionNotes')}</dt>
            <dd>{audit.resolution_notes}</dd>
          </dl>
        </div>
      ) : null}
    </div>
  );
}

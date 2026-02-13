import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface AuditCardProps {
  audit: {
    audit_id: string;
    contract_id: string;
    merchant_id: string;
    audit_timestamp: Date;
    discrepancies_found: boolean;
    discrepancy_count: number;
    discrepancies: Array<{
      field: string;
      severity: 'HIGH' | 'MEDIUM' | 'LOW';
      verbal_promise: string;
      contract_term: string;
      impact: string;
    }> | null;
    action_required: 'NONE' | 'SALES_OPS_REVIEW' | 'URGENT_ESCALATION';
    blocks_go_live: boolean;
    resolution_status: 'Pending' | 'In Progress' | 'Resolved' | 'Accepted Risk';
  };
}

export function AuditCard({ audit }: AuditCardProps) {
  const { t } = useTranslation('contractAudit');
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Accepted Risk':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800';
      case 'LOW':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const highestSeverity = audit.discrepancies
    ? audit.discrepancies.reduce((highest, d) => {
        const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return severityOrder[d.severity] > severityOrder[highest as any]
          ? d.severity
          : highest;
      }, 'LOW' as 'HIGH' | 'MEDIUM' | 'LOW')
    : null;

  return (
    <div
      className="audit-card"
      onClick={() => navigate(`/audits/${audit.audit_id}`)}
    >
      <div className="card-header">
        <div className="merchant-info">
          <h3>{audit.merchant_id}</h3>
          <span className="contract-id">{audit.contract_id}</span>
        </div>
        <div className="status-badges">
          <span className={clsx('badge', getStatusColor(audit.resolution_status))}>
            {t(`dashboard.status.${audit.resolution_status.replace(' ', '_').toLowerCase()}`)}
          </span>
          {audit.blocks_go_live && (
            <span className="badge bg-red-100 text-red-800">
              {t('dashboard.blocksGoLive')}
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        {audit.discrepancies_found ? (
          <>
            <div className="discrepancy-summary">
              <div className="count">
                <span className="number">{audit.discrepancy_count}</span>
                <span className="label">{t('dashboard.discrepanciesFound')}</span>
              </div>
              {highestSeverity && (
                <div className="severity">
                  <span className={clsx('badge', getSeverityColor(highestSeverity))}>
                    {t(`dashboard.severity.${highestSeverity.toLowerCase()}`)}
                  </span>
                </div>
              )}
            </div>

            <div className="discrepancy-list">
              {audit.discrepancies?.slice(0, 3).map((d, idx) => (
                <div key={idx} className="discrepancy-item">
                  <span className="field-name">{t(`fields.${d.field}`)}</span>
                  <span className={clsx('severity-badge', getSeverityColor(d.severity))}>
                    {d.severity}
                  </span>
                </div>
              ))}
              {audit.discrepancy_count > 3 && (
                <div className="more-discrepancies">
                  +{audit.discrepancy_count - 3} {t('dashboard.more')}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-discrepancies">
            <span className="icon">✅</span>
            <span className="text">{t('dashboard.noDiscrepancies')}</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <span className="timestamp">
          {t('dashboard.auditedAt')}: {new Date(audit.audit_timestamp).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

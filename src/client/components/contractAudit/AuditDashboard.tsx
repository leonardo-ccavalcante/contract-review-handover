import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { AuditCard } from './AuditCard';
import { AuditStats } from './AuditStats';

export function AuditDashboard() {
  const { t } = useTranslation('contractAudit');
  const [selectedStatus, setSelectedStatus] = useState<
    'Pending' | 'In Progress' | 'Resolved' | 'Accepted Risk' | null
  >(null);
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);

  // Fetch audits
  const { data: audits, isLoading } = trpc.contractAudit.listAudits.useQuery({
    resolutionStatus: selectedStatus || undefined,
    merchantId: selectedMerchant || undefined,
    limit: 20,
  });

  // Fetch statistics
  const { data: stats } = trpc.contractAudit.getAuditStats.useQuery({
    days: 30,
  });

  return (
    <div className="audit-dashboard">
      <div className="header">
        <h1>{t('dashboard.title')}</h1>
        <p className="subtitle">{t('dashboard.subtitle')}</p>
      </div>

      {/* Statistics */}
      {stats && <AuditStats stats={stats} />}

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>{t('dashboard.filters.status')}</label>
          <select
            value={selectedStatus || ''}
            onChange={(e) =>
              setSelectedStatus(
                (e.target.value as any) || null
              )
            }
          >
            <option value="">{t('dashboard.filters.allStatuses')}</option>
            <option value="Pending">{t('dashboard.filters.pending')}</option>
            <option value="In Progress">
              {t('dashboard.filters.inProgress')}
            </option>
            <option value="Resolved">{t('dashboard.filters.resolved')}</option>
            <option value="Accepted Risk">
              {t('dashboard.filters.acceptedRisk')}
            </option>
          </select>
        </div>

        <div className="filter-group">
          <label>{t('dashboard.filters.merchant')}</label>
          <input
            type="text"
            placeholder={t('dashboard.filters.merchantPlaceholder')}
            value={selectedMerchant || ''}
            onChange={(e) => setSelectedMerchant(e.target.value || null)}
          />
        </div>
      </div>

      {/* Audit List */}
      <div className="audit-list">
        {isLoading ? (
          <div className="loading">{t('dashboard.loading')}</div>
        ) : audits && audits.length > 0 ? (
          audits.map((audit) => <AuditCard key={audit.audit_id} audit={audit} />)
        ) : (
          <div className="empty-state">
            <p>{t('dashboard.noAudits')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

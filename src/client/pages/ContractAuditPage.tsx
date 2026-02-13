import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/common/Layout';
import { AuditDashboard } from '../components/contractAudit/AuditDashboard';
import { ContractUpload } from '../components/contractAudit/ContractUpload';

type View = 'dashboard' | 'upload';

export function ContractAuditPage() {
  const { t } = useTranslation('contractAudit');
  const [activeView, setActiveView] = useState<View>('dashboard');

  return (
    <Layout>
      <div className="contract-audit-page">
        <div className="page-header">
          <div className="page-tabs">
            <button
              className={activeView === 'dashboard' ? 'tab active' : 'tab'}
              onClick={() => setActiveView('dashboard')}
            >
              {t('dashboard.title')}
            </button>
            <button
              className={activeView === 'upload' ? 'tab active' : 'tab'}
              onClick={() => setActiveView('upload')}
            >
              {t('upload.title')}
            </button>
          </div>
        </div>

        <div className="page-content">
          {activeView === 'dashboard' ? <AuditDashboard /> : <ContractUpload />}
        </div>
      </div>
    </Layout>
  );
}

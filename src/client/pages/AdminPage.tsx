import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/common/Layout';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { ValidationRulesConfig } from '../components/admin/ValidationRulesConfig';
import { UserManagement } from '../components/admin/UserManagement';
import { ExceptionLogViewer } from '../components/admin/ExceptionLogViewer';
import { WorkflowConfig } from '../components/admin/WorkflowConfig';
import { SystemSettings } from '../components/admin/SystemSettings';

type AdminTab = 'dashboard' | 'validationRules' | 'users' | 'exceptions' | 'workflow' | 'settings';

const navItems: Array<{ key: AdminTab; icon: string }> = [
  { key: 'dashboard',       icon: '📊' },
  { key: 'validationRules', icon: '⚙️' },
  { key: 'users',           icon: '👥' },
  { key: 'exceptions',      icon: '🚨' },
  { key: 'workflow',        icon: '🔄' },
  { key: 'settings',        icon: '🔧' },
];

export function AdminPage() {
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const content = {
    dashboard:       <AdminDashboard />,
    validationRules: <ValidationRulesConfig />,
    users:           <UserManagement />,
    exceptions:      <ExceptionLogViewer />,
    workflow:        <WorkflowConfig />,
    settings:        <SystemSettings />,
  }[activeTab];

  return (
    <Layout>
      <div className="flex items-start gap-1 mb-6">
        <div>
          <h1 className="page-title">{t('page.title')}</h1>
          <p className="page-subtitle">{t('page.subtitle')}</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <nav className="flex-shrink-0 w-48">
          <div className="card p-2 space-y-0.5">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeTab === item.key
                    ? 'bg-bolt-green text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{item.icon}</span>
                <span>{t(`nav.${item.key}` as any)}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 animate-fade-in">
          {content}
        </div>
      </div>
    </Layout>
  );
}

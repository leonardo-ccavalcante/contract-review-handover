import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';

const WORKFLOW_SETTINGS = [
  { key: 'workflow.autoValidation',         i18nKey: 'steps.autoValidation' },
  { key: 'workflow.slackNotifications',     i18nKey: 'steps.slackNotifications' },
  { key: 'workflow.emailNotifications',     i18nKey: 'steps.emailNotifications' },
  { key: 'workflow.dailyReports',           i18nKey: 'steps.dailyReports' },
  { key: 'workflow.autoAudit',              i18nKey: 'steps.autoAudit' },
] as const;

export function WorkflowConfig() {
  const { t } = useTranslation('admin');
  const { data: settings, refetch } = trpc.admin.getSettings.useQuery();
  const setSetting = trpc.admin.setSetting.useMutation({ onSuccess: () => refetch() });
  const [saved, setSaved] = useState(false);

  const settingMap = Object.fromEntries((settings ?? []).map((s: any) => [s.setting_key, s.setting_value]));

  function toggle(key: string) {
    const current = settingMap[key] === 'true';
    setSetting.mutateAsync({ key, value: String(!current) }).then(() => {
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="section-title">{t('workflow.title')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('workflow.subtitle')}</p>
      </div>

      <div className="card p-5 divide-y divide-gray-100 dark:divide-gray-700">
        {WORKFLOW_SETTINGS.map(({ key, i18nKey }) => {
          const isOn = settingMap[key] === 'true';
          return (
            <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {t(`workflow.${i18nKey}` as any)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{key}</p>
              </div>
              <button
                onClick={() => toggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                            ${isOn ? 'bg-bolt-green' : 'bg-gray-200 dark:bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          );
        })}
      </div>

      {saved && (
        <div className="bg-bolt-green-light rounded-lg p-3 text-sm text-bolt-green-dark font-medium animate-fade-in">
          {t('workflow.saved')}
        </div>
      )}
    </div>
  );
}

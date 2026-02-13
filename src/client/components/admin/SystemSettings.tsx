import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';

interface SettingField {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  sensitive?: boolean;
}

const SETTING_GROUPS: Array<{ groupKey: string; labelKey: string; fields: SettingField[] }> = [
  {
    groupKey: 'slack',
    labelKey: 'settings.slack',
    fields: [
      { key: 'slack.webhook_url', label: 'settings.slackWebhook', placeholder: 'https://hooks.slack.com/...', sensitive: true },
      { key: 'slack.channel', label: 'settings.slackChannel', placeholder: '#sales-ops' },
    ],
  },
  {
    groupKey: 'email',
    labelKey: 'settings.email',
    fields: [
      { key: 'smtp.host', label: 'settings.smtpHost', placeholder: 'smtp.gmail.com' },
      { key: 'smtp.port', label: 'settings.smtpPort', placeholder: '587', type: 'number' },
      { key: 'smtp.user', label: 'settings.smtpUser', placeholder: 'noreply@bolt.eu' },
      { key: 'smtp.from', label: 'settings.smtpFrom', placeholder: 'Bolt Merchant Team <noreply@bolt.eu>' },
    ],
  },
  {
    groupKey: 'ai',
    labelKey: 'settings.ai',
    fields: [
      { key: 'manus.api_url', label: 'settings.manusApiUrl', placeholder: 'https://api.manus.im/v1' },
    ],
  },
];

export function SystemSettings() {
  const { t } = useTranslation('admin');
  const { data: settings, refetch } = trpc.admin.getSettings.useQuery();
  const setSetting = trpc.admin.setSetting.useMutation();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setValues(Object.fromEntries((settings as any[]).map((s: any) => [s.setting_key, s.setting_value])));
    }
  }, [settings]);

  async function handleSave() {
    const promises = Object.entries(values).map(([key, value]) =>
      setSetting.mutateAsync({ key, value })
    );
    await Promise.all(promises);
    refetch();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <h2 className="section-title">{t('settings.title')}</h2>

      {SETTING_GROUPS.map(group => (
        <div key={group.groupKey} className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
            {t(group.labelKey as any)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.fields.map(field => (
              <div key={field.key}>
                <label className="form-label">{t(field.label as any)}</label>
                <input
                  type={field.sensitive ? 'password' : (field.type ?? 'text')}
                  value={values[field.key] ?? ''}
                  onChange={e => setValues(p => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {saved && (
        <div className="bg-bolt-green-light rounded-lg p-3 text-sm text-bolt-green-dark font-medium animate-fade-in">
          {t('settings.saved')}
        </div>
      )}

      <div className="flex justify-end">
        <button className="btn-primary" onClick={handleSave} disabled={setSetting.isPending}>
          {setSetting.isPending ? 'Saving...' : t('common:actions.save')}
        </button>
      </div>
    </div>
  );
}

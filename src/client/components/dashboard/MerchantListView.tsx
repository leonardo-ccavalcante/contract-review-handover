import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { useNavigate } from 'react-router-dom';

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: 'badge-green',
    pending: 'badge-amber',
    blocked: 'badge-red',
    go_live: 'badge-blue',
    inactive: 'badge-gray',
  };
  return map[status?.toLowerCase()] ?? 'badge-gray';
}

export function MerchantListView() {
  const { t } = useTranslation('dashboard');
  const nav = useNavigate();
  const [search, setSearch] = useState('');

  const { data, isLoading } = trpc.merchantProfile.searchProfiles.useQuery({
    limit: 50,
    sortBy: 'updated_at',
    sortOrder: 'desc',
  });

  const filtered = (data ?? []).filter(
    (p: any) => !search || p.merchant_id?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return (
    <div className="card p-6 flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bolt-green"></div>
    </div>
  );

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="section-title">{t('merchantList.title')}</h2>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('merchantList.searchPlaceholder')}
          className="input-field w-56"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-400 dark:text-gray-500">
          {t('merchantList.noMerchants')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('merchantList.columns.merchant')}</th>
                <th>{t('merchantList.columns.segment')}</th>
                <th>{t('merchantList.columns.city')}</th>
                <th>{t('merchantList.columns.status')}</th>
                <th>{t('merchantList.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((profile: any) => (
                <tr
                  key={profile.profile_id}
                  className="cursor-pointer"
                  onClick={() => nav(`/merchant-profiles/${profile.merchant_id}`)}
                >
                  <td>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {profile.merchant_id}
                    </div>
                    <div className="text-xs text-gray-400">v{profile.profile_version}</div>
                  </td>
                  <td className="capitalize">{profile.campaign_type ?? '—'}</td>
                  <td>{profile.price_sensitivity ?? '—'}</td>
                  <td>
                    <span className={statusBadge(profile.is_current_version ? 'active' : 'inactive')}>
                      {profile.is_current_version
                        ? t('merchantList.status.active')
                        : t('merchantList.status.inactive')}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button
                      className="btn-secondary py-1 px-3 text-xs"
                      onClick={() => nav(`/merchant-profiles/${profile.merchant_id}`)}
                    >
                      {t('merchantList.viewProfile')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

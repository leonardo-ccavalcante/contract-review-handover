import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { ProfileCard } from './ProfileCard';
import { ProfileForm } from './ProfileForm';

const ITEMS_PER_PAGE = 12;

export function ProfileDashboard() {
  const { t } = useTranslation('merchantProfile');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    campaignType: '',
    priceSensitivity: '' as '' | 'Low' | 'Medium' | 'High',
    humanReviewRequired: undefined as boolean | undefined,
    sortBy: 'created_at' as 'created_at' | 'extraction_confidence' | 'profile_version',
    sortDir: 'desc' as 'asc' | 'desc',
  });

  const statsQuery = trpc.merchantProfile.getStats.useQuery();
  const profilesQuery = trpc.merchantProfile.searchProfiles.useQuery({
    campaignType: filters.campaignType || undefined,
    priceSensitivity: filters.priceSensitivity || undefined,
    humanReviewRequired: filters.humanReviewRequired,
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE,
  });

  const stats = statsQuery.data;
  const { profiles = [], total = 0 } = profilesQuery.data || {};
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: t('stats.totalProfiles'), value: stats.total, color: 'text-gray-900 dark:text-white' },
            { label: t('stats.currentVersions'), value: stats.currentVersions, color: 'text-green-600 dark:text-green-400' },
            { label: t('stats.pendingReview'), value: stats.pendingHumanReview, color: 'text-amber-600 dark:text-amber-400' },
            { label: t('stats.avgConfidence'), value: `${stats.avgConfidence}%`, color: 'text-blue-600 dark:text-blue-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-3 flex-wrap">
          {/* Campaign Type filter */}
          <input
            type="text"
            value={filters.campaignType}
            onChange={(e) => { setFilters((f) => ({ ...f, campaignType: e.target.value })); setPage(0); }}
            placeholder={t('filters.campaignType')}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-48"
          />

          {/* Price Sensitivity filter */}
          <select
            value={filters.priceSensitivity}
            onChange={(e) => { setFilters((f) => ({ ...f, priceSensitivity: e.target.value as any })); setPage(0); }}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t('filters.allSensitivities')}</option>
            <option value="Low">{t('sensitivity.low')}</option>
            <option value="Medium">{t('sensitivity.medium')}</option>
            <option value="High">{t('sensitivity.high')}</option>
          </select>

          {/* Human Review filter */}
          <select
            value={filters.humanReviewRequired === undefined ? '' : String(filters.humanReviewRequired)}
            onChange={(e) => {
              const val = e.target.value;
              setFilters((f) => ({ ...f, humanReviewRequired: val === '' ? undefined : val === 'true' }));
              setPage(0);
            }}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t('filters.allReviewStatus')}</option>
            <option value="true">{t('filters.pendingReview')}</option>
            <option value="false">{t('filters.reviewed')}</option>
          </select>

          {/* Sort */}
          <select
            value={`${filters.sortBy}:${filters.sortDir}`}
            onChange={(e) => {
              const [sortBy, sortDir] = e.target.value.split(':');
              setFilters((f) => ({ ...f, sortBy: sortBy as any, sortDir: sortDir as any }));
            }}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="created_at:desc">{t('sort.newestFirst')}</option>
            <option value="created_at:asc">{t('sort.oldestFirst')}</option>
            <option value="extraction_confidence:desc">{t('sort.highestConfidence')}</option>
            <option value="extraction_confidence:asc">{t('sort.lowestConfidence')}</option>
            <option value="profile_version:desc">{t('sort.latestVersion')}</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md"
        >
          + {t('dashboard.createProfile')}
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('form.createTitle')}</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <ProfileForm
              mode="create"
              onSuccess={() => { setShowCreateForm(false); profilesQuery.refetch(); statsQuery.refetch(); }}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Profile Grid */}
      {profilesQuery.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-3">👤</p>
          <p>{t('dashboard.noProfiles')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <ProfileCard key={profile.profile_id} profile={profile as any} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-40 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                ←
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {page + 1} / {totalPages} · {total} {t('dashboard.total')}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-40 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { ProfileVersionHistory } from './ProfileVersionHistory';
import { ProfileForm } from './ProfileForm';

interface ProfileDetailProps {
  merchantId: string;
}

export function ProfileDetail({ merchantId }: ProfileDetailProps) {
  const { t } = useTranslation('merchantProfile');
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>();

  const profileQuery = trpc.merchantProfile.getProfile.useQuery({ merchantId });
  const historyQuery = trpc.merchantProfile.getVersionHistory.useQuery({ merchantId });
  const activityQuery = trpc.merchantProfile.getActivityLog.useQuery({ merchantId });
  const generateSummaryMutation = trpc.merchantProfile.generateSummary.useMutation({
    onSuccess: () => profileQuery.refetch(),
  });
  const markReviewedMutation = trpc.merchantProfile.markReviewed.useMutation({
    onSuccess: () => profileQuery.refetch(),
  });

  const profile = profileQuery.data;
  const displayProfile = selectedProfileId
    ? historyQuery.data?.versions?.find((v) => v.profile_id === selectedProfileId) || profile
    : profile;

  if (profileQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  if (profileQuery.error || !profile) {
    return (
      <div className="text-center py-12 text-red-600 dark:text-red-400">
        {profileQuery.error?.message || t('detail.notFound')}
      </div>
    );
  }

  const confidence = parseFloat(String(displayProfile?.extraction_confidence || '0'));
  const confidenceColor =
    confidence >= 90 ? 'text-green-600' : confidence >= 70 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left: Main Profile */}
      <div className="col-span-2 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('detail.title')} — {merchantId}
              </h2>
              <p className="text-sm text-gray-500">
                {t('detail.version')} {displayProfile?.profile_version} ·{' '}
                {displayProfile?.is_current_version ? (
                  <span className="text-green-600">{t('detail.currentVersion')}</span>
                ) : (
                  <span className="text-amber-600">{t('detail.historicVersion')}</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {profile.human_review_required && (
                <button
                  onClick={() => markReviewedMutation.mutate({ profileId: profile.profile_id })}
                  disabled={markReviewedMutation.isPending}
                  className="px-3 py-1.5 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-md"
                >
                  {t('detail.markReviewed')}
                </button>
              )}
              {!displayProfile?.ai_summary && displayProfile?.is_current_version && (
                <button
                  onClick={() =>
                    generateSummaryMutation.mutate({ profileId: profile.profile_id })
                  }
                  disabled={generateSummaryMutation.isPending}
                  className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                  {generateSummaryMutation.isPending ? t('detail.generating') : t('detail.generateSummary')}
                </button>
              )}
              {profile.is_current_version && !showEditForm && (
                <button
                  onClick={() => setShowEditForm(true)}
                  className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md"
                >
                  {t('detail.edit')}
                </button>
              )}
            </div>
          </div>

          {/* AI Summary */}
          {displayProfile?.ai_summary && (
            <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-4">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                {t('detail.aiSummary')}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                {displayProfile.ai_summary}
              </p>
            </div>
          )}

          {/* Review badge */}
          {profile.human_review_required && (
            <div className="mb-4 p-2 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-sm text-amber-700 dark:text-amber-300">
              ⚠ {t('detail.reviewPending')}
            </div>
          )}

          {/* Confidence */}
          <div className="flex items-center gap-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
            <div>
              <p className="text-xs text-gray-500">{t('detail.confidence')}</p>
              <p className={`text-2xl font-bold ${confidenceColor}`}>{confidence.toFixed(1)}%</p>
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    confidence >= 90 ? 'bg-green-500' : confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(confidence, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {showEditForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              {t('detail.updateProfile')}
            </h3>
            <ProfileForm
              merchantId={merchantId}
              initialValues={{
                commission: displayProfile?.commission || undefined,
                campaign_type: displayProfile?.campaign_type || undefined,
                campaign_duration: displayProfile?.campaign_duration || undefined,
                tablet_included: displayProfile?.tablet_included ?? undefined,
                tablet_model: displayProfile?.tablet_model || undefined,
                contract_length: displayProfile?.contract_length || undefined,
                current_revenue_estimate: parseFloat(String(displayProfile?.current_revenue_estimate || '0')) || undefined,
                employee_count: displayProfile?.employee_count || undefined,
                competitors_active: (displayProfile?.competitors_active as string[]) || [],
                merchant_goals: (displayProfile?.merchant_goals as string[]) || [],
                expected_order_volume: displayProfile?.expected_order_volume || undefined,
                expansion_plans: displayProfile?.expansion_plans || undefined,
                price_sensitivity: displayProfile?.price_sensitivity || undefined,
                owner_motivations: (displayProfile?.owner_motivations as string[]) || [],
                owner_concerns: (displayProfile?.owner_concerns as string[]) || [],
                decision_triggers: (displayProfile?.decision_triggers as string[]) || [],
              }}
              mode="update"
              onSuccess={() => {
                setShowEditForm(false);
                profileQuery.refetch();
                historyQuery.refetch();
              }}
              onCancel={() => setShowEditForm(false)}
            />
          </div>
        )}

        {/* Contract Terms */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.contractTerms')}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: t('fields.commission'), value: displayProfile?.commission ? `${displayProfile.commission}%` : '—' },
              { label: t('fields.contractLength'), value: displayProfile?.contract_length ? `${displayProfile.contract_length} mo` : '—' },
              { label: t('fields.campaignType'), value: displayProfile?.campaign_type || '—' },
              { label: t('fields.campaignDuration'), value: displayProfile?.campaign_duration ? `${displayProfile.campaign_duration} wks` : '—' },
              { label: t('fields.tabletIncluded'), value: displayProfile?.tablet_included ? t('common.yes') : t('common.no') },
              { label: t('fields.tabletModel'), value: displayProfile?.tablet_model || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Business Context */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.businessContext')}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { label: t('fields.revenue'), value: displayProfile?.current_revenue_estimate ? `€${parseFloat(String(displayProfile.current_revenue_estimate)).toLocaleString()}` : '—' },
              { label: t('fields.employeeCount'), value: displayProfile?.employee_count?.toString() || '—' },
              { label: t('fields.expectedVolume'), value: displayProfile?.expected_order_volume || '—' },
              { label: t('fields.priceSensitivity'), value: displayProfile?.price_sensitivity || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
          {(displayProfile?.competitors_active as string[] || []).length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">{t('fields.competitors')}</p>
              <div className="flex flex-wrap gap-1">
                {(displayProfile?.competitors_active as string[]).map((c) => (
                  <span key={c} className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">{c}</span>
                ))}
              </div>
            </div>
          )}
          {(displayProfile?.merchant_goals as string[] || []).length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">{t('fields.merchantGoals')}</p>
              <div className="flex flex-wrap gap-1">
                {(displayProfile?.merchant_goals as string[]).map((g) => (
                  <span key={g} className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">{g}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Owner Psychology */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.ownerPsychology')}
          </h3>
          <div className="space-y-3">
            {[
              { label: t('fields.ownerMotivations'), items: displayProfile?.owner_motivations as string[], color: 'blue' },
              { label: t('fields.ownerConcerns'), items: displayProfile?.owner_concerns as string[], color: 'orange' },
              { label: t('fields.decisionTriggers'), items: displayProfile?.decision_triggers as string[], color: 'purple' },
            ].map(({ label, items, color }) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                {items?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {items.map((item) => (
                      <span key={item} className={`px-2 py-0.5 text-xs bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300 rounded-full`}>{item}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">—</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Version History & Activity */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <ProfileVersionHistory
            versions={historyQuery.data?.versions || []}
            selectedProfileId={selectedProfileId || profile.profile_id}
            onSelectVersion={setSelectedProfileId}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t('activity.title')}
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(activityQuery.data?.logs || []).map((log) => (
              <div key={log.activity_id} className="text-xs border-l-2 border-gray-200 dark:border-gray-600 pl-3 py-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {t(`activity.types.${log.activity_type}`)}
                  </span>
                  <span className="text-gray-400">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-500">{log.performed_by}</p>
                {log.notes && <p className="text-gray-400 italic">{log.notes}</p>}
              </div>
            ))}
            {!activityQuery.data?.logs?.length && (
              <p className="text-xs text-gray-400">{t('activity.noActivity')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

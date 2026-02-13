import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface ProfileCardProps {
  profile: {
    profile_id: string;
    merchant_id: string;
    commission?: string | null;
    campaign_type?: string | null;
    contract_length?: number | null;
    price_sensitivity?: 'Low' | 'Medium' | 'High' | null;
    extraction_confidence?: number | string | null;
    human_review_required?: boolean | null;
    is_current_version?: boolean | null;
    profile_version: number;
    created_at: Date | string;
    ai_summary?: string | null;
  };
}

const sensitivityColors: Record<string, string> = {
  Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function ProfileCard({ profile }: ProfileCardProps) {
  const { t } = useTranslation('merchantProfile');

  const confidence = parseFloat(String(profile.extraction_confidence || '0'));
  const confidenceColor =
    confidence >= 90
      ? 'text-green-600 dark:text-green-400'
      : confidence >= 70
      ? 'text-yellow-600 dark:text-yellow-400'
      : 'text-red-600 dark:text-red-400';

  const createdDate = new Date(profile.created_at).toLocaleDateString();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t('card.merchantId')}: <span className="font-mono">{profile.merchant_id}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">v{profile.profile_version}</span>
            {profile.human_review_required && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                {t('card.reviewRequired')}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${confidenceColor}`}>{confidence.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('card.confidence')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('fields.commission')}</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {profile.commission ? `${profile.commission}%` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('fields.contractLength')}</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {profile.contract_length ? `${profile.contract_length} mo` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('fields.campaignType')}</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {profile.campaign_type || '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('fields.priceSensitivity')}</p>
          {profile.price_sensitivity ? (
            <span
              className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                sensitivityColors[profile.price_sensitivity]
              }`}
            >
              {profile.price_sensitivity}
            </span>
          ) : (
            <p className="text-sm text-gray-400">—</p>
          )}
        </div>
      </div>

      {profile.ai_summary && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 italic">
          "{profile.ai_summary}"
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-400">{createdDate}</p>
        <Link
          to={`/merchant-profiles/${profile.merchant_id}`}
          className="text-sm text-bolt-green hover:text-green-600 font-medium"
        >
          {t('card.viewDetails')} →
        </Link>
      </div>
    </div>
  );
}

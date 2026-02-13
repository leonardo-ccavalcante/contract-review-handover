import { useTranslation } from 'react-i18next';

interface ProfileVersion {
  profile_id: string;
  profile_version: number;
  is_current_version?: boolean | null;
  created_at: Date | string;
  created_by?: string | null;
  update_notes?: string | null;
  extraction_confidence?: number | string | null;
  commission?: string | null;
  campaign_type?: string | null;
  contract_length?: number | null;
}

interface ProfileVersionHistoryProps {
  versions: ProfileVersion[];
  onSelectVersion?: (profileId: string) => void;
  selectedProfileId?: string;
}

export function ProfileVersionHistory({
  versions,
  onSelectVersion,
  selectedProfileId,
}: ProfileVersionHistoryProps) {
  const { t } = useTranslation('merchantProfile');

  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {t('versionHistory.noVersions')}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {t('versionHistory.title')} ({versions.length})
      </h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

        <div className="space-y-3">
          {versions.map((version, index) => {
            const isSelected = selectedProfileId === version.profile_id;
            const isCurrent = version.is_current_version;
            const date = new Date(version.created_at).toLocaleString();
            const confidence = parseFloat(String(version.extraction_confidence || '0'));

            return (
              <div
                key={version.profile_id}
                className={`relative pl-10 pr-3 py-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
                onClick={() => onSelectVersion?.(version.profile_id)}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-2.5 top-4 w-3 h-3 rounded-full border-2 ${
                    isCurrent
                      ? 'bg-green-500 border-green-500'
                      : index === 0
                      ? 'bg-gray-400 border-gray-400'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                />

                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t('versionHistory.version')} {version.profile_version}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          {t('versionHistory.current')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{date}</p>
                    {version.created_by && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t('versionHistory.by')} {version.created_by}
                      </p>
                    )}
                    {version.update_notes && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                        "{version.update_notes}"
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                    <p>{confidence.toFixed(1)}%</p>
                    {version.commission && <p>{version.commission}%</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { ValidationCard } from './ValidationCard';
import { useState } from 'react';

export function ValidationDashboard() {
  const { t } = useTranslation('validation');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  // Fetch validations using tRPC
  const { data: validations, isLoading, error } = trpc.validation.listValidations.useQuery({
    status: selectedStatus as any,
    limit: 20,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bolt-green mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common:common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          {t('common:common.error')}
        </h3>
        <p className="text-red-700 dark:text-red-300">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('hardGate.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('hardGate.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('common:common.filterBy')}:
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedStatus(undefined)}
            className={`px-4 py-2 rounded-md ${
              selectedStatus === undefined
                ? 'bg-bolt-green text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedStatus('PASS')}
            className={`px-4 py-2 rounded-md ${
              selectedStatus === 'PASS'
                ? 'bg-bolt-green text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {t('hardGate.status.PASS')}
          </button>
          <button
            onClick={() => setSelectedStatus('FAIL')}
            className={`px-4 py-2 rounded-md ${
              selectedStatus === 'FAIL'
                ? 'bg-bolt-green text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {t('hardGate.status.FAIL')}
          </button>
          <button
            onClick={() => setSelectedStatus('MANUAL_REVIEW')}
            className={`px-4 py-2 rounded-md ${
              selectedStatus === 'MANUAL_REVIEW'
                ? 'bg-bolt-green text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {t('hardGate.status.MANUAL_REVIEW')}
          </button>
          <button
            onClick={() => setSelectedStatus('OVERRIDE')}
            className={`px-4 py-2 rounded-md ${
              selectedStatus === 'OVERRIDE'
                ? 'bg-bolt-green text-white'
                : 'bg-gray-200 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('hardGate.status.OVERRIDE')}
          </button>
        </div>
      </div>

      {/* Validations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {validations && validations.length > 0 ? (
          validations.map((validation) => (
            <ValidationCard
              key={validation.validation_id}
              validation={validation}
              onViewDetails={() => {
                // Navigate to validation details page
                window.location.href = `/validation/${validation.validation_id}`;
              }}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">{t('common:common.noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

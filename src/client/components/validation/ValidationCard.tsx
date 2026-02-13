import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import type { ValidationLog } from '../../../server/db';

interface ValidationCardProps {
  validation: ValidationLog;
  onViewDetails: () => void;
}

export function ValidationCard({ validation, onViewDetails }: ValidationCardProps) {
  const { t } = useTranslation('validation');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'FAIL':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'MANUAL_REVIEW':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'OVERRIDE':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {validation.merchant_id}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(validation.validation_timestamp).toLocaleString()}
          </p>
        </div>
        <span
          className={clsx(
            'px-3 py-1 rounded-full text-xs font-medium',
            getStatusColor(validation.validation_status)
          )}
        >
          {t(`hardGate.status.${validation.validation_status}`)}
        </span>
      </div>

      {/* Validation Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('hardGate.mandatoryFields.title')}
          </p>
          <p
            className={clsx('text-lg font-semibold', {
              'text-green-600': validation.mandatory_fields_complete,
              'text-red-600': !validation.mandatory_fields_complete,
            })}
          >
            {validation.mandatory_fields_complete ? '✓' : '✗'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('hardGate.confidence.title')}
          </p>
          <p
            className={clsx('text-lg font-semibold', {
              'text-green-600': validation.ai_confidence_threshold_met,
              'text-yellow-600': !validation.ai_confidence_threshold_met,
            })}
          >
            {validation.ai_confidence_threshold_met
              ? t('hardGate.confidence.meetsThreshold')
              : t('hardGate.confidence.belowThreshold')}
          </p>
        </div>
      </div>

      {/* Missing Fields */}
      {validation.missing_fields && validation.missing_fields.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            {t('hardGate.mandatoryFields.missing')}:
          </p>
          <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside">
            {validation.missing_fields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Low Confidence Fields */}
      {validation.low_confidence_fields && validation.low_confidence_fields.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
            {t('hardGate.confidence.lowConfidenceFields')}:
          </p>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
            {validation.low_confidence_fields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Action */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Next Action:</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {t(`hardGate.nextAction.${validation.next_action}`)}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={onViewDetails}
          className="flex-1 bg-bolt-green text-white px-4 py-2 rounded-md hover:bg-bolt-green/90 focus:outline-none focus:ring-2 focus:ring-bolt-green"
        >
          {t('common:actions.viewDetails')}
        </button>
      </div>
    </div>
  );
}

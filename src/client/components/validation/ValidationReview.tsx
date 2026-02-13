import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';

interface ValidationReviewProps {
  validationId: string;
  onComplete?: () => void;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PASS: 'badge-green',
    FAIL: 'badge-red',
    MANUAL_REVIEW: 'badge-amber',
    OVERRIDE: 'badge-purple',
    BLOCKED_INCOMPLETE: 'badge-red',
  };
  return map[status] ?? 'badge-gray';
}

export function ValidationReview({ validationId, onComplete }: ValidationReviewProps) {
  const { t } = useTranslation('validation');
  const [overrideText, setOverrideText] = useState('');
  const [showOverride, setShowOverride] = useState(false);

  const { data: validation, isLoading, refetch } = trpc.validation.getValidation.useQuery({ validationId });
  const overrideMutation = trpc.validation.requestOverride.useMutation({
    onSuccess: () => { refetch(); onComplete?.(); setShowOverride(false); }
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bolt-green" />
    </div>
  );
  if (!validation) return (
    <div className="card p-6 text-center text-gray-400">Validation not found</div>
  );

  const v = validation as any;

  return (
    <div className="card p-6 space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="section-title">{t('hardGate.title')}</h2>
          <p className="text-xs text-gray-400 mt-0.5">ID: {validationId}</p>
        </div>
        <span className={statusBadge(v.validation_status)}>{t(`hardGate.status.${v.validation_status}`)}</span>
      </div>

      {/* Score strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Confidence Score', value: `${v.confidence_score ?? 0}%`,
            ok: v.ai_confidence_threshold_met },
          { label: 'Mandatory Fields', value: v.mandatory_fields_complete ? 'Complete' : 'Incomplete',
            ok: v.mandatory_fields_complete },
          { label: 'Next Action', value: v.next_action?.replace(/_/g, ' '), ok: null },
          { label: 'Merchant', value: v.merchant_id, ok: null },
        ].map(item => (
          <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
            <p className={`text-sm font-semibold mt-0.5 ${
              item.ok === true ? 'text-bolt-green-dark'
              : item.ok === false ? 'text-red-600'
              : 'text-gray-900 dark:text-white'
            }`}>{item.value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Missing fields */}
      {v.missing_fields?.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
            {t('hardGate.mandatoryFields.missing')}
          </p>
          <ul className="list-disc list-inside space-y-1">
            {v.missing_fields.map((f: string) => (
              <li key={f} className="text-sm text-red-600 dark:text-red-400">{f}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Low confidence fields */}
      {v.low_confidence_fields?.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">
            {t('hardGate.confidence.lowConfidenceFields')}
          </p>
          <div className="flex flex-wrap gap-2">
            {v.low_confidence_fields.map((f: string) => (
              <span key={f} className="badge-amber">{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Override section */}
      {v.validation_status !== 'PASS' && v.validation_status !== 'OVERRIDE' && (
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          {!showOverride ? (
            <button className="btn-secondary w-full" onClick={() => setShowOverride(true)}>
              {t('hardGate.actions.override')} — Requires Justification
            </button>
          ) : (
            <div className="space-y-3">
              <label className="form-label">Override Justification (min 50 chars) *</label>
              <textarea
                value={overrideText}
                onChange={e => setOverrideText(e.target.value)}
                rows={4}
                className="input-field resize-none"
                placeholder="Explain why you are overriding this validation..."
              />
              <p className="text-xs text-gray-400">{overrideText.length}/50 minimum characters</p>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={() => setShowOverride(false)}>Cancel</button>
                <button
                  className="btn-primary flex-1"
                  disabled={overrideText.length < 50 || overrideMutation.isPending}
                  onClick={() => overrideMutation.mutate({ validationId, justification: overrideText })}
                >
                  Submit Override
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {v.override_by && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-sm">
          <p className="font-semibold text-purple-700 dark:text-purple-300">Overridden by {v.override_by}</p>
          <p className="text-purple-600 dark:text-purple-400 mt-1">{v.override_justification}</p>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';

interface ProfileFormProps {
  merchantId?: string;
  initialValues?: {
    commission?: string;
    campaign_type?: string;
    campaign_duration?: number;
    tablet_included?: boolean;
    tablet_model?: string;
    contract_length?: number;
    current_revenue_estimate?: number;
    employee_count?: number;
    competitors_active?: string[];
    merchant_goals?: string[];
    expected_order_volume?: string;
    expansion_plans?: string;
    price_sensitivity?: 'Low' | 'Medium' | 'High';
    owner_motivations?: string[];
    owner_concerns?: string[];
    decision_triggers?: string[];
  };
  mode: 'create' | 'update';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProfileForm({
  merchantId,
  initialValues,
  mode,
  onSuccess,
  onCancel,
}: ProfileFormProps) {
  const { t } = useTranslation('merchantProfile');

  const [formData, setFormData] = useState({
    commission: initialValues?.commission || '',
    campaign_type: initialValues?.campaign_type || '',
    campaign_duration: initialValues?.campaign_duration?.toString() || '',
    tablet_included: initialValues?.tablet_included ?? false,
    tablet_model: initialValues?.tablet_model || '',
    contract_length: initialValues?.contract_length?.toString() || '',
    current_revenue_estimate: initialValues?.current_revenue_estimate?.toString() || '',
    employee_count: initialValues?.employee_count?.toString() || '',
    competitors_active: (initialValues?.competitors_active || []).join(', '),
    merchant_goals: (initialValues?.merchant_goals || []).join(', '),
    expected_order_volume: initialValues?.expected_order_volume || '',
    expansion_plans: initialValues?.expansion_plans || '',
    price_sensitivity: initialValues?.price_sensitivity || '',
    owner_motivations: (initialValues?.owner_motivations || []).join(', '),
    owner_concerns: (initialValues?.owner_concerns || []).join(', '),
    decision_triggers: (initialValues?.decision_triggers || []).join(', '),
    notes: '',
    extractionId: '',
  });

  const [error, setError] = useState<string | null>(null);

  const createMutation = trpc.merchantProfile.createProfile.useMutation({
    onSuccess: () => onSuccess?.(),
    onError: (err) => setError(err.message),
  });

  const updateMutation = trpc.merchantProfile.updateProfile.useMutation({
    onSuccess: () => onSuccess?.(),
    onError: (err) => setError(err.message),
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const parseList = (val: string): string[] =>
    val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'create') {
      if (!formData.extractionId) {
        setError(t('form.extractionIdRequired'));
        return;
      }
      createMutation.mutate({
        extractionId: formData.extractionId,
        notes: formData.notes || undefined,
      });
    } else if (mode === 'update' && merchantId) {
      if (!formData.notes || formData.notes.length < 10) {
        setError(t('form.notesRequired'));
        return;
      }
      const updates: Record<string, any> = {};
      if (formData.commission) updates.commission = formData.commission;
      if (formData.campaign_type) updates.campaign_type = formData.campaign_type;
      if (formData.campaign_duration) updates.campaign_duration = parseInt(formData.campaign_duration);
      updates.tablet_included = formData.tablet_included;
      if (formData.tablet_model) updates.tablet_model = formData.tablet_model;
      if (formData.contract_length) updates.contract_length = parseInt(formData.contract_length);
      if (formData.current_revenue_estimate) updates.current_revenue_estimate = parseFloat(formData.current_revenue_estimate);
      if (formData.employee_count) updates.employee_count = parseInt(formData.employee_count);
      if (formData.competitors_active) updates.competitors_active = parseList(formData.competitors_active);
      if (formData.merchant_goals) updates.merchant_goals = parseList(formData.merchant_goals);
      if (formData.expected_order_volume) updates.expected_order_volume = formData.expected_order_volume;
      if (formData.expansion_plans) updates.expansion_plans = formData.expansion_plans;
      if (formData.price_sensitivity) updates.price_sensitivity = formData.price_sensitivity as 'Low' | 'Medium' | 'High';
      if (formData.owner_motivations) updates.owner_motivations = parseList(formData.owner_motivations);
      if (formData.owner_concerns) updates.owner_concerns = parseList(formData.owner_concerns);
      if (formData.decision_triggers) updates.decision_triggers = parseList(formData.decision_triggers);

      updateMutation.mutate({
        merchantId,
        updates,
        notes: formData.notes,
      });
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent';
  const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {mode === 'create' && (
        <div>
          <label className={labelCls}>{t('form.extractionId')} *</label>
          <input
            type="text"
            value={formData.extractionId}
            onChange={set('extractionId')}
            className={inputCls}
            placeholder="e.g. extraction-uuid"
            required
          />
          <p className="mt-1 text-xs text-gray-500">{t('form.extractionIdHint')}</p>
        </div>
      )}

      {/* Contract Terms */}
      <fieldset>
        <legend className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-1 border-b border-gray-200 dark:border-gray-600 w-full">
          {t('form.sections.contractTerms')}
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t('fields.commission')} (%)</label>
            <input type="text" value={formData.commission} onChange={set('commission')} className={inputCls} placeholder="e.g. 15" />
          </div>
          <div>
            <label className={labelCls}>{t('fields.contractLength')} ({t('fields.months')})</label>
            <input type="number" value={formData.contract_length} onChange={set('contract_length')} className={inputCls} min="1" />
          </div>
          <div>
            <label className={labelCls}>{t('fields.campaignType')}</label>
            <input type="text" value={formData.campaign_type} onChange={set('campaign_type')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t('fields.campaignDuration')} ({t('fields.weeks')})</label>
            <input type="number" value={formData.campaign_duration} onChange={set('campaign_duration')} className={inputCls} min="1" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="tablet_included" checked={formData.tablet_included} onChange={set('tablet_included')} className="w-4 h-4 text-green-500" />
            <label htmlFor="tablet_included" className={labelCls.replace('mb-1', '')}>{t('fields.tabletIncluded')}</label>
          </div>
          <div>
            <label className={labelCls}>{t('fields.tabletModel')}</label>
            <input type="text" value={formData.tablet_model} onChange={set('tablet_model')} className={inputCls} />
          </div>
        </div>
      </fieldset>

      {/* Business Context */}
      <fieldset>
        <legend className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-1 border-b border-gray-200 dark:border-gray-600 w-full">
          {t('form.sections.businessContext')}
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t('fields.revenue')} (€)</label>
            <input type="number" value={formData.current_revenue_estimate} onChange={set('current_revenue_estimate')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t('fields.employeeCount')}</label>
            <input type="number" value={formData.employee_count} onChange={set('employee_count')} className={inputCls} min="1" />
          </div>
          <div>
            <label className={labelCls}>{t('fields.priceSensitivity')}</label>
            <select value={formData.price_sensitivity} onChange={set('price_sensitivity')} className={inputCls}>
              <option value="">— {t('form.selectOption')} —</option>
              <option value="Low">{t('sensitivity.low')}</option>
              <option value="Medium">{t('sensitivity.medium')}</option>
              <option value="High">{t('sensitivity.high')}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t('fields.expectedVolume')}</label>
            <input type="text" value={formData.expected_order_volume} onChange={set('expected_order_volume')} className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>{t('fields.competitors')} ({t('form.commaSeparated')})</label>
            <input type="text" value={formData.competitors_active} onChange={set('competitors_active')} className={inputCls} placeholder="Competitor A, Competitor B" />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>{t('fields.merchantGoals')} ({t('form.commaSeparated')})</label>
            <input type="text" value={formData.merchant_goals} onChange={set('merchant_goals')} className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>{t('fields.expansionPlans')}</label>
            <textarea value={formData.expansion_plans} onChange={set('expansion_plans')} className={inputCls} rows={2} />
          </div>
        </div>
      </fieldset>

      {/* Owner Psychology */}
      {mode === 'update' && (
        <fieldset>
          <legend className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-1 border-b border-gray-200 dark:border-gray-600 w-full">
            {t('form.sections.ownerPsychology')}
          </legend>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>{t('fields.ownerMotivations')} ({t('form.commaSeparated')})</label>
              <input type="text" value={formData.owner_motivations} onChange={set('owner_motivations')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t('fields.ownerConcerns')} ({t('form.commaSeparated')})</label>
              <input type="text" value={formData.owner_concerns} onChange={set('owner_concerns')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t('fields.decisionTriggers')} ({t('form.commaSeparated')})</label>
              <input type="text" value={formData.decision_triggers} onChange={set('decision_triggers')} className={inputCls} />
            </div>
          </div>
        </fieldset>
      )}

      {/* Update Notes */}
      <div>
        <label className={labelCls}>
          {t('form.updateNotes')} {mode === 'update' && '*'}
        </label>
        <textarea
          value={formData.notes}
          onChange={set('notes')}
          className={inputCls}
          rows={3}
          placeholder={t('form.updateNotesPlaceholder')}
          required={mode === 'update'}
        />
        {mode === 'update' && (
          <p className="mt-1 text-xs text-gray-500">{t('form.notesMinLength')}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-md transition-colors"
        >
          {isLoading
            ? t('form.saving')
            : mode === 'create'
            ? t('form.createProfile')
            : t('form.saveChanges')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('form.cancel')}
          </button>
        )}
      </div>
    </form>
  );
}

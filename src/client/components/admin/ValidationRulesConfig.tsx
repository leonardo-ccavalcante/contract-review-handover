import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';

const DEFAULT_FIELDS = [
  'merchant_name', 'commission_percentage', 'campaign_type',
  'campaign_duration', 'tablet_included', 'contract_length',
  'merchant_goals', 'competitors',
];

export function ValidationRulesConfig() {
  const { t } = useTranslation('admin');
  const { data: rules, refetch } = trpc.admin.getValidationRules.useQuery();
  const updateMutation = trpc.admin.updateValidationRules.useMutation({
    onSuccess: () => { refetch(); setSaved(true); setTimeout(() => setSaved(false), 3000); }
  });

  const [threshold, setThreshold] = useState(90);
  const [fields, setFields] = useState<string[]>(DEFAULT_FIELDS);
  const [newField, setNewField] = useState('');
  const [minChars, setMinChars] = useState(50);
  const [slaHours, setSlaHours] = useState(2);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (rules) {
      setThreshold(rules.confidence_threshold ?? 90);
      setFields((rules.mandatory_fields as string[]) ?? DEFAULT_FIELDS);
      setMinChars(rules.override_requires_justification_min_chars ?? 50);
      setSlaHours(rules.sales_ops_sla_hours ?? 2);
      setNotes(rules.notes ?? '');
    }
  }, [rules]);

  function handleSave() {
    if (!rules) return;
    updateMutation.mutate({
      ruleId: rules.rule_id,
      confidence_threshold: threshold,
      mandatory_fields: fields,
      override_requires_justification_min_chars: minChars,
      sales_ops_sla_hours: slaHours,
      notes,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">{t('validationRules.title')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('validationRules.subtitle')}</p>
      </div>

      <div className="card p-6 space-y-6">
        {/* Confidence threshold */}
        <div>
          <label className="form-label">{t('validationRules.confidenceThreshold')}</label>
          <div className="flex items-center gap-4">
            <input type="range" min={50} max={100} step={1} value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="flex-1 accent-bolt-green" />
            <span className="w-12 text-center font-bold text-bolt-green-dark text-lg">{threshold}%</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{t('validationRules.confidenceHelp')}</p>
        </div>

        {/* Mandatory fields */}
        <div>
          <label className="form-label">{t('validationRules.mandatoryFields')}</label>
          <p className="text-xs text-gray-400 mb-3">{t('validationRules.mandatoryHelp')}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {fields.map(f => (
              <span key={f} className="inline-flex items-center gap-1 px-3 py-1 bg-bolt-green-light
                                       text-bolt-green-dark text-xs font-medium rounded-full">
                {f}
                <button onClick={() => setFields(prev => prev.filter(x => x !== f))}
                  className="ml-0.5 hover:text-red-600 transition-colors">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newField} onChange={e => setNewField(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newField.trim()) { setFields(p => [...p, newField.trim()]); setNewField(''); } }}
              className="input-field flex-1" placeholder="new_field_name" />
            <button className="btn-secondary" onClick={() => { if (newField.trim()) { setFields(p => [...p, newField.trim()]); setNewField(''); } }}>
              {t('validationRules.addField')}
            </button>
          </div>
        </div>

        {/* Override / SLA */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="form-label">{t('validationRules.minJustificationChars')}</label>
            <input type="number" min={10} max={500} value={minChars} onChange={e => setMinChars(Number(e.target.value))}
              className="input-field" />
          </div>
          <div>
            <label className="form-label">{t('validationRules.salesOpsSlaHours')}</label>
            <input type="number" min={1} max={72} value={slaHours} onChange={e => setSlaHours(Number(e.target.value))}
              className="input-field" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="form-label">{t('validationRules.notes')}</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            className="input-field resize-none" />
        </div>

        {saved && (
          <div className="bg-bolt-green-light rounded-lg p-3 text-sm text-bolt-green-dark font-medium">
            {t('validationRules.saved')}
          </div>
        )}

        <div className="flex justify-end">
          <button className="btn-primary" onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : t('common:actions.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';

interface ResolutionFormProps {
  auditId: string;
}

export function ResolutionForm({ auditId }: ResolutionFormProps) {
  const { t } = useTranslation('contractAudit');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState<
    'In Progress' | 'Resolved' | 'Accepted Risk'
  >('In Progress');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateResolutionMutation = trpc.contractAudit.updateResolution.useMutation();
  const utils = trpc.useContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (resolutionNotes.trim().length < 20) {
      setError(t('resolution.notesTooShort'));
      return;
    }

    setIsSubmitting(true);

    try {
      await updateResolutionMutation.mutateAsync({
        auditId,
        resolutionNotes: resolutionNotes.trim(),
        resolutionStatus,
      });

      setSuccess(true);
      // Refetch audit data
      utils.contractAudit.getAudit.invalidate({ auditId });
    } catch (err) {
      setError((err as Error).message || t('resolution.updateFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="resolution-form card">
      <h2>{t('resolution.title')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="resolutionStatus">{t('resolution.status')}</label>
          <select
            id="resolutionStatus"
            value={resolutionStatus}
            onChange={(e) =>
              setResolutionStatus(
                e.target.value as 'In Progress' | 'Resolved' | 'Accepted Risk'
              )
            }
            disabled={isSubmitting}
          >
            <option value="In Progress">{t('resolution.inProgress')}</option>
            <option value="Resolved">{t('resolution.resolved')}</option>
            <option value="Accepted Risk">{t('resolution.acceptedRisk')}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="resolutionNotes">{t('resolution.notes')}</label>
          <textarea
            id="resolutionNotes"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder={t('resolution.notesPlaceholder')}
            rows={5}
            disabled={isSubmitting}
          />
          <p className="help-text">
            {t('resolution.notesHelp')} ({resolutionNotes.trim().length}/20)
          </p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            <span>{t('resolution.updateSuccess')}</span>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting || resolutionNotes.trim().length < 20}
            className="btn-primary"
          >
            {isSubmitting ? t('resolution.submitting') : t('resolution.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

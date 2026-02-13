import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../../utils/trpc';

export function ContractUpload() {
  const { t } = useTranslation('contractAudit');
  const navigate = useNavigate();
  const [contractId, setContractId] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeAuditMutation = trpc.contractAudit.executeAudit.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError(t('upload.invalidFileType'));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setError(t('upload.fileTooLarge'));
        return;
      }
      setPdfFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!contractId.trim()) {
      setError(t('upload.contractIdRequired'));
      return;
    }

    if (!pdfFile) {
      setError(t('upload.fileRequired'));
      return;
    }

    setIsUploading(true);

    try {
      // Convert PDF to base64
      const base64 = await fileToBase64(pdfFile);

      // Execute audit
      const result = await executeAuditMutation.mutateAsync({
        contractId: contractId.trim(),
        pdfBase64: base64,
      });

      // Navigate to audit results
      if (result.success) {
        navigate(`/audits/${result.audit.audit_id}`);
      }
    } catch (err) {
      setError((err as Error).message || t('upload.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:application/pdf;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="contract-upload">
      <div className="upload-header">
        <h2>{t('upload.title')}</h2>
        <p className="subtitle">{t('upload.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="contractId">{t('upload.contractId')}</label>
          <input
            type="text"
            id="contractId"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            placeholder={t('upload.contractIdPlaceholder')}
            disabled={isUploading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="pdfFile">{t('upload.pdfFile')}</label>
          <div className="file-input-wrapper">
            <input
              type="file"
              id="pdfFile"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {pdfFile && (
              <div className="file-info">
                <span className="file-name">{pdfFile.name}</span>
                <span className="file-size">
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}
          </div>
          <p className="help-text">{t('upload.fileHelp')}</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={isUploading || !contractId || !pdfFile}
            className="btn-primary"
          >
            {isUploading ? (
              <>
                <span className="spinner" />
                {t('upload.analyzing')}
              </>
            ) : (
              t('upload.startAudit')
            )}
          </button>
        </div>
      </form>

      <div className="upload-info">
        <h3>{t('upload.howItWorks')}</h3>
        <ol>
          <li>{t('upload.step1')}</li>
          <li>{t('upload.step2')}</li>
          <li>{t('upload.step3')}</li>
          <li>{t('upload.step4')}</li>
        </ol>
      </div>
    </div>
  );
}

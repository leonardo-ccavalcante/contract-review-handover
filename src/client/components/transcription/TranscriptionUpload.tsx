import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';

interface TranscriptionUploadProps {
  onSuccess?: (callId: string) => void;
}

export function TranscriptionUpload({ onSuccess }: TranscriptionUploadProps) {
  const { t } = useTranslation('common');
  const [tab, setTab] = useState<'paste' | 'file'>('paste');
  const [text, setText] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [salesManagerId, setSalesManagerId] = useState('');
  const [callDate, setCallDate] = useState(new Date().toISOString().slice(0, 10));
  const [callType, setCallType] = useState<string>('INITIAL');
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.validation.executeHardGate.useMutation();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setText(ev.target?.result as string ?? '');
    reader.readAsText(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !merchantId.trim()) return;
    setStatus('uploading');
    setErrorMsg('');
    try {
      // In a real app this would call a transcription.create endpoint.
      // We fire validation directly with a mock extraction ID for demo.
      const result = await uploadMutation.mutateAsync({ extractionId: `ext-${Date.now()}` });
      setStatus('success');
      onSuccess?.((result as any)?.extraction_id ?? '');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message ?? 'Upload failed');
    }
  }

  return (
    <div className="card p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="section-title">Upload Call Transcription</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Paste or upload a call transcription to trigger AI extraction and validation
        </p>
      </div>

      {/* Merchant info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Merchant ID *</label>
          <input value={merchantId} onChange={e => setMerchantId(e.target.value)}
            className="input-field" placeholder="e.g. MCH-001" required />
        </div>
        <div>
          <label className="form-label">Sales Manager ID</label>
          <input value={salesManagerId} onChange={e => setSalesManagerId(e.target.value)}
            className="input-field" placeholder="e.g. SM-042" />
        </div>
        <div>
          <label className="form-label">Call Date *</label>
          <input type="date" value={callDate} onChange={e => setCallDate(e.target.value)}
            className="input-field" required />
        </div>
        <div>
          <label className="form-label">Call Type</label>
          <select value={callType} onChange={e => setCallType(e.target.value)} className="input-field">
            <option value="INITIAL">Initial</option>
            <option value="FOLLOW_UP">Follow-up</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="CLOSING">Closing</option>
          </select>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {['paste', 'file'].map(t2 => (
          <button key={t2}
            type="button"
            onClick={() => setTab(t2 as any)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === t2
                ? 'bg-bolt-green text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}>
            {t2 === 'paste' ? 'Paste Text' : 'Upload File'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === 'paste' ? (
          <div>
            <label className="form-label">Transcription Text *</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={10}
              className="input-field resize-y"
              placeholder="Paste the full call transcription here..."
              required
            />
            <p className="text-xs text-gray-400 mt-1">{text.length.toLocaleString()} characters</p>
          </div>
        ) : (
          <div>
            <input ref={fileRef} type="file" accept=".txt,.md,.doc,.docx" className="hidden"
              onChange={handleFileChange} />
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-bolt p-8
                         text-center cursor-pointer hover:border-bolt-green transition-colors">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {fileName
                ? <p className="text-sm font-medium text-bolt-green-dark">{fileName}</p>
                : <><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to select file</p>
                    <p className="text-xs text-gray-400 mt-1">.txt, .md, .doc, .docx</p></>
              }
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
            {errorMsg}
          </div>
        )}
        {status === 'success' && (
          <div className="bg-bolt-green-light rounded-lg p-3 text-sm text-bolt-green-dark font-medium">
            Transcription uploaded successfully. Validation triggered.
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={() => { setText(''); setFileName(null); setStatus('idle'); }}>
            Clear
          </button>
          <button type="submit" className="btn-primary" disabled={status === 'uploading' || !text.trim()}>
            {status === 'uploading' ? (
              <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></span> Uploading...</>
            ) : 'Upload & Validate'}
          </button>
        </div>
      </form>
    </div>
  );
}

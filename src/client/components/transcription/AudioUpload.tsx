import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

type UploadState = 'idle' | 'selected' | 'uploading' | 'transcribing' | 'done' | 'error';

export function AudioUpload() {
  const [state, setState] = useState<UploadState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [merchantId, setMerchantId] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const nav = useNavigate();

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && isAudio(f)) { setFile(f); setState('selected'); }
  }

  function isAudio(f: File) {
    return ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/webm'].includes(f.type)
      || /\.(mp3|wav|m4a|ogg|webm)$/i.test(f.name);
  }

  async function handleUpload() {
    if (!file || !merchantId.trim()) return;
    setState('uploading');
    setProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 60; i += 10) {
      await new Promise(r => setTimeout(r, 150));
      setProgress(i);
    }
    setState('transcribing');
    for (let i = 60; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 300));
      setProgress(i);
    }
    setState('done');
  }

  const formatSize = (bytes: number) =>
    bytes > 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(0)} KB`;

  return (
    <div className="card p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="section-title">Upload Audio Recording</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Upload a sales call audio file. We'll transcribe it automatically and run validation.
        </p>
      </div>

      <div>
        <label className="form-label">Merchant ID *</label>
        <input value={merchantId} onChange={e => setMerchantId(e.target.value)}
          className="input-field" placeholder="e.g. MCH-001" />
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-bolt p-10 text-center cursor-pointer transition-colors ${
          file ? 'border-bolt-green bg-bolt-green-50' : 'border-gray-200 dark:border-gray-600 hover:border-bolt-green'
        }`}
      >
        <input ref={fileRef} type="file" accept=".mp3,.wav,.m4a,.ogg,.webm,audio/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setState('selected'); } }} />

        {file ? (
          <div className="space-y-1">
            <svg className="w-10 h-10 text-bolt-green mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
            </svg>
            <p className="font-medium text-bolt-green-dark">{file.name}</p>
            <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drag & drop or click to select</p>
            <p className="text-xs text-gray-400">MP3, WAV, M4A, OGG up to 500 MB</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {(state === 'uploading' || state === 'transcribing') && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{state === 'uploading' ? 'Uploading...' : 'Transcribing with AI...'}</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {state === 'done' && (
        <div className="bg-bolt-green-light rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-bolt-green-dark">Transcription complete!</p>
            <p className="text-sm text-green-600">Validation has been triggered automatically.</p>
          </div>
          <button className="btn-primary text-xs" onClick={() => nav('/validation')}>
            View Validation →
          </button>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button className="btn-secondary" onClick={() => { setFile(null); setState('idle'); setProgress(0); }}>Clear</button>
        <button
          className="btn-primary"
          disabled={!file || !merchantId.trim() || state === 'uploading' || state === 'transcribing'}
          onClick={handleUpload}
        >
          {state === 'uploading' || state === 'transcribing'
            ? <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></span> Processing...</>
            : 'Upload & Transcribe'
          }
        </button>
      </div>
    </div>
  );
}

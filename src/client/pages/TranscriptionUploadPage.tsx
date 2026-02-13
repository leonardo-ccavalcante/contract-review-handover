import { useSearchParams } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { TranscriptionUpload } from '../components/transcription/TranscriptionUpload';
import { AudioUpload } from '../components/transcription/AudioUpload';
import { useState } from 'react';

export function TranscriptionUploadPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') ?? 'text';
  const [activeMode, setActiveMode] = useState<'text' | 'audio'>(mode as any);

  return (
    <Layout>
      <div className="page-container max-w-3xl mx-auto">
        <div className="flex gap-4 items-center justify-center">
          {(['text', 'audio'] as const).map(m => (
            <button key={m} onClick={() => setActiveMode(m)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeMode === m
                  ? 'bg-bolt-green text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-bolt-green'
              }`}>
              {m === 'text' ? '📄 Text Transcription' : '🎙️ Audio Recording'}
            </button>
          ))}
        </div>
        {activeMode === 'text' ? <TranscriptionUpload /> : <AudioUpload />}
      </div>
    </Layout>
  );
}

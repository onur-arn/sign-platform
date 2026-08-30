'use client';

import { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface FileUploadProps {
  onTextExtracted: (text: string, fileUrl?: string) => void;
}

export default function FileUpload({ onTextExtracted }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const { dark } = useDarkMode();
  const { t } = useLanguage();
  const teal = '#5ba4b0';
  const textSub = dark ? 'rgba(255,255,255,0.5)' : '#64748b';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.dashboard.uploadError);
        return;
      }

      onTextExtracted(data.text);
      setFileName('');
    } catch (err) {
      console.error('PDF extraction error:', err);
      setError(t.dashboard.uploadError);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer"
        style={{ borderColor: 'rgba(91,164,176,0.35)' }}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(91,164,176,0.12)' }}>
              <svg className="h-8 w-8" stroke={teal} fill="none" viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-sm" style={{ color: textSub }}>
              {uploading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent" style={{ borderColor: teal, borderTopColor: 'transparent' }}></div>
                  <span className="font-medium">{t.dashboard.uploadProcessing} {fileName}...</span>
                </div>
              ) : (
                <>
                  <span className="font-medium" style={{ color: teal }}>{t.dashboard.uploadClick}</span>
                  <span> {t.dashboard.uploadDrag}</span>
                  <p className="text-xs mt-2" style={{ color: textSub }}>{t.dashboard.uploadHint}</p>
                </>
              )}
            </div>
          </div>
        </label>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}

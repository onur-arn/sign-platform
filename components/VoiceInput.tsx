'use client';

import { useState } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onCopyToText?: (text: string) => void;
}

const LANGUAGES_FR = [
  { code: 'fr-FR', name: '🇫🇷 Français' },
  { code: 'tr-TR', name: '🇹🇷 Turc' },
  { code: 'en-GB', name: '🇬🇧 Anglais (UK)' },
  { code: 'en-US', name: '🇺🇸 Anglais (US)' },
];

const LANGUAGES_EN = [
  { code: 'fr-FR', name: '🇫🇷 French' },
  { code: 'tr-TR', name: '🇹🇷 Turkish' },
  { code: 'en-GB', name: '🇬🇧 English (UK)' },
  { code: 'en-US', name: '🇺🇸 English (US)' },
];

const LANGUAGES_TR = [
  { code: 'fr-FR', name: '🇫🇷 Fransızca' },
  { code: 'tr-TR', name: '🇹🇷 Türkçe' },
  { code: 'en-GB', name: '🇬🇧 İngilizce (UK)' },
  { code: 'en-US', name: '🇺🇸 İngilizce (US)' },
];

export default function VoiceInput({ onTranscript, onCopyToText }: VoiceInputProps) {
  const [selectedLang, setSelectedLang] = useState('fr-FR');
  const { t, language } = useLanguage();
  const { dark } = useDarkMode();
  const { isListening, setIsListening, transcript, setTranscript, isSupported, error } = useSpeechRecognition({ language: selectedLang });
  const LANGUAGES = language === 'en' ? LANGUAGES_EN : language === 'tr' ? LANGUAGES_TR : LANGUAGES_FR;

  const handleToggle = () => {
    if (isListening) {
      setIsListening(false);
      if (transcript) {
        onTranscript(transcript);
      }
    } else {
      setTranscript('');
      setIsListening(true);
    }
  };

  const handleClear = () => {
    setTranscript('');
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        La reconnaissance vocale n'est pas supportée par votre navigateur.
        Veuillez utiliser Chrome ou Edge.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3 h-full">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Language select — full width */}
      <div className="relative w-full">
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          disabled={isListening}
          className="w-full appearance-none px-3 py-2.5 pr-8 border rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#5ba4b0] focus:border-[#5ba4b0] outline-none"
          style={{ borderColor: 'rgba(91,164,176,0.3)', color: '#1e3a40', background: '#f9fefe' }}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center">
          <svg className="w-3.5 h-3.5 text-[#5ba4b0]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Listening indicator + transcript fill the middle */}
      {isListening && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border" style={{ background: 'rgba(91,164,176,0.06)', borderColor: 'rgba(91,164,176,0.2)' }}>
          <div className="flex gap-1">
            {[0, 150, 300].map(d => (
              <span key={d} className="w-1 h-4 rounded-full animate-pulse" style={{ background: '#5ba4b0', animationDelay: `${d}ms` }} />
            ))}
          </div>
          <span className="text-sm font-medium" style={{ color: '#5ba4b0' }}>{t.dashboard.voiceListening}</span>
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="flex-1 flex flex-col min-h-0 rounded-xl border overflow-hidden" style={{ background: 'rgba(91,164,176,0.04)', borderColor: 'rgba(91,164,176,0.2)' }}>
          <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#5ba4b0' }}>{t.dashboard.voiceTranscript}</p>
            <button onClick={handleClear} className="text-xs px-2 py-1 rounded-lg transition-all hover:shadow-sm cursor-pointer"
              style={{ background: 'rgba(91,164,176,0.1)', color: '#5ba4b0' }}>
              {t.dashboard.voiceClear}
            </button>
          </div>
          <p className="px-3 pb-3 text-sm" style={{ color: dark ? 'rgba(255,255,255,0.85)' : '#1e3a40' }}>{transcript}</p>
        </div>
      )}

      {/* Speak / Stop + Copy buttons — pinned to bottom */}
      <div className="mt-auto flex gap-2">
        <button
          onClick={handleToggle}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all text-white cursor-pointer ${isListening ? 'animate-pulse' : 'hover:shadow-md hover:scale-[1.01]'}`}
          style={{ background: isListening ? '#e11d48' : '#5ba4b0' }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          {isListening ? t.dashboard.voiceStop : t.dashboard.voiceSpeak}
        </button>
        {onCopyToText && transcript && (
          <button
            onClick={() => onCopyToText(transcript)}
            className="shrink-0 flex items-center justify-center gap-1 px-3 py-3 rounded-xl text-xs font-semibold transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer"
            style={{ background: 'rgba(91,164,176,0.12)', color: '#5ba4b0', border: '1px solid rgba(91,164,176,0.3)' }}
            title="Copier dans la zone texte"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Texte
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  setIsListening: (value: boolean) => void;
  transcript: string;
  setTranscript: (value: string) => void;
  isSupported: boolean;
  error: string | null;
}

interface UseSpeechRecognitionProps {
  language?: string;
}

export function useSpeechRecognition({ language = 'fr-FR' }: UseSpeechRecognitionProps = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = language;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' ';
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Erreur de reconnaissance vocale:', event.error);
      setIsListening(false);
      
      switch (event.error) {
        case 'not-allowed':
          setError('Accès au microphone refusé. Veuillez autoriser l\'accès au microphone dans les paramètres de votre navigateur.');
          break;
        case 'no-speech':
          setError('Aucun son détecté. Veuillez vérifier votre microphone.');
          break;
        case 'audio-capture':
          setError('Microphone introuvable. Vérifiez qu\'un microphone est connecté.');
          break;
        case 'network':
          setError('Erreur réseau. Vérifiez votre connexion internet.');
          break;
        default:
          setError(`Erreur de reconnaissance vocale: ${event.error}`);
      }
    };

    if (isListening) {
      setError(null);
      try {
        recognition.start();
      } catch (err) {
        console.error('Erreur au démarrage:', err);
        setError('Impossible de démarrer la reconnaissance vocale.');
        setIsListening(false);
      }
    } else {
      recognition.stop();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening, language]);

  return { isListening, setIsListening, transcript, setTranscript, isSupported, error };
}

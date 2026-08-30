'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseSpeechRecognitionReturn {
  isListening: boolean
  setIsListening: (value: boolean) => void
  transcript: string
  setTranscript: (value: string) => void
  isSupported: boolean
  error: string | null
}

interface UseSpeechRecognitionProps {
  language?: string
  /**
   * Arrêt auto après silence (ms).
   * `0` = pas d’arrêt auto (l’utilisateur arrête au bouton).
   */
  silenceMs?: number
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function useSpeechRecognition({
  language = 'fr-FR',
  silenceMs = 0,
}: UseSpeechRecognitionProps = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscriptState] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const listeningRef = useRef(false)
  const finalRef = useRef('')
  const languageRef = useRef(language)
  const silenceMsRef = useRef(silenceMs)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const startingRef = useRef(false)

  languageRef.current = language
  silenceMsRef.current = silenceMs

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }

  const clearRestartTimer = () => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
  }

  const releaseMic = () => {
    micStreamRef.current?.getTracks().forEach((t) => t.stop())
    micStreamRef.current = null
  }

  const ensureMic = async () => {
    if (micStreamRef.current?.active) return
    releaseMic()
    if (!navigator.mediaDevices?.getUserMedia) return
    micStreamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })
  }

  const startRecognition = () => {
    const recognition = recognitionRef.current
    if (!recognition || !listeningRef.current || startingRef.current) return
    try {
      recognition.lang = languageRef.current
      startingRef.current = true
      recognition.start()
    } catch {
      startingRef.current = false
    }
  }

  const finishListening = useCallback(() => {
    clearSilenceTimer()
    clearRestartTimer()
    listeningRef.current = false
    setIsListening(false)
    startingRef.current = false
    try {
      recognitionRef.current?.stop()
    } catch {
      /* ignore */
    }
    releaseMic()
  }, [])

  const setTranscript = useCallback((value: string) => {
    finalRef.current = value
    setTranscriptState(value)
  }, [])

  // Instance unique de SpeechRecognition (comme une session durable)
  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)
    const recognition = new Ctor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.lang = languageRef.current

    recognition.onstart = () => {
      startingRef.current = false
    }

    recognition.onresult = (event) => {
      let interim = ''
      let finalChunk = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i]![0]!.transcript
        if (event.results[i]!.isFinal) finalChunk += `${piece} `
        else interim += piece
      }
      if (finalChunk) finalRef.current += finalChunk
      setTranscriptState(`${finalRef.current}${interim}`.replace(/^\s+/, ''))

      clearSilenceTimer()
      if (!listeningRef.current) return
      const wait = silenceMsRef.current
      if (wait > 0) {
        silenceTimerRef.current = setTimeout(() => {
          if (!listeningRef.current) return
          finishListening()
        }, wait)
      }
    }

    recognition.onerror = (event) => {
      startingRef.current = false
      if (event.error === 'aborted' || event.error === 'interrupted') return

      // Silence momentané : on relance si l’écoute est toujours demandée
      if (event.error === 'no-speech') {
        if (listeningRef.current) {
          clearRestartTimer()
          restartTimerRef.current = setTimeout(() => {
            if (listeningRef.current) startRecognition()
          }, 120)
        }
        return
      }

      clearSilenceTimer()
      clearRestartTimer()
      listeningRef.current = false
      setIsListening(false)
      releaseMic()

      switch (event.error) {
        case 'not-allowed':
          setError(
            "Accès au microphone refusé. Autorisez le micro dans les paramètres du navigateur.",
          )
          break
        case 'audio-capture':
          setError('Microphone introuvable. Vérifiez qu’un microphone est connecté.')
          break
        case 'network':
          setError('Erreur réseau. Vérifiez votre connexion internet.')
          break
        default:
          setError(`Erreur de reconnaissance vocale: ${event.error}`)
      }
    }

    recognition.onend = () => {
      startingRef.current = false
      clearSilenceTimer()
      // Chrome coupe souvent malgré continuous=true → relancer
      if (listeningRef.current) {
        clearRestartTimer()
        restartTimerRef.current = setTimeout(() => {
          if (listeningRef.current) startRecognition()
        }, 80)
      }
    }

    recognitionRef.current = recognition

    return () => {
      listeningRef.current = false
      clearSilenceTimer()
      clearRestartTimer()
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.onstart = null
      try {
        recognition.abort()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
      releaseMic()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- instance unique au montage
  }, [])

  useEffect(() => {
    if (recognitionRef.current) recognitionRef.current.lang = language
  }, [language])

  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    if (!isListening) {
      clearSilenceTimer()
      clearRestartTimer()
      startingRef.current = false
      try {
        recognition.stop()
      } catch {
        /* ignore */
      }
      releaseMic()
      return
    }

    setError(null)
    clearSilenceTimer()
    clearRestartTimer()
    listeningRef.current = true

    let cancelled = false
    ;(async () => {
      try {
        await ensureMic()
        if (cancelled || !listeningRef.current) return
        startRecognition()
      } catch {
        if (cancelled) return
        setError(
          "Accès au microphone refusé. Autorisez le micro dans les paramètres du navigateur.",
        )
        listeningRef.current = false
        setIsListening(false)
        releaseMic()
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isListening, finishListening])

  return {
    isListening,
    setIsListening: (value: boolean) => {
      if (!value) finishListening()
      else {
        listeningRef.current = true
        setIsListening(true)
      }
    },
    transcript,
    setTranscript,
    isSupported,
    error,
  }
}

'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import SignLanguageAvatar, { type SignFrame } from '@/components/avatar/SignLanguageAvatar'
import FemaleSignLanguageAvatar from '@/components/avatar/FemaleSignLanguageAvatar'
import AvatarLoadingOverlay from '@/components/avatar/AvatarLoadingOverlay'
import { trimLeadingHold, trimTrailingRest } from '@/components/avatar/trimSignMotion'
import { useAvatar } from '@/contexts/AvatarContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSignLabel } from '@/lib/signLabels'

const SIGNS_CDN = (
  process.env.NEXT_PUBLIC_SIGNS_CDN ?? 'https://pub-7da8c20292624389aac188ff567fa99f.r2.dev'
).replace(/\/$/, '')

function decodeFrame(raw: Record<string, unknown>): SignFrame {
  if ('pose' in raw) return raw as unknown as SignFrame
  const toXYZ = (arr: number[]) => ({ x: arr[0]!, y: arr[1]!, z: arr[2]! })
  const p = ((raw.p as number[][]) ?? []).map(toXYZ)
  const frame: SignFrame = { pose: p }
  if (raw.r) frame.right_hand = (raw.r as number[][]).map(toXYZ)
  if (raw.l) frame.left_hand = (raw.l as number[][]).map(toXYZ)
  if (raw.ra) {
    const [s, u, f] = raw.ra as number[][]
    frame.right_arm = { shoulder: toXYZ(s!), upper_arm: toXYZ(u!), forearm: toXYZ(f!) }
  }
  if (raw.la) {
    const [s, u, f] = raw.la as number[][]
    frame.left_arm = { shoulder: toXYZ(s!), upper_arm: toXYZ(u!), forearm: toXYZ(f!) }
  }
  return frame
}

async function parseSign(res: Response): Promise<{ frames: SignFrame[]; fps: number }> {
  const data = await res.json()
  if (Array.isArray(data)) {
    return { frames: data.map((f) => decodeFrame(f as Record<string, unknown>)), fps: 25 }
  }
  const frames = ((data.frames as Record<string, unknown>[]) ?? []).map(decodeFrame)
  return { frames, fps: data.fps ?? 25 }
}

async function loadSign(
  id: string,
  opts?: { trimHold?: boolean },
): Promise<{ frames: SignFrame[]; fps: number }> {
  const baseId = id.replace(/_\d+$/, '')
  const candidates = [
    `/signs/${id}.json`,
    `${SIGNS_CDN}/signs/${id}.json`,
    ...(baseId !== id
      ? [`/signs/${baseId}.json`, `${SIGNS_CDN}/signs/${baseId}.json`]
      : []),
  ]

  let lastErr: unknown
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: 'force-cache' })
      if (!res.ok) continue
      const parsed = await parseSign(res)
      const valid = parsed.frames.filter((f) => Array.isArray(f?.pose) && f.pose.length >= 25)
      if (valid.length === 0) continue
      const frames =
        opts?.trimHold === false
          ? valid
          : trimTrailingRest(trimLeadingHold(valid, parsed.fps), parsed.fps)
      if (frames.length === 0) continue
      return { frames, fps: parsed.fps }
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr ?? new Error(`Signe ${id} introuvable`)
}

type CameraView = 'close' | 'general'

const CAMERA_PRESETS: Record<
  CameraView,
  { pos: [number, number, number]; target: [number, number, number]; fov: number }
> = {
  close: { pos: [0, 0.7, 2.2], target: [0, 0.3, 0], fov: 45 },
  general: { pos: [0, 1.0, 2.8], target: [0, 0.0, 0], fov: 55 },
}

function CameraController({ view }: { view: CameraView }) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const isAnimating = useRef(false)
  const isFirstRender = useRef(true)
  const targetPos = useRef(new THREE.Vector3(...CAMERA_PRESETS[view].pos))
  const targetLook = useRef(new THREE.Vector3(...CAMERA_PRESETS[view].target))

  useEffect(() => {
    const p = CAMERA_PRESETS[view]
    targetPos.current.set(...p.pos)
    targetLook.current.set(...p.target)
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = p.fov
    cam.updateProjectionMatrix()
    if (isFirstRender.current) {
      camera.position.set(...p.pos)
      if (controlsRef.current) {
        controlsRef.current.target.set(...p.target)
        controlsRef.current.update()
      }
      isFirstRender.current = false
      return
    }
    isAnimating.current = true
  }, [view, camera])

  useFrame(() => {
    if (!isAnimating.current) return
    camera.position.lerp(targetPos.current, 0.08)
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook.current, 0.08)
      controlsRef.current.update()
    }
    if (camera.position.distanceTo(targetPos.current) < 0.005) {
      camera.position.copy(targetPos.current)
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLook.current)
        controlsRef.current.update()
      }
      isAnimating.current = false
    }
  })

  return <OrbitControls ref={controlsRef} enablePan={false} minDistance={1.0} maxDistance={6} />
}

type Props = {
  text: string
  ts: number
  language?: string
  /** Play a single sign id (dictionary mode) */
  signId?: string | null
  className?: string
  /** Replay / stop / TTS / current-word bar under the canvas */
  showControls?: boolean
}

export default function SignAvatarPlayer({
  text,
  ts,
  language: languageProp,
  signId = null,
  className,
  showControls = true,
}: Props) {
  const { avatar } = useAvatar()
  const { t, language: uiLang } = useLanguage()
  const language = languageProp ?? uiLang
  const [avatarLoaded, setAvatarLoaded] = useState(false)
  const [frames, setFrames] = useState<SignFrame[]>([])
  const [fps, setFps] = useState(25)
  const [isPlaying, setIsPlaying] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'done'>('idle')
  const [cameraView, setCameraView] = useState<CameraView>('close')
  const [activeSign, setActiveSign] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [idleFrame, setIdleFrame] = useState<SignFrame | null>(null)
  const [transitionFrame, setTransitionFrame] = useState<SignFrame | null>(null)
  const [words, setWords] = useState<string[]>([])
  const [currentSignIdx, setCurrentSignIdx] = useState(-1)
  const [allSigns, setAllSigns] = useState<string[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showWord, setShowWord] = useState(false)

  const preloadCache = useRef(new Map<string, { frames: SignFrame[]; fps: number }>())
  const queueRef = useRef<string[]>([])
  const signIdxRef = useRef(-1)
  const originalSignsRef = useRef<string[]>([])
  const originalWordsRef = useRef<string[]>([])

  // Pose de repos = frame 0 de « comprendre » (mains à l'avant), sans trim
  useEffect(() => {
    loadSign('comprendre', { trimHold: false })
      .then(({ frames: f }) => {
        if (f.length > 0 && f[0]?.pose) setIdleFrame(f[0])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setAvatarLoaded(false)
  }, [avatar.id])

  const handleAvatarLoad = useCallback(() => {
    setAvatarLoaded(true)
  }, [])

  const prefetchSign = useCallback((id: string) => {
    if (preloadCache.current.has(id)) {
      setTransitionFrame(preloadCache.current.get(id)!.frames[0] ?? null)
      return
    }
    loadSign(id)
      .then((data) => {
        preloadCache.current.set(id, data)
        setTransitionFrame(data.frames[0] ?? null)
      })
      .catch(() => {})
  }, [])

  const playSign = async (id: string, keepPlaying = false, idx = 0) => {
    setError(null)
    setStatus('loading')
    if (!keepPlaying) setIsPlaying(false)
    setActiveSign(id)
    signIdxRef.current = idx
    setCurrentSignIdx(idx)
    try {
      const cached = preloadCache.current.get(id)
      const data = cached ?? (await loadSign(id))
      if (!cached) preloadCache.current.set(id, data)
      setFrames([...data.frames])
      setFps(data.fps)
      setIsPlaying(true)
      setStatus('playing')
      if (queueRef.current.length > 0) prefetchSign(queueRef.current[0]!)
    } catch {
      setError(`${t.dashboard.avatarNoSign} « ${id} »`)
      setStatus('idle')
      setActiveSign(null)
      queueRef.current = []
    }
  }

  useEffect(() => {
    if (signId) {
      const label = getSignLabel(signId, language)
      originalSignsRef.current = [signId]
      originalWordsRef.current = [label]
      setAllSigns([signId])
      setWords([label])
      queueRef.current = []
      playSign(signId, false, 0)
      return
    }
    if (!ts) return
    const raw = text.trim()
    if (!raw) return
    setStatus('loading')
    fetch('/api/segment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: raw, language }),
    })
      .then((r) => r.json())
      .then(({ signs, words: wordLabels }) => {
        if (!signs?.length) {
          setError(`${t.dashboard.avatarNoSign} « ${raw} »`)
          setStatus('idle')
          return
        }
        setError(null)
        originalSignsRef.current = signs
        originalWordsRef.current = wordLabels ?? []
        setAllSigns(signs)
        setWords(wordLabels ?? [])
        queueRef.current = signs.slice(1)
        playSign(signs[0], false, 0)
      })
      .catch(() => {
        setError(t.dashboard.segmentError)
        setStatus('idle')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ts, signId, language])

  const handleDone = () => {
    if (queueRef.current.length > 0) {
      const nextIdx = signIdxRef.current + 1
      playSign(queueRef.current.shift()!, true, nextIdx)
    } else {
      setIsPlaying(false)
      setStatus('done')
    }
  }

  const handleReplay = () => {
    if (originalSignsRef.current.length === 0) return
    const signs = originalSignsRef.current
    queueRef.current = signs.slice(1)
    setWords(originalWordsRef.current)
    setAllSigns(signs)
    setError(null)
    playSign(signs[0]!, false, 0)
  }

  const handleStop = () => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPlaying(false)
    setStatus('idle')
    setAllSigns([])
    setFrames([])
    setCurrentSignIdx(-1)
    setWords([])
    setActiveSign(null)
    queueRef.current = []
    originalSignsRef.current = []
    originalWordsRef.current = []
  }

  const handleSpeak = () => {
    const phrase = text.trim() || words.join(' ')
    if (!phrase || typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    if (isSpeaking) {
      setIsSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(phrase)
    const langMap: Record<string, string> = { fr: 'fr-FR', en: 'en-GB', tr: 'tr-TR', pl: 'pl-PL' }
    utterance.lang = langMap[language] ?? 'fr-FR'
    utterance.rate = 0.95
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const canPlay = allSigns.length > 0 || originalSignsRef.current.length > 0
  const speakEnabled = Boolean(text.trim() || words.length)
  const AvatarComp = avatar.pipeline === 'male' ? SignLanguageAvatar : FemaleSignLanguageAvatar

  return (
    <div className={`flex flex-col gap-3 h-full font-sans ${className ?? ''}`}>
      <div className="avatar-canvas relative">
        {!avatarLoaded && <AvatarLoadingOverlay label={t.dashboard.avatarLoadingFull} />}
        <Canvas camera={{ position: [0, 0.7, 2.2], fov: 45 }} shadows>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
            <Environment files="/potsdamer_platz_1k.hdr" />
            <AvatarComp
              key={avatar.id}
              modelUrl={avatar.url ?? '/avatar.glb'}
              prepareOptions={avatar.prepare}
              frames={frames}
              isPlaying={isPlaying}
              fps={fps}
              onDone={handleDone}
              onLoad={handleAvatarLoad}
              idleFrame={idleFrame}
              transitionFrame={transitionFrame}
              activeSign={activeSign}
            />
            <CameraController view={cameraView} />
          </Suspense>
        </Canvas>

        <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1.5">
          {(
            [
              { id: 'close' as CameraView, label: t.dashboard.camClose },
              { id: 'general' as CameraView, label: t.dashboard.camGeneral },
            ]
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setCameraView(id)}
              className="cam-view-btn"
              style={
                cameraView === id
                  ? { background: '#5ba4b0', color: '#ffffff' }
                  : { background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.8)' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className={`absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-semibold font-sans ${
            status === 'loading'
              ? 'bg-amber-500 text-white'
              : status === 'done'
                ? 'bg-emerald-500 text-white'
                : status === 'idle'
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-transparent'
          }`}
        >
          {status === 'idle' && t.dashboard.avatarReady}
          {status === 'loading' && t.dashboard.avatarLoading}
          {status === 'done' && t.dashboard.avatarDone}
        </div>
      </div>

      {showControls && (
        <div className="flex items-center gap-2 px-1 font-sans">
          <button
            type="button"
            onClick={handleReplay}
            disabled={!canPlay || status === 'loading'}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 shadow cursor-pointer shrink-0"
            style={{ background: 'rgba(91,164,176,0.15)', color: '#5ba4b0' }}
            title={t.dashboard.replay}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleStop}
            disabled={status === 'idle'}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 shadow cursor-pointer shrink-0"
            style={{
              background: status !== 'idle' ? 'rgba(239,68,68,0.15)' : 'rgba(91,164,176,0.1)',
              color: status !== 'idle' ? '#ef4444' : '#5ba4b0',
            }}
            title={t.dashboard.stopReset}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleSpeak}
            disabled={!speakEnabled}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 shadow cursor-pointer shrink-0"
            style={{
              background: isSpeaking ? '#5ba4b0' : 'rgba(91,164,176,0.15)',
              color: isSpeaking ? 'white' : '#5ba4b0',
            }}
            title={isSpeaking ? t.dashboard.stopSpeak : t.dashboard.speakPhrase}
          >
            {isSpeaking ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowWord((v) => !v)}
            disabled={!canPlay}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 shadow cursor-pointer shrink-0"
            style={{
              background: showWord ? '#5ba4b0' : 'rgba(91,164,176,0.15)',
              color: showWord ? 'white' : '#5ba4b0',
            }}
            title={t.dashboard.showCurrentWord}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-6 4h10" />
            </svg>
          </button>

          {showWord && currentSignIdx >= 0 && words[currentSignIdx] && (
            <span
              className="ml-auto px-4 py-2 rounded-xl font-semibold text-sm capitalize transition-all font-sans"
              style={{
                background: 'rgba(91,164,176,0.12)',
                color: '#5ba4b0',
                border: '1px solid rgba(91,164,176,0.25)',
              }}
            >
              {words[currentSignIdx]}
            </span>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2 font-sans">
          {error}
        </p>
      )}
    </div>
  )
}

'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import SignLanguageAvatar, { type SignFrame } from '@/components/avatar/SignLanguageAvatar'
import FemaleSignLanguageAvatar from '@/components/avatar/FemaleSignLanguageAvatar'
import { trimLeadingHold, trimTrailingRest } from '@/components/avatar/trimSignMotion'
import { useAvatar } from '@/contexts/AvatarContext'
import { useLanguage } from '@/contexts/LanguageContext'

const SIGNS_CDN = (process.env.NEXT_PUBLIC_SIGNS_CDN ?? '').replace(/\/$/, '')

async function loadSign(id: string): Promise<{ frames: SignFrame[]; fps: number }> {
  const baseId = id.replace(/_\d+$/, '')
  const candidates = SIGNS_CDN
    ? [
        `${SIGNS_CDN}/signs/${id}.json`,
        `/signs/${id}.json`,
        ...(baseId !== id ? [`${SIGNS_CDN}/signs/${baseId}.json`, `/signs/${baseId}.json`] : []),
      ]
    : [`/signs/${id}.json`, ...(baseId !== id ? [`/signs/${baseId}.json`] : [])]

  let lastErr: unknown
  for (const url of candidates) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const data = await res.json()
      const fps = Array.isArray(data) ? 25 : (data.fps ?? 25)
      const raw: SignFrame[] = Array.isArray(data) ? data : data.frames
      return { frames: trimTrailingRest(trimLeadingHold(raw, fps), fps), fps }
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr ?? new Error(`Signe ${id} introuvable`)
}

type Props = {
  text: string
  ts: number
  language?: string
  /** Play a single sign id (dictionary mode) */
  signId?: string | null
  className?: string
}

export default function SignAvatarPlayer({ text, ts, language = 'fr', signId = null, className }: Props) {
  const { avatar } = useAvatar()
  const { t } = useLanguage()
  const [frames, setFrames] = useState<SignFrame[]>([])
  const [fps, setFps] = useState(25)
  const [isPlaying, setIsPlaying] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'done'>('idle')
  const [activeSign, setActiveSign] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [idleFrame, setIdleFrame] = useState<SignFrame | null>(null)
  const [transitionFrame, setTransitionFrame] = useState<SignFrame | null>(null)
  const [words, setWords] = useState<string[]>([])
  const [currentSignIdx, setCurrentSignIdx] = useState(-1)

  const preloadCache = useRef(new Map<string, { frames: SignFrame[]; fps: number }>())
  const queueRef = useRef<string[]>([])
  const signIdxRef = useRef(-1)

  useEffect(() => {
    loadSign('comprendre')
      .then(({ frames: f }) => {
        if (f.length > 0) setIdleFrame(f[0]!)
      })
      .catch(() => {})
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
      setError(`Signe « ${id} » introuvable`)
      setStatus('idle')
      setActiveSign(null)
      queueRef.current = []
    }
  }

  useEffect(() => {
    if (signId) {
      queueRef.current = []
      setWords([signId.replace(/_/g, ' ')])
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
        setWords(wordLabels ?? [])
        queueRef.current = signs.slice(1)
        playSign(signs[0], false, 0)
      })
      .catch(() => {
        setError('Erreur de segmentation')
        setStatus('idle')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ts, signId])

  const handleDone = () => {
    if (queueRef.current.length > 0) {
      const nextIdx = signIdxRef.current + 1
      playSign(queueRef.current.shift()!, true, nextIdx)
    } else {
      setIsPlaying(false)
      setStatus('done')
    }
  }

  const AvatarComp = avatar.pipeline === 'male' ? SignLanguageAvatar : FemaleSignLanguageAvatar

  return (
    <div className={`avatar-stage ${className ?? ''}`}>
      <div className="avatar-canvas">
        <Canvas camera={{ position: [0, 0.55, 2.6], fov: 48 }} shadows>
          <Suspense fallback={null}>
            <ambientLight intensity={0.55} />
            <directionalLight position={[4, 6, 4]} intensity={1.05} castShadow />
            <Environment preset="city" />
            <AvatarComp
              key={avatar.id}
              modelUrl={avatar.url ?? '/avatar.glb'}
              prepareOptions={avatar.prepare}
              frames={frames}
              isPlaying={isPlaying}
              fps={fps}
              onDone={handleDone}
              idleFrame={idleFrame}
              transitionFrame={transitionFrame}
              activeSign={activeSign}
            />
            <OrbitControls enablePan={false} minDistance={1.4} maxDistance={5.5} target={[0, 0.15, 0]} />
          </Suspense>
        </Canvas>
        <div className="avatar-overlay">
          <span className="avatar-name">{avatar.label}</span>
          {status === 'playing' && words[currentSignIdx] && (
            <span className="avatar-word">{words[currentSignIdx]}</span>
          )}
          {status === 'loading' && <span className="avatar-word">…</span>}
          {error && <span className="avatar-error">{error}</span>}
        </div>
      </div>
    </div>
  )
}

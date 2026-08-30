import { useRef, useEffect, useCallback, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { prepareMixamoScene, openArmsOutward, type PrepareMixamoOptions } from './prepareMixamoAvatar'
import { clearArmFromTorso } from './armTorsoClearance'
import { lerpSignFrame } from './trimSignMotion'

interface Landmark {
  x: number
  y: number
  z: number
}

interface ArmSegments {
  shoulder: Landmark
  upper_arm: Landmark  // vector from shoulder to elbow
  forearm: Landmark    // vector from elbow to wrist
}

export interface SignFrame {
  pose: Landmark[]
  left_hand?: Landmark[]
  right_hand?: Landmark[]
  // New arm segment structure (more faithful to gestures)
  left_arm?: ArmSegments
  right_arm?: ArmSegments
  // legacy support
  hands?: Landmark[]
}

// MediaPipe pose landmark indices
const MP = {
  NOSE: 0,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
}

// MANO hand landmark to Mixamo finger bone mapping
// MANO: 0=wrist, 1-4=Thumb(CMC,MCP,IP,TIP), 5-8=Index, 9-12=Middle, 13-16=Ring, 17-20=Pinky
const FINGER_CHAINS: Array<{ name: string; start: number }> = [
  { name: 'Thumb',  start: 1 },
  { name: 'Index',  start: 5 },
  { name: 'Middle', start: 9 },
  { name: 'Ring',   start: 13 },
  { name: 'Pinky',  start: 17 },
]
const FINGER_SEGMENTS = ['1', '2', '3'] // 4 joints → 3 bones
const INTRO_FRAMES = 6   // frames to blend in from idle pose
const OUTRO_FRAMES = 8   // frames to blend out toward next sign
/** Durée du retour doux vers l'idle (mains croisées) après le dernier signe. */
const RETURN_TO_IDLE_SEC = 0.7
// ELBOW_OUTWARD_BIAS removed — elbow direction is now derived from arm geometry
// Target depth of the nose landmark in shoulder-width units.
// Used to auto-calibrate z per frame — MediaPipe world z can be 1x or 3x depending on
// which extraction script was used.
const TARGET_NOSE_Z = 0.85

// Position adjustments for elbows and wrists (X, Y, Z offsets)
const ELBOW_OFFSET = { x: 0, y: 0, z: 0 }
const WRIST_OFFSET = { x: 0, y: 0, z: 0 }

// Corrections ponctuelles (la plupart des cas sont gérés par clearArmFromTorso).
const SIGN_CORRECTIONS: Record<string, (bones: Record<string, THREE.Bone>) => void> = {}

function lm(pt: Landmark): THREE.Vector3 {
  return new THREE.Vector3(pt.x, pt.y, pt.z)
}



/**
 * Rotate bone so its local +Y points toward targetWorldDir,
 * preserving the natural twist from the rest pose.
 */
function pointBoneAt(
  bone: THREE.Bone,
  restQuat: THREE.Quaternion,
  parentWorldQuat: THREE.Quaternion,
  targetWorldDir: THREE.Vector3,
) {
  const localDir = targetWorldDir.clone()
    .applyQuaternion(parentWorldQuat.clone().invert())
    .normalize()

  const restDir = new THREE.Vector3(0, 1, 0).applyQuaternion(restQuat)
  const delta = new THREE.Quaternion().setFromUnitVectors(restDir, localDir)
  bone.quaternion.multiplyQuaternions(delta, restQuat)
}

interface AvatarProps {
  frames: SignFrame[]
  isPlaying: boolean
  fps?: number
  onDone?: () => void
  idleFrame?: SignFrame | null
  transitionFrame?: SignFrame | null
  activeSign?: string | null
  /** GLB à charger (défaut Mixamo ♂). RPM / Black passent ici aussi. */
  modelUrl?: string
  /**
   * Bake + copie bras depuis Mixamo ♂.
   * Omit / undefined pour Mixamo ♂ (aucune retouche).
   */
  prepareOptions?: PrepareMixamoOptions | null
}

export default function SignLanguageAvatar({
  frames,
  isPlaying,
  fps = 25,
  onDone,
  idleFrame,
  transitionFrame,
  activeSign,
  modelUrl = '/avatar.glb',
  prepareOptions = null,
}: AvatarProps) {
  const { scene: gltfScene } = useGLTF(modelUrl)
  const { scene: maleArmSource } = useGLTF('/avatar.glb')
  const needsPrepare = prepareOptions != null
  const scene = useMemo(() => {
    // Toujours cloner : ne jamais monter le cache useGLTF directement
    // (sinon dispose/mutations au changement d’avatar → Mixamo ♂ écran vide).
    if (!needsPrepare) return SkeletonUtils.clone(gltfScene)
    try {
      return prepareMixamoScene(gltfScene, 1.7, {
        bakeScale: prepareOptions?.bakeScale ?? true,
        naturalArms: prepareOptions?.naturalArms ?? true,
        armsOnly: prepareOptions?.armsOnly ?? false,
        naturalLegs: prepareOptions?.naturalLegs ?? false,
        shoulderDrop: prepareOptions?.shoulderDrop ?? 0,
        armOpen: prepareOptions?.armOpen ?? 0,
        armRestFrom: prepareOptions?.naturalArms !== false ? maleArmSource : undefined,
      })
    } catch (err) {
      console.error('[avatar] prepare failed', modelUrl, err)
      return SkeletonUtils.clone(gltfScene)
    }
  }, [gltfScene, modelUrl, needsPrepare, prepareOptions, maleArmSource])

  const bones = useRef<Record<string, THREE.Bone>>({})
  const restQuats = useRef<Record<string, THREE.Quaternion>>({})
  const frameIdx = useRef(0)
  const elapsed = useRef(0)
  const startPoseQuats = useRef<Record<string, THREE.Quaternion>>({})
  const frameAQuats = useRef<Record<string, THREE.Quaternion>>({})
  const frameBQuats = useRef<Record<string, THREE.Quaternion>>({})
  const idleQuats = useRef<Record<string, THREE.Quaternion>>({})
  const naturalIdleQuats = useRef<Record<string, THREE.Quaternion>>({})
  const transitionQuats = useRef<Record<string, THREE.Quaternion>>({})
  const returnFromQuats = useRef<Record<string, THREE.Quaternion>>({})
  const returnFromFrame = useRef<SignFrame | null>(null)
  const returningToIdle = useRef(false)
  const returnElapsed = useRef(0)
  const introFromIdle = useRef(true)
  const lastCapturedIdx = useRef(-1)
  const doneFired = useRef(false)
  const frozenSidesPerFrame = useRef<Set<'Left' | 'Right'>[]>([])
  const frozenSidesForSign  = useRef<Set<'Left' | 'Right'>>(new Set())

  // Face expression state
  const faceTime   = useRef(0)
  const nextBlink  = useRef(2 + Math.random() * 3)
  const blinkTimer = useRef(0)
  const nextSmile  = useRef(4 + Math.random() * 5)
  const smileTimer = useRef(0)

  // Head pose : système cible + ressort amorti
  // Principe : la cible change toutes les 0.8–3 s, la tête suit avec inertie (tau ≈ 0.45 s)
  // → pattern "tenir – bouger – tenir" caractéristique d'un humain (vs sinusoïde continue)
  const headTarget  = useRef({ yaw: 0, pitch: 0, roll: 0 })
  const headCurrent = useRef({ yaw: 0, pitch: 0, roll: 0 })
  const headTimer   = useRef(1.0)

  // Regard : cible + ressort, légèrement plus rapide que la tête
  const gazeTarget  = useRef({ yaw: 0, pitch: 0 })
  const gazeCurrent = useRef({ yaw: 0, pitch: 0 })
  const gazeTimer   = useRef(1.0)

  const faceMeshes = useRef<THREE.SkinnedMesh[]>([])
  const morphDict  = useRef<Record<string, number>>({})

  useEffect(() => {
    bones.current = {}
    restQuats.current = {}
    naturalIdleQuats.current = {}
    idleQuats.current = {}
    faceMeshes.current = []
    morphDict.current = {}

    const FACE_BONES = new Set(['Head', 'Neck', 'LeftEye', 'RightEye'])
    scene.traverse((node) => {
      if (node instanceof THREE.Bone) {
        bones.current[node.name] = node
        restQuats.current[node.name] = node.quaternion.clone()
        if (FACE_BONES.has(node.name)) node.matrixAutoUpdate = false
      }
      if ((node as THREE.SkinnedMesh).isSkinnedMesh) {
        const mesh = node as THREE.SkinnedMesh
        mesh.frustumCulled = false
        faceMeshes.current.push(mesh)
        if (mesh.morphTargetDictionary && Object.keys(mesh.morphTargetDictionary).length > 0) {
          morphDict.current = { ...morphDict.current, ...mesh.morphTargetDictionary }
        }
      }
    })
  }, [scene])


  // Pré-calcule les quats du frame 0 du signe suivant pour l'outro blend
  useEffect(() => {
    if (!transitionFrame || Object.keys(bones.current).length === 0) {
      transitionQuats.current = {}
      return
    }
    applyFrame(transitionFrame, bones.current, restQuats.current)
    transitionQuats.current = {}
    for (const [name, bone] of Object.entries(bones.current)) {
      transitionQuats.current[name] = bone.quaternion.clone()
    }
  }, [transitionFrame])

  useEffect(() => {
    frozenSidesPerFrame.current = computeFrozenSides(frames)
    const all = new Set<'Left' | 'Right'>()
    for (const s of frozenSidesPerFrame.current) for (const side of s) all.add(side)
    frozenSidesForSign.current = all
  }, [frames])

  useEffect(() => {
    if (isPlaying) {
      frameIdx.current = 0
      elapsed.current = 0
      lastCapturedIdx.current = -1
      doneFired.current = false
      returningToIdle.current = false
      returnElapsed.current = 0
      returnFromQuats.current = {}
      returnFromFrame.current = null
      // Intro depuis idle (pas depuis un autre signe) → lerp landmarks, pas slerp quat
      introFromIdle.current = Object.keys(transitionQuats.current).length === 0
      // NE PAS vider transitionQuats ici — il doit rester actif jusqu'au
      // premier frame du nouveau signe pour éviter le flash idle entre mots.
      // Il sera vidé dans useFrame dès que le frame 0 commence à être rendu.

      // Capture la pose courante comme point de départ du blend intro
      // Si transitionQuats est actif, la pose courante EST déjà la bonne transition
      startPoseQuats.current = {}
      for (const [name, bone] of Object.entries(bones.current)) {
        startPoseQuats.current[name] = bone.quaternion.clone()
      }
    }
  }, [isPlaying, frames])

  const applyIdlePose = useCallback(() => {
    // 0. En transition vers le signe suivant → tenir la pose cible (évite le flash idle)
    if (Object.keys(transitionQuats.current).length > 0) {
      for (const [name, bone] of Object.entries(bones.current)) {
        const q = transitionQuats.current[name]
        if (q) { bone.quaternion.copy(q); bone.updateWorldMatrix(true, false) }
      }
      return
    }

    // 1. Pose naturelle déjà capturée → utiliser directement
    if (Object.keys(naturalIdleQuats.current).length > 0) {
      for (const [name, bone] of Object.entries(bones.current)) {
        const q = naturalIdleQuats.current[name]
        if (q) { bone.quaternion.copy(q); bone.updateWorldMatrix(true, false) }
      }
      if (Object.keys(idleQuats.current).length === 0) {
        for (const [name, bone] of Object.entries(bones.current)) {
          idleQuats.current[name] = bone.quaternion.clone()
        }
      }
      return
    }

    // 2. Même idle que Mixamo ♂ : frame « comprendre » + légère ouverture.
    // RPM (armsOnly) : ouverture monde Z plus marquée — sinon les mains se touchent.
    if (idleFrame && Object.keys(bones.current).length > 0) {
      applyFrame(idleFrame, bones.current, restQuats.current)
      if (prepareOptions?.armsOnly) {
        openArmsOutward(scene, prepareOptions.armOpen ?? 0.06)
      } else {
        for (const side of ['Left', 'Right'] as const) {
          const arm = bones.current[`${side}Arm`]
          if (!arm) continue
          const dir = side === 'Left' ? 1 : -1
          const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, dir), 0.13)
          arm.quaternion.premultiply(q)
          arm.updateWorldMatrix(true, false)
        }
      }
      for (const [name, bone] of Object.entries(bones.current)) {
        naturalIdleQuats.current[name] = bone.quaternion.clone()
        idleQuats.current[name] = bone.quaternion.clone()
      }
      return
    }

    // 3. Fallback : bras droits vers le bas
    for (const [name, bone] of Object.entries(bones.current)) {
      bone.quaternion.copy(restQuats.current[name])
      bone.updateWorldMatrix(true, false)
    }
    const camFwd = new THREE.Vector3(0, 0, 1)
    const down = new THREE.Vector3(0, -1, 0)
    for (const side of ['Left', 'Right'] as const) {
      const shoulderBone = bones.current[`${side}Shoulder`]
      const upperArmBone = bones.current[`${side}Arm`]
      const foreArmBone  = bones.current[`${side}ForeArm`]
      if (!shoulderBone || !upperArmBone || !foreArmBone) continue
      const parentQ = new THREE.Quaternion()
      shoulderBone.getWorldQuaternion(parentQ)
      orientArmBone(upperArmBone, parentQ, down, camFwd)
      upperArmBone.updateWorldMatrix(true, false)
      const upperArmQ = new THREE.Quaternion()
      upperArmBone.getWorldQuaternion(upperArmQ)
      orientArmBone(foreArmBone, upperArmQ, down, camFwd)
      foreArmBone.updateWorldMatrix(true, false)
    }
    if (Object.keys(idleQuats.current).length === 0) {
      for (const [name, bone] of Object.entries(bones.current)) {
        idleQuats.current[name] = bone.quaternion.clone()
      }
    }
  }, [idleFrame, prepareOptions, scene])

  useFrame((_, delta) => {
    // ── Timers ────────────────────────────────────────────────────────────────
    faceTime.current += delta
    const t = faceTime.current

    // Clignement : asymétrique (ferme vite, ouvre lentement), intervalle 3–6 s
    nextBlink.current -= delta
    let blinkPhase = 0
    if (nextBlink.current <= 0) {
      blinkTimer.current = 0.16
      nextBlink.current = 3 + Math.random() * 3
    }
    if (blinkTimer.current > 0) {
      blinkTimer.current -= delta
      const p = 1 - blinkTimer.current / 0.16
      if      (p < 0.4) blinkPhase = p / 0.4
      else if (p < 0.5) blinkPhase = 1
      else              blinkPhase = 1 - (p - 0.5) / 0.5
    }

    // ── Head pose : cible aléatoire + ressort amorti ──────────────────────────
    // (Math.random() + Math.random() - 1) ≈ distribution triangulaire centrée sur 0
    // → les grandes rotations sont rares, la tête reste près du centre (naturel)
    headTimer.current -= delta
    if (headTimer.current <= 0) {
      const r = () => (Math.random() + Math.random() - 1)
      headTarget.current.yaw   = r() * 0.13   // ±0.13 rad ≈ ±7.5°
      headTarget.current.pitch = r() * 0.08   // ±0.08 rad ≈ ±4.6°
      headTarget.current.roll  = r() * 0.10   // ±0.10 rad ≈ ±5.7°
      headTimer.current = 0.8 + Math.random() * 2.2  // changement toutes les 0.8–3 s
    }
    // Ressort : tau ≈ 0.45 s — ni trop lent (paresseux) ni trop rapide (saccadé)
    const hAlpha = 1 - Math.exp(-delta * 2.2)
    headCurrent.current.yaw   += (headTarget.current.yaw   - headCurrent.current.yaw)   * hAlpha
    headCurrent.current.pitch += (headTarget.current.pitch - headCurrent.current.pitch) * hAlpha
    headCurrent.current.roll  += (headTarget.current.roll  - headCurrent.current.roll)  * hAlpha

    // Regard fixe droit devant
    gazeCurrent.current.yaw   = 0
    gazeCurrent.current.pitch = 0

    // ── Sourire ────────────────────────────────────────────────────────────────
    // Idle : oscillation très lente (quasi imperceptible, 0.13 rad/s ≈ 48 s/cycle)
    const idleSmilePhase = Math.max(0, Math.sin(t * 0.13 + 0.5)) * 0.14

    let smilePhase = 0
    let mouthPhase = 0
    if (isPlaying && frames.length > 0) {
      nextSmile.current -= delta
      if (nextSmile.current <= 0) {
        smileTimer.current = 3.0
        nextSmile.current = 5 + Math.random() * 5
      }
      if (smileTimer.current > 0) {
        smileTimer.current -= delta
        const p = 1 - smileTimer.current / 3.0
        const bell = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
        smilePhase = Math.sin(bell * Math.PI) * 0.50
      }

      // Labialisation : 3 sinus + rectification + tanh → signal organique avec pauses
      const raw = Math.sin(t * 6.7) * 0.45 + Math.sin(t * 11.3) * 0.25 + Math.sin(t * 3.1) * 0.30
      mouthPhase = Math.tanh(Math.max(0, raw) * 2.2) * 0.65
    }

    if (!isPlaying || frames.length === 0) {
      applyIdlePose()
      applyFaceExpression(
        bones.current, restQuats.current, t,
        blinkPhase, idleSmilePhase, 0,
        faceMeshes.current, morphDict.current,
        headCurrent.current, gazeCurrent.current,
      )
      return
    }

    elapsed.current += delta
    const frameDuration = 1 / fps

    // Advance frame index when a full frame period has elapsed
    if (elapsed.current >= frameDuration) {
      elapsed.current -= frameDuration
      frameIdx.current++
    }

    if (frameIdx.current >= frames.length) {
      const hasNextSign = Object.keys(transitionQuats.current).length > 0

      // Enchaînement : passer tout de suite au signe suivant (pas de retour idle)
      if (hasNextSign) {
        applyIdlePose()
        if (!doneFired.current) {
          doneFired.current = true
          onDone?.()
        }
        return
      }

      // Fin de phrase / signe isolé : retour doux vers mains croisées
      if (!returningToIdle.current) {
        returningToIdle.current = true
        returnElapsed.current = 0
        returnFromFrame.current = null
        returnFromQuats.current = {}
        // Partir de la pose réellement affichée (pas du JSON) → pas de micro-saut
        for (const [name, bone] of Object.entries(bones.current)) {
          returnFromQuats.current[name] = bone.quaternion.clone()
        }
        if (Object.keys(idleQuats.current).length === 0) {
          applyIdlePose()
          for (const [name, bone] of Object.entries(bones.current)) {
            const from = returnFromQuats.current[name]
            if (from) bone.quaternion.copy(from)
          }
        }
      }

      returnElapsed.current += delta
      const raw = Math.min(1, returnElapsed.current / RETURN_TO_IDLE_SEC)
      // ease-in-out cubic : départ et arrivée doux
      const blend = raw < 0.5
        ? 4 * raw * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 3) / 2

      const idleTarget =
        Object.keys(naturalIdleQuats.current).length > 0
          ? naturalIdleQuats.current
          : idleQuats.current

      for (const [name, bone] of Object.entries(bones.current)) {
        const from = returnFromQuats.current[name]
        const to = idleTarget[name]
        if (!from || !to) continue
        bone.quaternion.copy(from).slerp(to, blend)
        bone.updateWorldMatrix(true, false)
      }

      applyFaceExpression(
        bones.current, restQuats.current, faceTime.current,
        blinkPhase, idleSmilePhase, 0,
        faceMeshes.current, morphDict.current,
        headCurrent.current, gazeCurrent.current,
      )

      if (raw >= 1 && !doneFired.current) {
        doneFired.current = true
        returningToIdle.current = false
        applyIdlePose()
        onDone?.()
      }
      return
    }

    const currentIdx = frameIdx.current
    const nextIdx = Math.min(currentIdx + 1, frames.length - 1)

    // Dès que le premier frame du nouveau signe est traité, vider transitionQuats
    // (la transition est terminée, l'intro blend prend le relais)
    if (currentIdx === 0 && lastCapturedIdx.current === -1 && Object.keys(transitionQuats.current).length > 0) {
      transitionQuats.current = {}
    }

    // Cache bone quats for frame A and B when frame changes
    if (currentIdx !== lastCapturedIdx.current) {
      lastCapturedIdx.current = currentIdx

      const frozenA = frozenSidesPerFrame.current[currentIdx] ?? new Set<'Left' | 'Right'>()
      const frozenB = frozenSidesPerFrame.current[nextIdx]    ?? new Set<'Left' | 'Right'>()

      applyFrame(frames[currentIdx], bones.current, restQuats.current)
      for (const [name, bone] of Object.entries(bones.current)) {
        if (!frameAQuats.current[name]) frameAQuats.current[name] = new THREE.Quaternion()
        frameAQuats.current[name].copy(bone.quaternion)
      }
      for (const side of frozenA) {
        for (const [name, q] of Object.entries(frameAQuats.current)) {
          if (name.startsWith(side)) { const idle = idleQuats.current[name]; if (idle) q.copy(idle) }
        }
      }

      applyFrame(frames[nextIdx], bones.current, restQuats.current)
      for (const [name, bone] of Object.entries(bones.current)) {
        if (!frameBQuats.current[name]) frameBQuats.current[name] = new THREE.Quaternion()
        frameBQuats.current[name].copy(bone.quaternion)
      }
      for (const side of frozenB) {
        for (const [name, q] of Object.entries(frameBQuats.current)) {
          if (name.startsWith(side)) { const idle = idleQuats.current[name]; if (idle) q.copy(idle) }
        }
      }
    }

    // Interpolate between frame A and B at display framerate (smooth 60fps+)
    const lerpT = Math.min(elapsed.current / frameDuration, 1)

    // Intro depuis idle : lerp landmarks (chemin droit dans l'espace)
    // plutôt que slerp de quaternions (arc latéral inventé, ex. mains vers la gauche).
    const inIntroFromIdle =
      introFromIdle.current &&
      !!idleFrame &&
      currentIdx < INTRO_FRAMES

    if (inIntroFromIdle) {
      const raw = (currentIdx + lerpT) / INTRO_FRAMES
      const blend = raw * raw * (3 - 2 * raw)
      const signFrame = lerpSignFrame(frames[currentIdx], frames[nextIdx], lerpT)
      const mixed = lerpSignFrame(idleFrame!, signFrame, blend)
      applyFrame(mixed, bones.current, restQuats.current)
      for (const side of frozenSidesForSign.current) {
        for (const [name, bone] of Object.entries(bones.current)) {
          if (!name.startsWith(side)) continue
          const idle = idleQuats.current[name]
          if (idle) bone.quaternion.copy(idle)
        }
      }
    } else {
      for (const [name, bone] of Object.entries(bones.current)) {
        const a = frameAQuats.current[name]
        const b = frameBQuats.current[name]
        if (!a || !b) continue
        bone.quaternion.copy(a).slerp(b, lerpT)
      }

      // Intro signe→signe : slerp depuis la pose de fin du signe précédent
      if (currentIdx < INTRO_FRAMES) {
        const raw = (currentIdx + lerpT) / INTRO_FRAMES
        const blend = raw * raw * (3 - 2 * raw) // smoothstep
        for (const [name, bone] of Object.entries(bones.current)) {
          const side = name.startsWith('Left') ? 'Left' : name.startsWith('Right') ? 'Right' : null
          if (side && frozenSidesForSign.current.has(side)) continue
          const from = startPoseQuats.current[name]
          if (!from) continue
          const target = bone.quaternion.clone()
          bone.quaternion.copy(from).slerp(target, blend)
        }
      }
    }

    // Smooth outro: blend ONLY toward the next sign (transition).
    // Ne pas blender vers idle — ça invente un mouvement de "retour au repos"
    // (mains qui partent sur le côté) absent des vidéos source.
    const outroStart = frames.length - OUTRO_FRAMES
    const hasNextSign = Object.keys(transitionQuats.current).length > 0
    if (hasNextSign && currentIdx >= outroStart) {
      const raw = (currentIdx - outroStart + lerpT) / OUTRO_FRAMES
      const blend = raw * raw * (3 - 2 * raw) // smoothstep
      for (const [name, bone] of Object.entries(bones.current)) {
        const side = name.startsWith('Left') ? 'Left' : name.startsWith('Right') ? 'Right' : null
        if (side && frozenSidesForSign.current.has(side)) continue
        const to = transitionQuats.current[name]
        if (!to) continue
        bone.quaternion.slerp(to, blend)
      }
    }

    // Corrections spécifiques au signe courant (ex: bras trop proche du corps)
    if (activeSign) SIGN_CORRECTIONS[activeSign]?.(bones.current)

    // Apply face expressions on top of all bone blending
    applyFaceExpression(
      bones.current, restQuats.current, faceTime.current,
      blinkPhase, smilePhase + idleSmilePhase, mouthPhase,
      faceMeshes.current, morphDict.current,
      headCurrent.current, gazeCurrent.current,
    )
  })

  // dispose={null} : les géométries sont partagées avec le cache GLTF — ne pas les détruire au démontage
  return <primitive object={scene} position={[0, -1, 0]} dispose={null} />
}

useGLTF.preload('/avatar.glb')

// ─── Face expression ──────────────────────────────────────────────────────────

function setMorph(
  meshes: THREE.SkinnedMesh[],
  dict: Record<string, number>,
  keys: string[],
  value: number,
) {
  for (const key of keys) {
    const idx = dict[key]
    if (idx === undefined) continue
    for (const mesh of meshes) {
      if (mesh.morphTargetInfluences && mesh.morphTargetDictionary?.[key] !== undefined) {
        mesh.morphTargetInfluences[mesh.morphTargetDictionary[key]] = Math.max(0, Math.min(1, value))
      }
    }
    return
  }
}

function applyFaceExpression(
  bones: Record<string, THREE.Bone>,
  restQuats: Record<string, THREE.Quaternion>,
  t: number,
  blinkPhase: number,
  smilePhase: number,
  mouthPhase: number,
  meshes: THREE.SkinnedMesh[],
  morphDict: Record<string, number>,
  headPose: { yaw: number; pitch: number; roll: number },
  gazePose: { yaw: number; pitch: number },
) {
  // Modèle : 2 morph targets (mouthOpen, mouthSmile) + bones Head/Neck/Spine/LeftEye/RightEye
  const isActive = mouthPhase > 0.01 || smilePhase > 0.01
  const headKey  = ['Head', 'head'].find(k => bones[k])
  const neckKey  = ['Neck', 'neck'].find(k => bones[k])

  // ── Tête ──────────────────────────────────────────────────────────────────
  // headPose = position actuelle lissée par ressort (calculée dans useFrame)
  // On ajoute :
  //   • corrélation parole (légère inclinaison vers le bas pendant la labialisation)
  //   • micro-tremor physiologique (~0.002 rad, 20–30 Hz) → vivant même à l'arrêt
  if (headKey) {
    const bone = bones[headKey]
    const rest = restQuats[headKey]
    if (rest) {
      const tremorS = 0.0022
      const tremorYaw   = (Math.sin(t * 23.7) * 0.4 + Math.sin(t * 31.3) * 0.6) * tremorS
      const tremorPitch = (Math.sin(t * 19.1) * 0.5 + Math.sin(t * 28.9) * 0.5) * tremorS

      const yaw   = headPose.yaw   + tremorYaw
      const pitch = headPose.pitch + tremorPitch + mouthPhase * 0.032
      const roll  = headPose.roll

      bone.quaternion
        .copy(rest)
        .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll, 'YXZ')))
      bone.matrix.compose(bone.position, bone.quaternion, bone.scale)
      bone.matrixWorldNeedsUpdate = true
      bone.updateWorldMatrix(false, true)
    }
  }

  // ── Cou : suit la tête à 40% (amortissement naturel de la colonne) ────────
  if (neckKey) {
    const bone = bones[neckKey]
    const rest = restQuats[neckKey]
    if (rest) {
      bone.quaternion
        .copy(rest)
        .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(
          headPose.pitch * 0.40 + mouthPhase * 0.014,
          headPose.yaw   * 0.40,
          headPose.roll  * 0.40,
        )))
      bone.matrix.compose(bone.position, bone.quaternion, bone.scale)
      bone.matrixWorldNeedsUpdate = true
      bone.updateWorldMatrix(false, true)
    }
  }

  // ── Torse : suit la tête à 15% (présence corporelle subtile) ─────────────
  const spineKey = ['Spine', 'Spine1', 'spine'].find(k => bones[k])
  if (spineKey && isActive) {
    const bone = bones[spineKey]
    const rest = restQuats[spineKey]
    if (rest) {
      bone.quaternion
        .copy(rest)
        .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(
          mouthPhase * 0.009,
          headPose.yaw  * 0.12,
          headPose.roll * 0.10,
        )))
      bone.matrix.compose(bone.position, bone.quaternion, bone.scale)
      bone.matrixWorldNeedsUpdate = true
      bone.updateWorldMatrix(false, true)
    }
  }

  // ── Yeux : clignement + regard (saccades douces) ──────────────────────────
  // gazePose = position actuelle lissée par ressort (calculée dans useFrame)
  for (const side of ['Left', 'Right'] as const) {
    const bone = bones[`${side}Eye`]
    const rest = restQuats[`${side}Eye`]
    if (!bone || !rest) continue

    const blinkAngle = Math.pow(blinkPhase, 0.7) * 0.28
    bone.quaternion
      .copy(rest)
      .multiply(new THREE.Quaternion().setFromEuler(
        new THREE.Euler(blinkAngle + gazePose.pitch, gazePose.yaw, 0, 'YXZ')
      ))
    bone.matrix.compose(bone.position, bone.quaternion, bone.scale)
    bone.matrixWorldNeedsUpdate = true
    bone.updateWorldMatrix(false, true)
  }

  // ── Morph targets (uniquement mouthOpen + mouthSmile sur ce modèle) ───────
  if (meshes.length > 0) {
    setMorph(meshes, morphDict, ['mouthOpen'],  mouthPhase * 0.60)
    const totalSmile = 0.14 + Math.pow(Math.max(0, smilePhase), 0.85) * 0.50
    setMorph(meshes, morphDict, ['mouthSmile'], Math.min(0.65, totalSmile))
  }
}

// ─── Frozen side detection ────────────────────────────────────────────────────

function handLandmarksEqual(a: Landmark[], b: Landmark[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i].x !== b[i].x || a[i].y !== b[i].y || a[i].z !== b[i].z) return false
  }
  return true
}

function wristSpread3d(frames: SignFrame[], wristIdx: number): number {
  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
  let zMin = Infinity, zMax = -Infinity
  for (const fr of frames) {
    const p = fr.pose[wristIdx]
    if (p.x < xMin) xMin = p.x; if (p.x > xMax) xMax = p.x
    if (p.y < yMin) yMin = p.y; if (p.y > yMax) yMax = p.y
    if (p.z < zMin) zMin = p.z; if (p.z > zMax) zMax = p.z
  }
  const dx = xMax - xMin, dy = yMax - yMin, dz = zMax - zMin
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

function wristSpreadXy(frames: SignFrame[], wristIdx: number): number {
  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
  for (const fr of frames) {
    const p = fr.pose[wristIdx]
    if (p.x < xMin) xMin = p.x; if (p.x > xMax) xMax = p.x
    if (p.y < yMin) yMin = p.y; if (p.y > yMax) yMax = p.y
  }
  return Math.hypot(xMax - xMin, yMax - yMin)
}

function isSideIdle(frames: SignFrame[], side: 'Left' | 'Right'): boolean {
  const MIN_RUN           = 5
  const FREEZE_THRESHOLD  = 0.25
  const WRIST_SPREAD_MAX  = 0.36
  const WRIST_ACTIVE_MIN  = 0.50
  const thisIdx           = side === 'Left' ? MP.LEFT_WRIST : MP.RIGHT_WRIST
  const otherIdx          = side === 'Left' ? MP.RIGHT_WRIST : MP.LEFT_WRIST
  const key               = side === 'Left' ? 'left_hand' : 'right_hand'
  const n                 = frames.length

  const xy = wristSpreadXy(frames, thisIdx)
  const otherXy = wristSpreadXy(frames, otherIdx)
  const spread = wristSpread3d(frames, thisIdx)

  // Mouvement clair dans le plan caméra → jamais idle
  if (xy >= WRIST_ACTIVE_MIN) return false

  // Signe à une main (votre_vous, douze, …) : XY de l’autre bras, pas le Z bruité
  if (xy < WRIST_SPREAD_MAX && (otherXy >= WRIST_ACTIVE_MIN || otherXy > xy * 2.2)) {
    return true
  }

  // Bras clairement actif en 3D (ex. russe_russie_3)
  if (spread >= WRIST_ACTIVE_MIN) return false

  // Main 3D détectée sur une bonne partie du clip → bras actif
  const handFrames = frames.filter((fr) => {
    const h = fr[key as 'left_hand' | 'right_hand']
    return Array.isArray(h) && h.length === 21
  }).length
  if (handFrames / n >= 0.4) return false

  // Criterion 1: freeze ratio (détection échouée, frames copiées)
  let runLen = 1, totalFrozen = 0
  for (let i = 1; i < n; i++) {
    const prev = frames[i - 1][key as keyof SignFrame] as Landmark[] | undefined
    const curr = frames[i][key as keyof SignFrame]     as Landmark[] | undefined
    if (prev && curr && handLandmarksEqual(prev, curr)) { runLen++ }
    else { if (runLen >= MIN_RUN) totalFrozen += runLen; runLen = 1 }
  }
  if (runLen >= MIN_RUN) totalFrozen += runLen
  if (totalFrozen / n >= FREEZE_THRESHOLD) return true

  // Criterion 2: poignet à peine mobile (plan caméra)
  if (xy < WRIST_SPREAD_MAX) return true

  return false
}

function computeFrozenSides(frames: SignFrame[]): Set<'Left' | 'Right'>[] {
  const n = frames.length
  const result: Set<'Left' | 'Right'>[] = Array.from({ length: n }, () => new Set<'Left' | 'Right'>())

  for (const side of ['Left', 'Right'] as const) {
    if (isSideIdle(frames, side)) {
      for (let j = 0; j < n; j++) result[j].add(side)
      continue
    }
    const wristIdx = side === 'Left' ? MP.LEFT_WRIST : MP.RIGHT_WRIST
    const elbowIdx = side === 'Left' ? MP.LEFT_ELBOW : MP.RIGHT_ELBOW
    for (let i = 0; i < n; i++) {
      const wrist = frames[i].pose[wristIdx] as any
      const elbow = frames[i].pose[elbowIdx] as any
      if ((wrist.visibility ?? 1) < 0.5 || (elbow.visibility ?? 1) < 0.5) {
        result[i].add(side)
      }
    }
  }
  return result
}

// ─── Pose application ─────────────────────────────────────────────────────────

function applyFrame(
  frame: SignFrame,
  bones: Record<string, THREE.Bone>,
  restQuats: Record<string, THREE.Quaternion>,
) {
  // Reset all bones to rest pose first, exactly like applyIdlePose does.
  // This prevents residual rotations from previous frames from affecting
  // the shoulder world quaternion used as parent reference in orientArmBone.
  for (const name of Object.keys(bones)) {
    const rest = restQuats[name]
    if (rest) {
      bones[name].quaternion.copy(rest)
      bones[name].updateWorldMatrix(true, false)
    }
  }

  const { pose, left_hand, right_hand } = frame

  if (pose.length >= 25) {
    // Auto-calibrate z scale: normalize so nose depth = TARGET_NOSE_Z shoulder-widths.
    // This compensates for old vs new extraction scripts having different z magnitudes.
    const noseZ = pose[MP.NOSE].z
    const zScale = noseZ > 0.1 ? Math.min(Math.max(TARGET_NOSE_Z / noseZ, 0.15), 1.5) : 1.0

    // Spine and head stay in rest pose — stable, natural for sign language
    // (applySpine/applyHead caused backward head tilt and torso jitter)

    const lShoulder = pose[MP.LEFT_SHOULDER]
    const rShoulder = pose[MP.RIGHT_SHOULDER]
    const leRaw = pose[MP.LEFT_ELBOW]
    const reRaw = pose[MP.RIGHT_ELBOW]
    const lwRaw = pose[MP.LEFT_WRIST]
    const rwRaw = pose[MP.RIGHT_WRIST]

    // Shoulder-height symmetry correction (applied to elbow + wrist only, not shoulder).
    // MediaPipe detects shoulders at different heights → arm direction vectors encode this
    // tilt → on Mixamo's symmetric skeleton, arms appear at different heights for symmetric
    // poses. Fix: equalize the shoulder-relative Y spans for both arms so that the avatar
    // shows identical arm geometry when the signer's arms are symmetric.
    // Blend by how symmetric the wrists are (blend=1 when same height, 0 when 0.3 apart),
    // so intentionally asymmetric signs (one arm raised) are unaffected.
    const wristYdiff = Math.abs(lwRaw.y - rwRaw.y)
    const symBlend = wristYdiff < 0.3 ? (1 - wristYdiff / 0.3) : 0

    let leAdj = leRaw
    let reAdj = reRaw
    let lwAdj = lwRaw
    let rwAdj = rwRaw

    if (symBlend > 0) {
      const lElbowSpan = leRaw.y - lShoulder.y
      const rElbowSpan = reRaw.y - rShoulder.y
      const elbowCorr  = (rElbowSpan - lElbowSpan) / 2 * symBlend
      leAdj = { ...leRaw, y: leRaw.y + elbowCorr }
      reAdj = { ...reRaw, y: reRaw.y - elbowCorr }

      const lWristSpan = lwRaw.y - lShoulder.y
      const rWristSpan = rwRaw.y - rShoulder.y
      const wristCorr  = (rWristSpan - lWristSpan) / 2 * symBlend
      lwAdj = { ...lwRaw, y: lwRaw.y + wristCorr }
      rwAdj = { ...rwRaw, y: rwRaw.y - wristCorr }
    }

    // Correct MediaPipe Z depth errors for symmetric wrist poses.
    // When both wrists are at similar Y heights, the wrist with less Z is likely
    // occluded (e.g. crossed arms, hands in front of belly) and has wrong depth.
    const depthBlend = symBlend  // reuse symmetry blend (same condition)
    const lwWrist: Landmark = depthBlend > 0
      ? { ...lwAdj, z: lwAdj.z + depthBlend * Math.max(0, rwAdj.z - lwAdj.z) }
      : lwAdj
    const rwWrist: Landmark = depthBlend > 0
      ? { ...rwAdj, z: rwAdj.z + depthBlend * Math.max(0, lwAdj.z - rwAdj.z) }
      : rwAdj

    // Symmetrize shoulder Y: MediaPipe often detects one shoulder higher than the
    // other due to body rotation. Average both Y values so the avatar's shoulders
    // stay at the same height, giving a natural human posture.
    const avgShoulderY = (lShoulder.y + rShoulder.y) / 2
    const lShoulderSym: Landmark = { ...lShoulder, y: avgShoulderY }
    const rShoulderSym: Landmark = { ...rShoulder, y: avgShoulderY }

    applyArm('Left',  lShoulderSym, leAdj, lwWrist, bones, restQuats, zScale)
    applyArm('Right', rShoulderSym, reAdj, rwWrist, bones, restQuats, zScale)
  }

  if (left_hand && left_hand.length === 21) {
    applyHand('Left', left_hand, bones, restQuats, pose[MP.LEFT_WRIST])
  }
  if (right_hand && right_hand.length === 21) {
    applyHand('Right', right_hand, bones, restQuats, pose[MP.RIGHT_WRIST])
  }
}

/**
 * Orient a bone so its local +Y axis points toward boneDir in world space.

/**
 * Orient a bone so its local +Y axis points toward boneDir in world space.
 * rollRef controls elbow twist direction (must not be (anti)parallel to boneDir).
 */
function orientArmBone(
  bone: THREE.Bone,
  parentWorldQuat: THREE.Quaternion,
  boneDir: THREE.Vector3,
  rollRef: THREE.Vector3,
) {
  const boneY = boneDir.clone().normalize()

  // If rollRef is nearly (anti)parallel to boneDir, fall back to world-down.
  // world-down is almost always perpendicular to arm directions in sign language.
  const rollRefLen = rollRef.length()
  const rollRefNorm = rollRefLen > 1e-6 ? rollRef.clone().divideScalar(rollRefLen) : new THREE.Vector3(0, -1, 0)
  const dot = Math.abs(rollRefNorm.dot(boneY))
  const ref = dot < 0.85 ? rollRef : new THREE.Vector3(0, -1, 0)

  let boneZ = ref.clone()
    .addScaledVector(boneY, -ref.dot(boneY))
    .normalize()

  // if (boneZ.lengthSq() < 0.001) {
  //   boneZ = new THREE.Vector3(0, 1, 0).addScaledVector(boneY, -boneY.y).normalize()
  // }

  const boneX = new THREE.Vector3().crossVectors(boneY, boneZ)

  const worldQuat = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(boneX, boneY, boneZ)
  )
  bone.quaternion.copy(parentWorldQuat.clone().invert().multiply(worldQuat))
  bone.updateWorldMatrix(true, false)
}

function applyArm(
  side: 'Left' | 'Right',
  shoulder: Landmark,
  elbow: Landmark,
  wrist: Landmark,
  bones: Record<string, THREE.Bone>,
  restQuats: Record<string, THREE.Quaternion>,
  zScale = 1.0,
) {
  const shoulderBone = bones[`${side}Shoulder`]
  const upperArmBone = bones[`${side}Arm`]
  const foreArmBone  = bones[`${side}ForeArm`]
  if (!shoulderBone || !upperArmBone || !foreArmBone) return

  // Bones are already in rest pose (reset at start of applyFrame).

  const ls = lm(shoulder)
  let le = lm(elbow)
  let lw = lm(wrist)

  // Scale z: auto-calibrated from nose depth each frame
  ls.z *= zScale
  le.z *= zScale
  lw.z *= zScale

  // The extracted coordinate system has person's RIGHT at +X, but the Mixamo model
  // is loaded facing the camera (+Z), so the character's anatomical right arm bone
  // is at -X in Three.js world space. Negate X to align the two conventions.
  ls.x *= -1
  le.x *= -1
  lw.x *= -1

  // Apply position adjustments
  le.x += ELBOW_OFFSET.x
  le.y += ELBOW_OFFSET.y
  le.z += ELBOW_OFFSET.z

  lw.x += WRIST_OFFSET.x
  lw.y += WRIST_OFFSET.y
  lw.z += WRIST_OFFSET.z

  // Anti-collision torse (tous signes : toi_tu, feu, pointages, …)
  clearArmFromTorso(side, ls, le, lw)

  const upperArmDir = new THREE.Vector3().subVectors(le, ls)
  const foreArmDir  = new THREE.Vector3().subVectors(lw, le)

  // Anatomy constraint: when the wrist is below the shoulder the forearm must
  // push forward so the hand stays in front of the torso mesh.
  // MediaPipe world-Z is unreliable for low/occluded wrist positions.
  // For every shoulder-width the wrist drops below the shoulder, enforce
  // at least 0.25 shoulder-widths of forward (positive-Z) component on the
  // forearm direction vector. Applied before elbowNormal so the cross-product
  // reflects the corrected geometry.
  const wristDrop = Math.max(0, ls.y - lw.y)   // in shoulder-width units; Y not zScaled
  foreArmDir.z = Math.max(foreArmDir.z, wristDrop * 0.70)

  // Compute the arm-plane normal: cross(upperArm, foreArm).
  // After X-negation of landmarks, the right arm's cross product points in the
  // opposite direction compared to the left arm — causing it to roll inward.
  // Negate for the Right side so both arms use a consistent outward-facing rollRef.
  const elbowNormal = new THREE.Vector3().crossVectors(
    upperArmDir.clone().normalize(),
    foreArmDir.clone().normalize(),
  )
  if (side === 'Right') elbowNormal.negate()

  // Fallback for nearly-straight arms (cross product ≈ 0): use a vector that gives
  // outward-pointing elbow for both up/down and forward arm configurations.
  if (elbowNormal.lengthSq() < 0.04) {
    elbowNormal.set(0, -0.3, -1).normalize()
  } else {
    elbowNormal.normalize()
  }

  const parentQ = new THREE.Quaternion()
  shoulderBone.getWorldQuaternion(parentQ)
  orientArmBone(upperArmBone, parentQ, upperArmDir, elbowNormal)

  const upperArmQ = new THREE.Quaternion()
  upperArmBone.getWorldQuaternion(upperArmQ)
  orientArmBone(foreArmBone, upperArmQ, foreArmDir, elbowNormal)
}

function applyHand(
  side: 'Left' | 'Right',
  handKp: Landmark[],
  bones: Record<string, THREE.Bone>,
  restQuats: Record<string, THREE.Quaternion>,
  wristPos?: Landmark,
) {
  const handBone  = bones[`${side}Hand`]
  const foreArm   = bones[`${side}ForeArm`]
  if (!handBone || !foreArm) return

  // Hand landmarks are in image coordinates: y increases downward, z negative = toward camera.
  // Negate y (image-down → 3D-up) and z (image-z-neg → Three.js-z-pos = toward camera).
  const hlm = (pt: Landmark) => new THREE.Vector3(pt.x, -pt.y, -pt.z)

  // ── Aligner les hand landmarks avec la position du poignet ──────────────
  const wristLandmark = hlm(handKp[0])
  let offset = new THREE.Vector3(0, 0, 0)

  // Si le wristPos est fourni (de applyArm), l'utiliser comme référence
  if (wristPos) {
    const wristRef = lm(wristPos)
    offset = new THREE.Vector3().subVectors(wristRef, wristLandmark)
  }

  // ── 1. Orient the hand bone (wrist rotation = palm direction) ──────────────
  // Build orthonormal basis from hand landmarks:
  //   Y = wrist → middle MCP  (finger extension)
  //   Z = palm normal  (cross of two in-palm vectors)
  //   X = cross(Y, Z)
  const wrist     = new THREE.Vector3().copy(hlm(handKp[0])).add(offset)
  const indexMcp  = new THREE.Vector3().copy(hlm(handKp[5])).add(offset)
  const middleMcp = new THREE.Vector3().copy(hlm(handKp[9])).add(offset)
  const pinkyMcp  = new THREE.Vector3().copy(hlm(handKp[17])).add(offset)

  const yAxis = new THREE.Vector3().subVectors(middleMcp, wrist).normalize()
  const toIndex = new THREE.Vector3().subVectors(indexMcp, wrist)
  const toPinky = new THREE.Vector3().subVectors(pinkyMcp, wrist)

  // Palm normal: cross product of two in-palm vectors.
  // Order swapped vs image-space convention to compensate for y-flip above.
  const zAxis = side === 'Right'
    ? new THREE.Vector3().crossVectors(toIndex, toPinky)
    : new THREE.Vector3().crossVectors(toPinky, toIndex)

  // Check BEFORE normalizing: if cross product is tiny (collinear or flat 2D data), use fallback
  if (zAxis.lengthSq() < 1e-6) {
    zAxis.set(0, 0, -1)  // palm faces away from camera (toward signer's face)
  } else {
    zAxis.normalize()
  }

  const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize()
  zAxis.crossVectors(xAxis, yAxis).normalize() // re-orthogonalize

  // World-space quaternion for the hand orientation
  const handWorldQuat = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis)
  )

  // Convert to forearm local space
  const foreArmWorldQuat = new THREE.Quaternion()
  foreArm.getWorldQuaternion(foreArmWorldQuat)
  handBone.quaternion.copy(foreArmWorldQuat.clone().invert().multiply(handWorldQuat))
  handBone.updateWorldMatrix(true, false)

  // ── 2. Animate finger bones ────────────────────────────────────────────────
  for (const { name, start } of FINGER_CHAINS) {
    for (let seg = 0; seg < FINGER_SEGMENTS.length; seg++) {
      const boneName = `${side}Hand${name}${seg + 1}`
      const bone = bones[boneName]
      if (!bone) continue

      const from = hlm(handKp[start + seg])
      const to   = hlm(handKp[start + seg + 1])

      const parentQ = new THREE.Quaternion()
      if (seg === 0) {
        handBone.getWorldQuaternion(parentQ)
      } else {
        bones[`${side}Hand${name}${seg}`]?.getWorldQuaternion(parentQ)
      }

      const dir = new THREE.Vector3().subVectors(to, from).normalize()
      const rest = restQuats[boneName]
      if (rest) {
        pointBoneAt(bone, rest, parentQ, dir)
        bone.updateWorldMatrix(true, false)
      }
    }
  }
}

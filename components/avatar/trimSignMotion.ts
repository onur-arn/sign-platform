import type { SignFrame } from './SignLanguageAvatar'

const MP_LW = 15
const MP_RW = 16
const MP_LE = 13
const MP_RE = 14

function lmDist(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Supprime la pose d'attente / dérive lente en tête de signe
 * (ex. mains qui glissent vers la gauche avant le vrai geste).
 * Conserve un léger pad avant le début du mouvement réel.
 */
export function trimLeadingHold(frames: SignFrame[], fps: number): SignFrame[] {
  const n = frames.length
  if (n < 16) return frames

  const speeds: number[] = [0]
  for (let i = 1; i < n; i++) {
    const a = frames[i - 1].pose
    const b = frames[i].pose
    if (!a || !b || a.length < 17 || b.length < 17) {
      speeds.push(0)
      continue
    }
    let sp = 0
    for (const idx of [MP_LW, MP_RW, MP_LE, MP_RE]) {
      sp += lmDist(a[idx], b[idx]) ** 2
    }
    speeds.push(Math.sqrt(sp))
  }

  const peak = Math.max(...speeds)
  if (peak < 0.03) return frames

  const thresh = Math.max(0.035, peak * 0.35)
  const win = Math.max(3, Math.round(fps * 0.08))
  let onset = 0
  for (let i = 0; i < n - win; i++) {
    let mean = 0
    for (let k = 0; k < win; k++) mean += speeds[i + k]
    mean /= win
    if (mean >= thresh) {
      onset = i
      break
    }
  }

  if (onset <= 2) return frames

  const pad = Math.max(2, Math.round(fps * 0.06))
  const cut = Math.max(0, onset - pad)
  const maxCut = Math.floor(n * 0.55)
  const start = Math.min(cut, maxCut)
  if (start < 3) return frames
  return frames.slice(start)
}

/**
 * Supprime le retour au repos en fin de signe (mains qui descendent /
 * partent sur le côté — ex. bouteille_1 vers la gauche).
 * Détecte une baisse durable de hauteur des poignets après le pic du geste.
 */
export function trimTrailingRest(frames: SignFrame[], fps: number): SignFrame[] {
  const n = frames.length
  if (n < 20) return frames

  const ys: number[] = []
  const lxs: number[] = []
  for (let i = 0; i < n; i++) {
    const pose = frames[i].pose
    if (!pose || pose.length < 17) {
      ys.push(0)
      lxs.push(0)
      continue
    }
    ys.push(0.5 * (pose[MP_LW].y + pose[MP_RW].y))
    lxs.push(pose[MP_LW].x)
  }

  const c0 = Math.floor(n * 0.2)
  const c1 = Math.max(c0 + 1, Math.floor(n * 0.75))
  let peakI = c0
  for (let i = c0; i < c1; i++) {
    if (ys[i] > ys[peakI]) peakI = i
  }
  const peakY = ys[peakI]
  const endY = (ys[n - 3] + ys[n - 2] + ys[n - 1]) / 3
  if (peakY - endY < 0.12) return frames

  const peakLxSlice = lxs.slice(Math.max(c0, peakI - 2), peakI + 3)
  const peakLx = peakLxSlice.reduce((s, v) => s + v, 0) / Math.max(1, peakLxSlice.length)
  const endLx = (lxs[n - 3] + lxs[n - 2] + lxs[n - 1]) / 3
  const leftSwing = peakLx - endLx

  const dropThresh = Math.max(0.07, (peakY - endY) * 0.25)
  const win = Math.max(4, Math.round(fps * 0.15))
  const startSearch = Math.max(peakI + 1, Math.floor(n * 0.45))

  let cut: number | null = null
  for (let i = startSearch; i < n - 3; i++) {
    if (peakY - ys[i] < dropThresh) continue
    const futureEnd = Math.min(n, i + win)
    let futureMin = ys[i]
    for (let j = i; j < futureEnd; j++) futureMin = Math.min(futureMin, ys[j])
    if (futureMin > peakY - dropThresh) continue

    let sumTail = 0
    for (let j = i; j < n; j++) sumTail += ys[j]
    if (sumTail / (n - i) > peakY - dropThresh) continue
    if (ys[n - 1] > peakY - 0.10) continue
    cut = i
    break
  }

  if (cut === null && leftSwing > 0.06) {
    for (let i = startSearch; i < n - 3; i++) {
      if (peakLx - lxs[i] <= 0.03) continue
      let sumDrift = 0
      for (let j = i; j < n; j++) sumDrift += peakLx - lxs[j]
      if (sumDrift / (n - i) > 0.04) {
        cut = i
        break
      }
    }
  }

  if (cut === null) return frames

  let end = cut
  const maxRemove = Math.floor(n * 0.45)
  if (n - end > maxRemove) end = n - maxRemove
  if (end < 14 || n - end < 4) return frames
  return frames.slice(0, end)
}

function lerpLm(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
  t: number,
) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  }
}

function lerpLmArray(
  a: { x: number; y: number; z: number }[] | undefined,
  b: { x: number; y: number; z: number }[] | undefined,
  t: number,
) {
  if (!a || !b || a.length === 0 || a.length !== b.length) return b ?? a
  return a.map((p, i) => lerpLm(p, b[i], t))
}

/** Interpolation linéaire des landmarks (chemin spatial, sans arc de quaternion). */
export function lerpSignFrame(a: SignFrame, b: SignFrame, t: number): SignFrame {
  if (!a?.pose && !b?.pose) return { pose: [] }
  if (!a?.pose) return b
  if (!b?.pose) return a
  const tt = Math.min(1, Math.max(0, t))
  return {
    pose: lerpLmArray(a.pose, b.pose, tt)!,
    left_hand: lerpLmArray(a.left_hand, b.left_hand, tt),
    right_hand: lerpLmArray(a.right_hand, b.right_hand, tt),
    hands: lerpLmArray(a.hands, b.hands, tt),
  }
}

/**
 * Retour vers l'idle sans « geste » latéral : Y/Z suivent le blend normal,
 * X ne rejoint la cible qu'en fin (évite mains qui partent à gauche/droite).
 */
export function lerpSignFrameToIdle(from: SignFrame, to: SignFrame, t: number): SignFrame {
  const tt = Math.min(1, Math.max(0, t))
  const mixed = lerpSignFrame(from, to, tt)
  // X retardé : descente des bras d'abord, réglage latéral seulement en toute fin
  // (évite le faux « geste vers la gauche » pendant le retour idle)
  const xT = tt < 0.72 ? 0 : (tt - 0.72) / 0.28
  const poseIdx = [11, 12, 13, 14, 15, 16]
  for (const idx of poseIdx) {
    const a = from.pose?.[idx]
    const b = to.pose?.[idx]
    if (!a || !b || !mixed.pose?.[idx]) continue
    mixed.pose[idx].x = a.x + (b.x - a.x) * xT
  }
  const fixHand = (
    srcA: { x: number; y: number; z: number }[] | undefined,
    srcB: { x: number; y: number; z: number }[] | undefined,
    dst: { x: number; y: number; z: number }[] | undefined,
  ) => {
    if (!srcA || !srcB || !dst || srcA.length !== srcB.length) return
    for (let i = 0; i < dst.length; i++) {
      dst[i].x = srcA[i].x + (srcB[i].x - srcA[i].x) * xT
    }
  }
  fixHand(from.left_hand, to.left_hand, mixed.left_hand)
  fixHand(from.right_hand, to.right_hand, mixed.right_hand)
  fixHand(from.hands, to.hands, mixed.hands)
  return mixed
}

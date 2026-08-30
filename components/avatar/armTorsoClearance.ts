import * as THREE from 'three'

/**
 * Anti-collision torse (après négation X + zScale).
 * MediaPipe place souvent coude/poignet dans le volume du buste
 * (toi_tu, feu, pointages, etc.). On repousse hors de la cage :
 *  - plan avant (Z)
 *  - écart latéral (X) côté anatomique
 */
export function clearArmFromTorso(
  side: 'Left' | 'Right',
  ls: THREE.Vector3,
  le: THREE.Vector3,
  lw: THREE.Vector3,
) {
  // ── Avant : jamais derrière / dans le thorax ─────────────────────────────
  const minElbowZ = ls.z + 0.07
  le.z = Math.max(le.z, minElbowZ)
  lw.z = Math.max(lw.z, le.z + 0.05, ls.z + 0.12)

  // Mains montées devant le torse : renforcer le plan avant
  if (lw.y > ls.y - 0.35) {
    le.z = Math.max(le.z, Math.max(ls.z, 0) + 0.12)
    lw.z = Math.max(lw.z, le.z + 0.08)
  }

  // ── Latéral : après flip X, Left = +X, Right = −X ───────────────────────
  // Empêche le coude de plonger vers la ligne médiane / dans les côtes.
  if (side === 'Left') {
    le.x = Math.max(le.x, ls.x - 0.05)
    if (le.z < ls.z + 0.22) {
      le.x = Math.max(le.x, ls.x + 0.03)
    }
    if (lw.z < ls.z + 0.28) {
      lw.x = Math.max(lw.x, 0.10)
      lw.x = Math.max(lw.x, ls.x - 0.35)
    }
  } else {
    le.x = Math.min(le.x, ls.x + 0.05)
    if (le.z < ls.z + 0.22) {
      le.x = Math.min(le.x, ls.x - 0.03)
    }
    if (lw.z < ls.z + 0.28) {
      lw.x = Math.min(lw.x, -0.10)
      lw.x = Math.min(lw.x, ls.x + 0.35)
    }
  }
}

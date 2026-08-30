import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

/**
 * Normalise les noms d'os vers le schéma Mixamo attendu par l'animation LSF.
 * - `mixamorig:LeftArm` / `mixamorigLeftArm` → `LeftArm`
 * - Ready Player Me / Sketchfab : `LeftArm_011`, `Hips_01` → `LeftArm`, `Hips`
 */
export function normalizeMixamoBoneNames(root: THREE.Object3D) {
  root.traverse((node) => {
    let name = node.name
    if (name.startsWith('mixamorig:')) {
      name = name.slice('mixamorig:'.length)
    } else if (name.startsWith('mixamorig')) {
      name = name.replace(/^mixamorig/, '')
    }
    name = name.replace(/_\d+$/, '')
    if (name && name !== node.name) node.name = name
  })
}

/**
 * Rebind tous les SkinnedMesh après modification de géométrie ou d'os.
 * Obligatoire après bakeUniformScale.
 */
export function rebindSkins(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.SkinnedMesh
    if (!mesh.isSkinnedMesh || !mesh.skeleton) return
    mesh.bindMatrix.identity()
    mesh.bindMatrixInverse.identity()
    mesh.bindMode = 'attached'
    mesh.skeleton.calculateInverses()
    mesh.bind(mesh.skeleton, mesh.bindMatrix)
  })
}

/** Hauteur Y des positions de base (ignore les morph targets). */
function positionAttributeHeight(geometry: THREE.BufferGeometry) {
  const pos = geometry.attributes.position
  if (!pos) return 0
  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return maxY - minY
}

function scaleMorphPositions(geometry: THREE.BufferGeometry, factor: number) {
  const morphs = geometry.morphAttributes.position
  if (!morphs?.length) return
  for (const attr of morphs) {
    for (let i = 0; i < attr.count; i++) {
      attr.setXYZ(i, attr.getX(i) * factor, attr.getY(i) * factor, attr.getZ(i) * factor)
    }
    attr.needsUpdate = true
  }
}

function scaleGeometryUniform(geometry: THREE.BufferGeometry, factor: number) {
  geometry.scale(factor, factor, factor)
  scaleMorphPositions(geometry, factor)
  geometry.boundingBox = null
  geometry.boundingSphere = null
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
}

/**
 * Black / Wolf3D : morphs souvent en cm (×100) et stockés comme positions absolues
 * alors que `morphTargetsRelative === true`. Corrige : scale → deltas relatifs.
 */
function normalizeMorphTargets(geometry: THREE.BufferGeometry) {
  const morphs = geometry.morphAttributes.position
  if (!morphs?.length) return
  const pos = geometry.attributes.position
  if (!pos) return

  const sample = Math.min(pos.count, 200)
  const ratios: number[] = []
  const m0 = morphs[0]
  for (let i = 0; i < sample; i++) {
    const pr = Math.hypot(pos.getX(i), pos.getY(i), pos.getZ(i))
    const mr = Math.hypot(m0.getX(i), m0.getY(i), m0.getZ(i))
    if (pr > 1e-4) ratios.push(mr / pr)
  }
  if (ratios.length) {
    ratios.sort((a, b) => a - b)
    const median = ratios[Math.floor(ratios.length / 2)]!
    if (median > 5) scaleMorphPositions(geometry, 1 / median)
  }

  if (geometry.morphTargetsRelative) {
    let sumMorph = 0
    let sumDiff = 0
    const n = Math.min(pos.count, 100)
    const m = morphs[0]
    for (let i = 0; i < n; i++) {
      sumMorph += Math.hypot(m.getX(i), m.getY(i), m.getZ(i))
      sumDiff += Math.hypot(
        m.getX(i) - pos.getX(i),
        m.getY(i) - pos.getY(i),
        m.getZ(i) - pos.getZ(i),
      )
    }
    if (sumMorph > 1e-6 && sumDiff / sumMorph > 0.5) {
      for (const attr of morphs) {
        for (let i = 0; i < attr.count; i++) {
          attr.setXYZ(
            i,
            attr.getX(i) - pos.getX(i),
            attr.getY(i) - pos.getY(i),
            attr.getZ(i) - pos.getZ(i),
          )
        }
        attr.needsUpdate = true
      }
    }
  }
}

function scaleGeometriesAndBones(root: THREE.Object3D, factor: number) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh && mesh.geometry) {
      mesh.geometry = mesh.geometry.clone()
      scaleGeometryUniform(mesh.geometry, factor)
    }
    if ((obj as THREE.Bone).isBone) {
      ;(obj as THREE.Bone).position.multiplyScalar(factor)
    }
  })
}

/**
 * Bake échelle → hauteur cible (~1,7 m).
 * - RPM (~180 m) : uniquement root.scale (pas de bake géométrie / rebind —
 *   ça explosait le mesh). Même approche que Black.
 * - Mixamo ♀ / Black (déjà ~1,7–1,9 m) : root.scale si besoin + sol.
 *   Ne pas collapse les scales nœud (casse le skinning Mixamo ♀).
 */
export function bakeUniformScale(root: THREE.Object3D, targetHeight = 1.7) {
  root.updateMatrixWorld(true)

  const box0 = new THREE.Box3().setFromObject(root)
  const h0 = box0.isEmpty() ? 1e-6 : Math.max(box0.max.y - box0.min.y, 1e-6)

  const s = targetHeight / h0
  if (Math.abs(s - 1) > 0.05) {
    root.scale.multiplyScalar(s)
    root.updateMatrixWorld(true)
  }

  const box = new THREE.Box3().setFromObject(root)
  if (!box.isEmpty()) {
    root.position.y -= box.min.y
    root.updateMatrixWorld(true)
  }
}

const ARM_REST_BONES = [
  'Hips',
  'Spine',
  'Spine1',
  'Spine2',
  'Neck',
  'LeftShoulder',
  'LeftArm',
  'LeftForeArm',
  'LeftHand',
  'RightShoulder',
  'RightArm',
  'RightForeArm',
  'RightHand',
] as const

/** RPM : bras seulement — épaules natives (clavicules Mixamo déforment le buste). */
const ARM_ONLY_BONES = [
  'LeftArm',
  'LeftForeArm',
  'LeftHand',
  'RightArm',
  'RightForeArm',
  'RightHand',
] as const

/** Mixamo → Mixamo (Ahmet) : copier aussi les clavicules. */
const ARM_AND_SHOULDER_BONES = [
  'LeftShoulder',
  'RightShoulder',
  ...ARM_ONLY_BONES,
] as const

const FINGER_REST_BONE_RE = /^(Left|Right)Hand(Thumb|Index|Middle|Ring|Pinky)[1-3]$/

/**
 * Copie l'orientation MONDE depuis Mixamo ♂.
 * - défaut (Black) : torse + bras + doigts
 * - armsOnly (RPM) : épaules/bras/mains/doigts uniquement
 */
export function copyArmRestFromReference(
  target: THREE.Object3D,
  reference: THREE.Object3D,
  opts: { armsOnly?: boolean; withShoulders?: boolean } = {},
) {
  const ref = SkeletonUtils.clone(reference)
  normalizeMixamoBoneNames(ref)
  ref.updateMatrixWorld(true)
  target.updateMatrixWorld(true)

  const base = opts.armsOnly
    ? (opts.withShoulders ? [...ARM_AND_SHOULDER_BONES] : [...ARM_ONLY_BONES])
    : [...ARM_REST_BONES]
  const names: string[] = [...base]
  ref.traverse((o) => {
    if ((o as THREE.Bone).isBone && FINGER_REST_BONE_RE.test(o.name)) {
      names.push(o.name)
    }
  })

  const order = opts.armsOnly
    ? [
        ...names.filter((n) => n.endsWith('Shoulder')),
        ...names.filter((n) => /Arm$/.test(n) && !n.includes('ForeArm')),
        ...names.filter((n) => n.endsWith('ForeArm')),
        ...names.filter((n) => n.endsWith('Hand')),
        ...names.filter((n) => FINGER_REST_BONE_RE.test(n)),
      ]
    : [
        'Hips',
        'Spine',
        'Spine1',
        'Spine2',
        'Neck',
        ...names.filter((n) => n.endsWith('Shoulder')),
        ...names.filter((n) => /Arm$/.test(n) && !n.includes('ForeArm')),
        ...names.filter((n) => n.endsWith('ForeArm')),
        ...names.filter((n) => n.endsWith('Hand')),
        ...names.filter((n) => FINGER_REST_BONE_RE.test(n)),
      ]

  const worldQ = new THREE.Quaternion()
  const parentQ = new THREE.Quaternion()
  const seen = new Set<string>()

  for (const name of order) {
    if (seen.has(name)) continue
    seen.add(name)
    const src = ref.getObjectByName(name) as THREE.Bone | undefined
    const dst = target.getObjectByName(name) as THREE.Bone | undefined
    if (!src || !dst?.parent) continue
    src.getWorldQuaternion(worldQ)
    dst.parent.getWorldQuaternion(parentQ)
    dst.quaternion.copy(parentQ.clone().invert().multiply(worldQ))
    dst.updateWorldMatrix(true, false)
  }

  target.updateMatrixWorld(true)
  target.traverse((obj) => {
    const mesh = obj as THREE.SkinnedMesh
    if (mesh.isSkinnedMesh && mesh.skeleton) mesh.skeleton.update()
  })
}

/** Jambes uniquement (UpLeg → Foot) : orientation monde = Mixamo ♂ (vers le bas). */
const LEG_REST_BONES = [
  'LeftUpLeg',
  'LeftLeg',
  'LeftFoot',
  'LeftToeBase',
  'RightUpLeg',
  'RightLeg',
  'RightFoot',
  'RightToeBase',
] as const

/**
 * Remet les jambes vers le bas (copie monde depuis Mixamo ♂).
 * Ne touche ni buste, ni tête, ni bras.
 */
export function copyLegRestFromReference(
  target: THREE.Object3D,
  reference: THREE.Object3D,
) {
  const ref = SkeletonUtils.clone(reference)
  normalizeMixamoBoneNames(ref)
  ref.updateMatrixWorld(true)
  target.updateMatrixWorld(true)

  const worldQ = new THREE.Quaternion()
  const parentQ = new THREE.Quaternion()

  for (const name of LEG_REST_BONES) {
    const src = ref.getObjectByName(name) as THREE.Bone | undefined
    const dst = target.getObjectByName(name) as THREE.Bone | undefined
    if (!src || !dst?.parent) continue
    src.getWorldQuaternion(worldQ)
    dst.parent.getWorldQuaternion(parentQ)
    dst.quaternion.copy(parentQ.clone().invert().multiply(worldQ))
    dst.updateWorldMatrix(true, false)
  }

  target.updateMatrixWorld(true)
  target.traverse((obj) => {
    const mesh = obj as THREE.SkinnedMesh
    if (mesh.isSkinnedMesh && mesh.skeleton) mesh.skeleton.update()
  })
}

function snapToFloor(root: THREE.Object3D) {
  root.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(root)
  if (box.isEmpty()) return
  root.position.y -= box.min.y
  root.updateMatrixWorld(true)
}

/** Pieds à la même hauteur qu’Emre (Mixamo ♂ à y = -1). */
export function emreStageY(root: THREE.Object3D, emreFeetY = -1) {
  root.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(root)
  if (box.isEmpty() || !Number.isFinite(box.min.y)) return emreFeetY
  return emreFeetY - box.min.y
}

/**
 * Remonte buste / bras / tête au-dessus des hanches (Spine.local.y).
 * Ne touche pas aux os des jambes (enfants de Hips, pas de Spine).
 * Sur RPM, après copie hanches, Spine.y est souvent négatif → fusion jambe/torse.
 */
export function liftTorsoAboveHips(root: THREE.Object3D) {
  const spine = root.getObjectByName('Spine') as THREE.Bone | undefined
  if (!spine) return
  if (spine.position.y < 0) {
    spine.position.y = Math.abs(spine.position.y)
  }
  // Petit écart supplémentaire pour éviter le clipping taille/cuisses
  spine.position.y += 0.04
  spine.updateWorldMatrix(true, true)
  root.updateMatrixWorld(true)
  root.traverse((obj) => {
    const mesh = obj as THREE.SkinnedMesh
    if (mesh.isSkinnedMesh && mesh.skeleton) mesh.skeleton.update()
  })
}

/** Écarte les bras autour de l’axe monde Z (évite mains qui se touchent). */
export function openArmsOutward(root: THREE.Object3D, radians: number) {
  if (!(radians > 0)) return
  const parentQ = new THREE.Quaternion()
  const worldZ = new THREE.Vector3(0, 0, 1)
  const localAxis = new THREE.Vector3()
  const q = new THREE.Quaternion()

  for (const side of ['Left', 'Right'] as const) {
    const arm = root.getObjectByName(`${side}Arm`) as THREE.Bone | undefined
    if (!arm?.parent) continue
    arm.parent.getWorldQuaternion(parentQ)
    localAxis.copy(worldZ).applyQuaternion(parentQ.clone().invert()).normalize()
    const sign = side === 'Left' ? 1 : -1
    q.setFromAxisAngle(localAxis, sign * radians)
    arm.quaternion.premultiply(q)
    arm.updateWorldMatrix(true, true)
  }
  root.updateMatrixWorld(true)
  root.traverse((obj) => {
    const mesh = obj as THREE.SkinnedMesh
    if (mesh.isSkinnedMesh && mesh.skeleton) mesh.skeleton.update()
  })
}

/**
 * Avance épaules + bras (T-pose Mixamo trop « poitrine ouverte / omoplates en arrière »).
 * Rotation autour de l’axe monde Y : Left −Y, Right +Y → vers +Z.
 */
export function bringArmsForward(root: THREE.Object3D, radians: number) {
  if (!(radians > 0)) return
  const parentQ = new THREE.Quaternion()
  const worldY = new THREE.Vector3(0, 1, 0)
  const localAxis = new THREE.Vector3()
  const q = new THREE.Quaternion()

  for (const side of ['Left', 'Right'] as const) {
    const sign = side === 'Left' ? -1 : 1
    for (const [part, weight] of [
      ['Shoulder', 1],
      ['Arm', 0.55],
    ] as const) {
      const bone = root.getObjectByName(`${side}${part}`) as THREE.Bone | undefined
      if (!bone?.parent) continue
      bone.parent.getWorldQuaternion(parentQ)
      localAxis.copy(worldY).applyQuaternion(parentQ.clone().invert()).normalize()
      q.setFromAxisAngle(localAxis, sign * radians * weight)
      bone.quaternion.premultiply(q)
      bone.updateWorldMatrix(true, true)
    }
  }
  root.updateMatrixWorld(true)
  root.traverse((obj) => {
    const mesh = obj as THREE.SkinnedMesh
    if (mesh.isSkinnedMesh && mesh.skeleton) mesh.skeleton.update()
  })
}

/**
 * Abaisse la clavicule (épaules « gonflées » / haussées).
 * Rotation monde Z : Left −Z, Right +Z → extrémité de l’épaule vers le bas.
 */
export function depressShoulders(root: THREE.Object3D, radians: number) {
  if (!(radians > 0)) return
  const parentQ = new THREE.Quaternion()
  const worldZ = new THREE.Vector3(0, 0, 1)
  const localAxis = new THREE.Vector3()
  const q = new THREE.Quaternion()

  for (const side of ['Left', 'Right'] as const) {
    const bone = root.getObjectByName(`${side}Shoulder`) as THREE.Bone | undefined
    if (!bone?.parent) continue
    bone.parent.getWorldQuaternion(parentQ)
    localAxis.copy(worldZ).applyQuaternion(parentQ.clone().invert()).normalize()
    const sign = side === 'Left' ? -1 : 1
    q.setFromAxisAngle(localAxis, sign * radians)
    bone.quaternion.premultiply(q)
    bone.updateWorldMatrix(true, true)
  }
  root.updateMatrixWorld(true)
  root.traverse((obj) => {
    const mesh = obj as THREE.SkinnedMesh
    if (mesh.isSkinnedMesh && mesh.skeleton) mesh.skeleton.update()
  })
}

export type PrepareMixamoOptions = {
  /** Bake échelle + hauteur (~1,7 m). false = déjà en mètres (Hellen, Harry). */
  bakeScale?: boolean
  /** Bras au repos = copie Mixamo ♂. RPM / Black. */
  naturalArms?: boolean
  /**
   * RPM : ne copier que bras/mains (épaules + torse + jambes natifs).
   * Mixamo→Mixamo (Ahmet) : armsOnly + withShoulders.
   */
  armsOnly?: boolean
  /** Avec armsOnly : copier aussi Left/RightShoulder (squelette Mixamo). */
  withShoulders?: boolean
  /** Jambes vers le bas (legacy ; inutile si armsOnly). */
  naturalLegs?: boolean
  /** Baisse les épaules (mètres, local Y). */
  shoulderDrop?: number
  /** Abaisse la clavicule (radians) — détend épaules gonflées. */
  shoulderDepress?: number
  /** Écarte les bras au repos (radians, axe monde Z). RPM. */
  armOpen?: number
  /** Avance épaules/bras (radians) — T-pose trop en arrière. */
  armForward?: number
  /** Scène Mixamo ♂ (`avatar.glb`). */
  armRestFrom?: THREE.Object3D
}

/** Baisse Left/RightShoulder (les bras suivent). */
export function dropShoulders(root: THREE.Object3D, amount: number) {
  if (!(amount > 0)) return
  for (const name of ['LeftShoulder', 'RightShoulder']) {
    const bone = root.getObjectByName(name) as THREE.Bone | undefined
    if (!bone) continue
    bone.position.y -= amount
    bone.updateWorldMatrix(true, true)
  }
  root.updateMatrixWorld(true)
  root.traverse((obj) => {
    const mesh = obj as THREE.SkinnedMesh
    if (mesh.isSkinnedMesh && mesh.skeleton) mesh.skeleton.update()
  })
}

/** Clone la scène GLTF et prépare un avatar pour l'animation LSF. */
export function prepareMixamoScene(
  gltfScene: THREE.Object3D,
  targetHeight = 1.7,
  options: PrepareMixamoOptions = {},
) {
  const root = SkeletonUtils.clone(gltfScene)
  normalizeMixamoBoneNames(root)

  const bakeScale = options.bakeScale ?? true
  if (bakeScale) {
    bakeUniformScale(root, targetHeight)
  } else {
    snapToFloor(root)
  }

  if (options.naturalArms && options.armRestFrom) {
    copyArmRestFromReference(root, options.armRestFrom, {
      armsOnly: options.armsOnly === true,
      withShoulders: options.withShoulders === true,
    })
  }

  if (options.shoulderDrop && options.shoulderDrop > 0) {
    dropShoulders(root, options.shoulderDrop)
  }

  if (options.shoulderDepress && options.shoulderDepress > 0) {
    depressShoulders(root, options.shoulderDepress)
  }

  if (options.armOpen && options.armOpen > 0) {
    openArmsOutward(root, options.armOpen)
  }

  if (options.armForward && options.armForward > 0) {
    bringArmsForward(root, options.armForward)
  }

  // Uniquement si on a copié les hanches (pas armsOnly) et que les jambes se retournent
  if (options.naturalLegs && options.armRestFrom && !options.armsOnly) {
    copyLegRestFromReference(root, options.armRestFrom)
    liftTorsoAboveHips(root)
    snapToFloor(root)
  }

  return root
}

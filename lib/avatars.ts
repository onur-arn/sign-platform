import type { PrepareMixamoOptions } from '@/components/avatar/prepareMixamoAvatar'

export type AvatarPipeline = 'male' | 'female'

export type AvatarOption = {
  id: string
  label: string
  url: string | null
  prepare: PrepareMixamoOptions | null
  pipeline: AvatarPipeline
}

/** Avatars avec prénoms turcs (Ahmet conservé). */
export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'emre', label: 'Emre', url: null, prepare: null, pipeline: 'male' },
  { id: 'elif', label: 'Elif', url: '/avatar_female.glb', prepare: { bakeScale: true }, pipeline: 'female' },
  { id: 'ahmet', label: 'Ahmet', url: '/avatar_ahmet.glb', prepare: { bakeScale: false }, pipeline: 'female' },
  { id: 'zeynep', label: 'Zeynep', url: '/avatar_hellen.glb', prepare: { bakeScale: false, armOpen: 0.06 }, pipeline: 'female' },
  { id: 'yusuf', label: 'Yusuf', url: '/avatar_harry.glb', prepare: null, pipeline: 'female' },
  { id: 'burak', label: 'Burak', url: '/avatar_rpm_male.glb', prepare: { bakeScale: true, naturalArms: true, armsOnly: true, armOpen: 0.01 }, pipeline: 'male' },
  { id: 'deniz', label: 'Deniz', url: '/avatar_rpm_female.glb', prepare: { bakeScale: true, naturalArms: true, armsOnly: true, armOpen: 0.06 }, pipeline: 'male' },
  { id: 'selin', label: 'Selin', url: '/avatar_rpm_female2.glb', prepare: { bakeScale: true, naturalArms: true, armsOnly: true, armOpen: 0.06 }, pipeline: 'male' },
  { id: 'kaan', label: 'Kaan', url: '/avatar_black.glb', prepare: { bakeScale: true, naturalArms: true }, pipeline: 'male' },
]

export const DEFAULT_AVATAR_ID = 'emre'

export function getAvatar(id: string): AvatarOption {
  return AVATAR_OPTIONS.find((a) => a.id === id) ?? AVATAR_OPTIONS[0]!
}

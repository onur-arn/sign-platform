import type { PrepareMixamoOptions } from '@/components/avatar/prepareMixamoAvatar'

export type AvatarPipeline = 'male' | 'female'

export type AvatarOption = {
  id: string
  label: string
  url: string | null
  prepare: PrepareMixamoOptions | null
  pipeline: AvatarPipeline
}

/** Avatars — prénoms internationaux (TR / PL / FR / EN). Ahmet, Emre, Eva conservés. */
export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'emre', label: 'Emre', url: null, prepare: null, pipeline: 'male' },
  { id: 'elif', label: 'Maya', url: '/avatar_female.glb', prepare: { bakeScale: true }, pipeline: 'female' },
  { id: 'kaan', label: 'Max', url: '/avatar_black.glb', prepare: { bakeScale: true, naturalArms: true }, pipeline: 'male' },
  { id: 'zeynep', label: 'Lara', url: '/avatar_hellen.glb', prepare: { bakeScale: false, armOpen: 0.06 }, pipeline: 'female' },
  { id: 'burak', label: 'Adam', url: '/avatar_rpm_male.glb', prepare: { bakeScale: true, naturalArms: true, armsOnly: true, armOpen: 0.01 }, pipeline: 'male' },
  { id: 'deniz', label: 'Eva', url: '/avatar_rpm_female.glb', prepare: { bakeScale: true, naturalArms: true, armsOnly: true, armOpen: 0.06 }, pipeline: 'male' },
  { id: 'ahmet', label: 'Ahmet', url: '/avatar_ahmet.glb', prepare: { bakeScale: false }, pipeline: 'female' },
  { id: 'selin', label: 'Nina', url: '/avatar_rpm_female2.glb', prepare: { bakeScale: true, naturalArms: true, armsOnly: true, armOpen: 0.06 }, pipeline: 'male' },
  { id: 'yusuf', label: 'Leo', url: '/avatar_harry.glb', prepare: null, pipeline: 'female' },
]

export const DEFAULT_AVATAR_ID = 'emre'

export function getAvatar(id: string): AvatarOption {
  return AVATAR_OPTIONS.find((a) => a.id === id) ?? AVATAR_OPTIONS[0]!
}

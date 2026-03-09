import type { Gender, Style } from '@/types/snowboard'

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unisex', label: 'Unisex' },
]

export const STYLE_OPTIONS: { value: Style; label: string }[] = [
  { value: 'all_mountain', label: 'All mountain' },
  { value: 'freestyle', label: 'Freestyle' },
  { value: 'freeride', label: 'Freeride' },
]

import type { ClassValue } from 'clsx'
import type { Gender, Style } from '@/types/snowboard'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

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

const STYLE_BADGE_CLASSES: Record<string, string> = {
  all_mountain:
    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  freestyle:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  freeride:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
}

// Merges Tailwind CSS classes, resolving conflicts (e.g. `p-4` + `p-2` → `p-2`).
// Uses clsx for conditional classes and tailwind-merge to deduplicate utilities.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidNumber(val: unknown, min = 0, max?: number): boolean {
  if (typeof val !== 'number' || Number.isNaN(val)) return false
  if (val < min) return false
  if (max !== undefined && val > max) return false
  return true
}

export function getStyleBadgeClass(style: string): string {
  return STYLE_BADGE_CLASSES[style] ?? 'bg-muted text-muted-foreground border-border'
}

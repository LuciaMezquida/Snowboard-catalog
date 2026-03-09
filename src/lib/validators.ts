export function isValidNumber(val: unknown, min = 0, max?: number): boolean {
  if (typeof val !== 'number' || Number.isNaN(val)) return false
  if (val < min) return false
  if (max !== undefined && val > max) return false
  return true
}

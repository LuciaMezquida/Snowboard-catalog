export function formatStyleLabel(value: string): string {
  return value.replace(/_/g, ' ')
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

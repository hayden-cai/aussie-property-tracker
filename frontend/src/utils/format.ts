/** Format price based on listing type */
export function formatPrice(price: number, type: 'rent' | 'buy'): string {
  if (type === 'rent') return `$${price}/pw`
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`
  return `$${price.toLocaleString('en-AU')}`
}

/** Time since ISO timestamp */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs} hr${hrs === 1 ? '' : 's'} ago`
}

/** Normalise AU phone number to E.164 */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('61')) return `+${digits}`
  if (digits.startsWith('0'))  return `+61${digits.slice(1)}`
  return `+61${digits}`
}

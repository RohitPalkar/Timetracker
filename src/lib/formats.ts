import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

function toDate(value: string | Date): Date {
  const d = typeof value === 'string' ? parseISO(value) : value
  return isValid(d) ? d : new Date()
}

export function formatDate(value: string | Date): string {
  return format(toDate(value), 'MMM d, yyyy')
}

export function formatShortDate(value: string | Date): string {
  return format(toDate(value), 'MMM d')
}

export function formatDay(value: string | Date): string {
  return format(toDate(value), 'EEE')
}

export function formatFullDay(value: string | Date): string {
  return format(toDate(value), 'EEEE, MMM d')
}

export function formatDateTime(value: string | Date): string {
  return format(toDate(value), 'MMM d, yyyy · h:mm a')
}

export function formatRelative(value: string | Date): string {
  return formatDistanceToNow(toDate(value), { addSuffix: true })
}

export function formatWeekRange(start: string | Date, end: string | Date): string {
  return `${formatShortDate(start)} – ${formatShortDate(end)}, ${format(toDate(start), 'yyyy')}`
}

export function formatHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10
  return `${rounded}h`
}

export function formatHoursDetailed(hours: number): string {
  const whole = Math.floor(hours)
  const minutes = Math.round((hours - whole) * 60)
  if (whole === 0) return `${minutes}m`
  if (minutes === 0) return `${whole}h`
  return `${whole}h ${minutes}m`
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function initialsFromName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
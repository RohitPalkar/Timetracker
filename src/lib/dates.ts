import { addDays, formatISO, startOfWeek, endOfWeek, parseISO, isValid } from 'date-fns'

export function iso(value: Date): string {
  return formatISO(value, { representation: 'date' })
}

export function today(): string {
  return iso(new Date())
}

export function weekStart(value: Date = new Date()): string {
  return iso(startOfWeek(value, { weekStartsOn: 1 }))
}

export function weekEnd(value: Date = new Date()): string {
  return iso(endOfWeek(value, { weekStartsOn: 1 }))
}

export function weekDays(start: string): string[] {
  const base = parseISO(`${start}T00:00:00`)
  return Array.from({ length: 7 }, (_, index) => iso(addDays(base, index)))
}

export function isIsoDate(value: string): boolean {
  return isValid(parseISO(value))
}

export function toIsoOrToday(value?: string): string {
  return value && isIsoDate(value) ? value : today()
}

export function dateRange(start: string, end: string): string[] {
  const from = parseISO(`${start}T00:00:00`)
  const to = parseISO(`${end}T00:00:00`)
  if (!isValid(from) || !isValid(to) || to < from) return []
  const days: string[] = []
  let cursor = from
  while (cursor <= to) {
    days.push(iso(cursor))
    cursor = addDays(cursor, 1)
  }
  return days
}

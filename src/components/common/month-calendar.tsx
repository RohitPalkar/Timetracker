import * as React from 'react'
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type CalendarEventTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral'

export interface MonthCalendarEvent {
  /** ISO date string — the day the event is pinned to. */
  date: string
  label: string
  tone?: CalendarEventTone
}

const TONE_CLASS: Record<CalendarEventTone, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  neutral: 'bg-muted-foreground',
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export interface MonthCalendarProps {
  events: MonthCalendarEvent[]
  /** Starting month; defaults to today. */
  initialMonth?: Date
  className?: string
}

/** Reusable month-view calendar. Renders a 6×7 grid with event dots + tooltips. */
export function MonthCalendar({ events, initialMonth, className }: MonthCalendarProps) {
  const [month, setMonth] = React.useState(() => (initialMonth ? startOfMonth(initialMonth) : startOfMonth(new Date())))

  const grid = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 })
    const days: Date[] = []
    let cursor = start
    while (cursor <= end) {
      days.push(cursor)
      cursor = addDays(cursor, 1)
    }
    return days
  }, [month])

  const byDay = React.useMemo(() => {
    const map = new Map<string, MonthCalendarEvent[]>()
    for (const event of events) {
      const key = parseISO(event.date).toDateString()
      const list = map.get(key) ?? []
      list.push(event)
      map.set(key, list)
    }
    return map
  }, [events])

  const today = new Date()

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground" aria-live="polite">
          {format(month, 'MMMM yyyy')}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" aria-label="Previous month" onClick={() => setMonth((m) => subMonths(m, 1))}>
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Next month" onClick={() => setMonth((m) => addMonths(m, 1))}>
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((day) => (
            <div key={day} className="px-2 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map((day) => {
            const dayEvents = byDay.get(day.toDateString()) ?? []
            const inMonth = isSameMonth(day, month)
            const isToday = isSameDay(day, today)
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'flex min-h-[72px] flex-col gap-1 border-b border-r border-border p-1.5 last:border-r-0 sm:min-h-[88px]',
                  !inMonth && 'bg-surface-muted/40',
                  day.getDay() === 6 && 'border-r-0',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-[12px]',
                    inMonth ? 'text-foreground' : 'text-muted-foreground/60',
                    isToday && 'bg-primary font-semibold text-primary-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>
                <div className="flex flex-wrap gap-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <Tooltip key={`${event.date}-${event.label}`}>
                      <TooltipTrigger asChild>
                        <span
                          className={cn('h-1.5 w-1.5 rounded-full', TONE_CLASS[event.tone ?? 'primary'])}
                          aria-label={event.label}
                        />
                      </TooltipTrigger>
                      <TooltipContent>{event.label}</TooltipContent>
                    </Tooltip>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] font-medium text-muted-foreground">+{dayEvents.length - 3}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

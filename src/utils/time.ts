import type { ClockData } from '@/types'

interface FormatOptions {
  hour24: boolean
  showSeconds: boolean
  timezone: string
}

/**
 * Build a fully-formatted clock snapshot for a given moment using
 * Intl.DateTimeFormat so timezone + locale handling stays correct.
 */
export function formatClock(date: Date, opts: FormatOptions): ClockData {
  const { hour24, showSeconds, timezone } = opts

  const timeFmt = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    ...(showSeconds ? { second: '2-digit' } : {}),
    hour12: !hour24,
    timeZone: timezone,
  })

  // en-GB with hour12 still yields "am/pm"; extract cleanly via parts.
  const parts = timeFmt.formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''

  const hh = get('hour')
  const mm = get('minute')
  const ss = get('second')
  const dayPeriod = get('dayPeriod')

  const time = [hh, mm, ...(showSeconds ? [ss] : [])].join(':')

  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: timezone,
  }).format(date)

  const dateStr = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: timezone,
  }).format(date)

  return {
    time,
    weekday,
    date: dateStr,
    ampm: hour24 ? '' : dayPeriod.toUpperCase(),
    timezone,
  }
}

/** Human-friendly UTC offset label, e.g. "UTC+5:30". */
export function timezoneOffsetLabel(timezone: string, date = new Date()): string {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    })
    const part = fmt.formatToParts(date).find((p) => p.type === 'timeZoneName')
    return part?.value ?? 'UTC'
  } catch {
    return 'UTC'
  }
}

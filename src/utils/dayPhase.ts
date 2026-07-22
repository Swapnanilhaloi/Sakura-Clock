/**
 * Time-of-day sky presets. Boundaries are fractional hours (0–24) so the
 * phase can be recomputed cheaply every minute. Hues follow the real sky:
 * blue by day and night, warm gold/orange at dawn and dusk — kept muted
 * rather than vivid, but never tinted purple/violet.
 */

export interface DayPhase {
  key: 'night' | 'dawn' | 'morning' | 'day' | 'dusk' | 'evening'
  label: string
  /** CSS gradient for the animated sky layer. */
  gradient: string
  /** CSS background for the horizon glow layer. */
  horizonGlow: string
  /** Star/particle brightness multiplier, 0–1. */
  starOpacity: number
  mountainFar: string
  mountainNear: string
}

const NIGHT: DayPhase = {
  key: 'night',
  label: 'Night',
  gradient:
    'linear-gradient(135deg, #01030a 0%, #060b18 30%, #0b1528 60%, #122036 100%)',
  horizonGlow:
    'radial-gradient(120% 100% at 50% 100%, rgba(56,84,128,0.18) 0%, rgba(20,30,52,0.08) 40%, transparent 70%)',
  starOpacity: 1,
  mountainFar: '#0a0e1a',
  mountainNear: '#050810',
}

const DAWN: DayPhase = {
  key: 'dawn',
  label: 'Dawn',
  gradient:
    'linear-gradient(160deg, #060b18 0%, #16233c 30%, #3c4f68 55%, #8a7a68 80%, #d9a466 100%)',
  horizonGlow:
    'radial-gradient(120% 100% at 50% 100%, rgba(255,186,120,0.30) 0%, rgba(120,120,140,0.06) 40%, transparent 70%)',
  starOpacity: 0.3,
  mountainFar: '#16223a',
  mountainNear: '#0d1524',
}

const MORNING: DayPhase = {
  key: 'morning',
  label: 'Morning',
  gradient:
    'linear-gradient(160deg, #14243c 0%, #27405e 30%, #4d6d8f 55%, #93b3cc 80%, #d7e6ee 100%)',
  horizonGlow:
    'radial-gradient(120% 100% at 50% 100%, rgba(255,240,214,0.18) 0%, rgba(140,175,204,0.08) 40%, transparent 70%)',
  starOpacity: 0,
  mountainFar: '#233350',
  mountainNear: '#162238',
}

const DAY: DayPhase = {
  key: 'day',
  label: 'Day',
  // Kept noticeably brighter/more uniform than the other phases — with
  // day-time text switched to near-black for contrast (see html.daytime in
  // index.css), even the darkest stop here needs to stay light throughout
  // the frame, not just near the horizon.
  gradient:
    'linear-gradient(160deg, #6f9ecb 0%, #86b0d6 30%, #a3c4e0 55%, #c6dfec 80%, #e8f3f8 100%)',
  horizonGlow:
    'radial-gradient(120% 100% at 50% 100%, rgba(255,247,224,0.22) 0%, rgba(163,196,224,0.1) 40%, transparent 70%)',
  starOpacity: 0,
  mountainFar: '#264264',
  mountainNear: '#182c46',
}

const DUSK: DayPhase = {
  key: 'dusk',
  label: 'Dusk',
  gradient:
    'linear-gradient(160deg, #0c1220 0%, #1c2438 25%, #4a3d40 50%, #a15b42 75%, #e3934f 100%)',
  horizonGlow:
    'radial-gradient(120% 100% at 50% 100%, rgba(255,150,90,0.32) 0%, rgba(120,90,80,0.10) 40%, transparent 70%)',
  starOpacity: 0.3,
  mountainFar: '#161c2c',
  mountainNear: '#0d111c',
}

const EVENING: DayPhase = {
  key: 'evening',
  label: 'Evening',
  gradient:
    'linear-gradient(150deg, #030509 0%, #080e1c 30%, #101d33 60%, #24303f 85%, #4b4234 100%)',
  horizonGlow:
    'radial-gradient(120% 100% at 50% 100%, rgba(255,170,110,0.14) 0%, rgba(70,90,120,0.08) 40%, transparent 70%)',
  starOpacity: 0.75,
  mountainFar: '#0b0f1a',
  mountainNear: '#06080f',
}

/** Fallback phase used when the day/night cycle is turned off. */
export const STATIC_PHASE = NIGHT

/** Ordered boundaries; a phase runs from its `from` hour up to the next one's. */
const SCHEDULE: Array<{ from: number; phase: DayPhase }> = [
  { from: 0, phase: NIGHT },
  { from: 4.5, phase: DAWN },
  { from: 6.5, phase: MORNING },
  { from: 10.5, phase: DAY },
  { from: 15.5, phase: DUSK },
  { from: 18.5, phase: EVENING },
  { from: 21.5, phase: NIGHT },
]

/** Resolves a fractional hour (0–24) to its sky phase. */
export function getDayPhase(hour: number): DayPhase {
  let current = SCHEDULE[0].phase
  for (const entry of SCHEDULE) {
    if (hour >= entry.from) current = entry.phase
    else break
  }
  return current
}

/** Current fractional hour (e.g. 14.5 for 2:30pm) within a given IANA timezone. */
export function hourInTimezone(timezone: string, date: Date = new Date()): number {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone,
    }).formatToParts(date)
    const hh = Number(parts.find((p) => p.type === 'hour')?.value ?? '0')
    const mm = Number(parts.find((p) => p.type === 'minute')?.value ?? '0')
    return (hh % 24) + mm / 60
  } catch {
    return date.getHours() + date.getMinutes() / 60
  }
}

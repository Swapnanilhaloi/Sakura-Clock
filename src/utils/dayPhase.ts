/**
 * Time-of-day sky presets. Boundaries are fractional hours (0–24) so the
 * phase can be recomputed cheaply every minute. Colours stay deliberately
 * desaturated across every phase — even "day" — to keep the muted,
 * no-bright-colours mood consistent through the full cycle.
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
    'linear-gradient(135deg, #0b1020 0%, #131a2e 25%, #1e293b 50%, #241b33 75%, #0b1020 100%)',
  horizonGlow:
    'radial-gradient(120% 100% at 50% 100%, rgba(249,168,212,0.16) 0%, rgba(167,139,250,0.10) 35%, transparent 70%)',
  starOpacity: 1,
  mountainFar: '#0f1626',
  mountainNear: '#080b14',
}

const DAWN: DayPhase = {
  key: 'dawn',
  label: 'Dawn',
  gradient:
    'linear-gradient(160deg, #171b2e 0%, #2a2440 35%, #4b3450 60%, #7a4f52 85%, #9c6257 100%)',
  horizonGlow:
    'radial-gradient(120% 100% at 50% 100%, rgba(251,191,150,0.22) 0%, rgba(167,139,250,0.08) 40%, transparent 70%)',
  starOpacity: 0.4,
  mountainFar: '#1a1f33',
  mountainNear: '#11141f',
}

const MORNING: DayPhase = {
  key: 'morning',
  label: 'Morning',
  gradient:
    'linear-gradient(160deg, #232a42 0%, #34405f 30%, #55688c 55%, #8298b8 80%, #b9c6d9 100%)',
  horizonGlow:
    'radial-gradient(120% 100% at 50% 100%, rgba(253,224,171,0.16) 0%, rgba(129,163,199,0.08) 40%, transparent 70%)',
  starOpacity: 0,
  mountainFar: '#2a3348',
  mountainNear: '#1c2334',
}

const DAY: DayPhase = {
  key: 'day',
  label: 'Day',
  gradient:
    'linear-gradient(160deg, #253150 0%, #35476f 30%, #55719c 55%, #86a4c4 80%, #b9cfe3 100%)',
  horizonGlow:
    'radial-gradient(120% 100% at 50% 100%, rgba(255,241,214,0.14) 0%, rgba(134,164,196,0.08) 40%, transparent 70%)',
  starOpacity: 0,
  mountainFar: '#324063',
  mountainNear: '#212c47',
}

const DUSK: DayPhase = {
  key: 'dusk',
  label: 'Dusk',
  gradient:
    'linear-gradient(160deg, #1c1830 0%, #3a2748 25%, #6b3a55 50%, #b1584f 75%, #e08a4f 100%)',
  horizonGlow:
    'radial-gradient(120% 100% at 50% 100%, rgba(249,168,133,0.30) 0%, rgba(167,139,250,0.10) 40%, transparent 70%)',
  starOpacity: 0.3,
  mountainFar: '#241a30',
  mountainNear: '#150f1e',
}

const EVENING: DayPhase = {
  key: 'evening',
  label: 'Evening',
  gradient:
    'linear-gradient(150deg, #0d0f22 0%, #1c1a35 25%, #34274a 50%, #5a3350 75%, #7a4258 100%)',
  horizonGlow:
    'radial-gradient(120% 100% at 50% 100%, rgba(244,143,177,0.20) 0%, rgba(167,139,250,0.10) 40%, transparent 70%)',
  starOpacity: 0.75,
  mountainFar: '#12101f',
  mountainNear: '#0a0814',
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

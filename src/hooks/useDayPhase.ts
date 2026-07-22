import { useEffect, useState } from 'react'
import { STATIC_PHASE, getDayPhase, hourInTimezone, type DayPhase } from '@/utils/dayPhase'

/**
 * Resolves the current sky phase for a timezone, rechecking once a minute —
 * frequent enough that phase changes land close to their real boundary
 * without redrawing anything per-frame. Returns the fixed night phase when
 * `enabled` is false, preserving the original always-dusk look.
 */
export function useDayPhase(timezone: string, enabled: boolean): DayPhase {
  const [phase, setPhase] = useState<DayPhase>(() =>
    enabled ? getDayPhase(hourInTimezone(timezone)) : STATIC_PHASE,
  )

  useEffect(() => {
    if (!enabled) {
      setPhase(STATIC_PHASE)
      return
    }
    const update = () => setPhase(getDayPhase(hourInTimezone(timezone)))
    update()
    const id = window.setInterval(update, 60_000)
    return () => window.clearInterval(id)
  }, [timezone, enabled])

  return phase
}

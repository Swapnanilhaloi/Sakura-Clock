import { useEffect, useState } from 'react'
import { getDayPhase, getManualPhase, hourInTimezone, type DayPhase } from '@/utils/dayPhase'

/**
 * Resolves the current sky phase for a timezone, rechecking once a minute —
 * frequent enough that phase changes land close to their real boundary
 * without redrawing anything per-frame. Returns `manualPhase`'s sky when
 * `enabled` is false, so the scene can still be switched between day and
 * night by hand.
 */
export function useDayPhase(
  timezone: string,
  enabled: boolean,
  manualPhase: 'day' | 'night',
): DayPhase {
  const [phase, setPhase] = useState<DayPhase>(() =>
    enabled ? getDayPhase(hourInTimezone(timezone)) : getManualPhase(manualPhase),
  )

  useEffect(() => {
    if (!enabled) {
      setPhase(getManualPhase(manualPhase))
      return
    }
    const update = () => setPhase(getDayPhase(hourInTimezone(timezone)))
    update()
    const id = window.setInterval(update, 60_000)
    return () => window.clearInterval(id)
  }, [timezone, enabled, manualPhase])

  return phase
}

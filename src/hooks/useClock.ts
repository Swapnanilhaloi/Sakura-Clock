import { useEffect, useState } from 'react'
import type { ClockData } from '@/types'
import { formatClock } from '@/utils/time'

interface Options {
  hour24: boolean
  showSeconds: boolean
  timezone: string
}

/**
 * Ticks once per second (aligned to the wall clock so the flip lands on the
 * second boundary) and returns a formatted ClockData snapshot.
 */
export function useClock(opts: Options): ClockData {
  const { hour24, showSeconds, timezone } = opts
  const [now, setNow] = useState<Date>(() => new Date())

  useEffect(() => {
    let timeoutId: number
    let intervalId: number

    const tick = () => setNow(new Date())

    // Align the first tick to the next whole second for a crisp update.
    const msToNextSecond = 1000 - (Date.now() % 1000)
    timeoutId = window.setTimeout(() => {
      tick()
      intervalId = window.setInterval(tick, 1000)
    }, msToNextSecond)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [])

  return formatClock(now, { hour24, showSeconds, timezone })
}

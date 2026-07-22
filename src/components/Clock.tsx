import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useClock } from '@/hooks/useClock'
import { useSettings } from '@/hooks/useSettings'
import { timezoneOffsetLabel } from '@/utils/time'

/**
 * The centrepiece: a large digital clock with weekday, date and timezone. Each
 * colon-separated segment animates independently so seconds flip smoothly.
 */
function ClockBase() {
  const { settings } = useSettings()
  const clock = useClock({
    hour24: settings.hour24,
    showSeconds: settings.showSeconds,
    timezone: settings.timezone,
  })

  const segments = clock.time.split(':')
  const offset = timezoneOffsetLabel(settings.timezone)
  // Responsive base size (vw) scaled by the user's clock-size multiplier.
  const fontSize = `clamp(2.75rem, ${9 * settings.clockSize}vw, ${11 * settings.clockSize}rem)`

  return (
    <motion.div
      className="flex select-none flex-col items-center text-center"
      initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Time */}
      <div
        className="flex items-end justify-center font-clock font-semibold tabular-nums leading-none text-glow"
        style={{ fontSize }}
      >
        {segments.map((seg, i) => (
          <span key={i} className="flex items-end">
            {i > 0 && (
              <motion.span
                className="mx-[0.06em] -translate-y-[0.06em] text-fg/30"
                animate={{ opacity: [0.25, 0.7, 0.25] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                :
              </motion.span>
            )}
            <SegmentFlip value={seg} />
          </span>
        ))}

        {!settings.hour24 && clock.ampm && (
          <span
            className="ml-[0.25em] mb-[0.18em] text-[0.28em] font-medium tracking-[0.35em] text-fg/50"
            style={{ color: 'var(--accent)' }}
          >
            {clock.ampm}
          </span>
        )}
      </div>

      {/* Weekday + date */}
      <motion.div
        className="mt-6 flex flex-col items-center gap-1"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <p
          className="text-lg font-medium tracking-[0.3em] text-fg/85 sm:text-2xl"
          style={{ color: 'var(--accent-soft)' }}
        >
          {clock.weekday}
        </p>
        <p className="text-sm font-light tracking-[0.2em] text-fg/55 sm:text-base">
          {clock.date}
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.7rem] font-medium tracking-widest text-fg/60 backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: 'var(--accent)' }} />
          {settings.timezone} · {offset}
        </div>
      </motion.div>
    </motion.div>
  )
}

/** Cross-fades the digits of a single time segment on change. */
const SegmentFlip = memo(function SegmentFlip({ value }: { value: string }) {
  return (
    <span className="relative inline-block overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="inline-block"
          initial={{ y: '55%', opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-55%', opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
})

export const Clock = memo(ClockBase)

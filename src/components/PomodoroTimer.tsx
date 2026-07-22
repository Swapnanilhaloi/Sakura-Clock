import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type FocusEvent,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BrainCircuit, Coffee, Minus, Pause, Play, Plus, RotateCcw, SkipForward } from 'lucide-react'
import { usePomodoro, type PomodoroMode } from '@/hooks/usePomodoro'

export interface PomodoroTimerHandle {
  /** Toggle running from an external trigger (keyboard shortcut). */
  toggle: () => void
}

const MODE_LABEL: Record<PomodoroMode, string> = {
  focus: 'Focus',
  short: 'Short break',
  long: 'Long break',
}

const RADIUS = 26
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Visible keyboard-focus ring, since none of the glass buttons have one by default. */
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950'

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** A screen-reader-friendly reading of the remaining time, e.g. "12 minutes 5 seconds". */
function formatSpoken(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  const parts: string[] = []
  if (m > 0) parts.push(`${m} minute${m === 1 ? '' : 's'}`)
  parts.push(`${s} second${s === 1 ? '' : 's'}`)
  return parts.join(' ')
}

/**
 * Floating focus-timer button, mirroring MusicPlayer's button+panel shape on
 * the opposite corner. The ring around the icon tracks session progress.
 *
 * The details panel opens on hover for mouse users, and also on keyboard
 * focus so Tab reveals it without a click. A screen-reader-only status
 * region announces session transitions without reading the countdown aloud
 * every second.
 */
export const PomodoroTimer = forwardRef<PomodoroTimerHandle>(function PomodoroTimer(_props, ref) {
  const {
    mode,
    running,
    secondsLeft,
    totalSeconds,
    sessionsCompleted,
    durations,
    toggle,
    reset,
    skip,
    setDurations,
  } = usePomodoro()

  const [hoverOpen, setHoverOpen] = useState(false)
  const [focusOpen, setFocusOpen] = useState(false)
  const open = hoverOpen || focusOpen

  const panelId = useId()
  const shouldReduceMotion = useReducedMotion()

  useImperativeHandle(ref, () => ({ toggle }))

  // Ask for notification permission the first time a session actually
  // starts, rather than immediately on load.
  useEffect(() => {
    if (running && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [running])

  // Announce session transitions for anyone not watching the screen — the
  // visible countdown itself stays outside this live region so it isn't
  // read aloud every second.
  const [announcement, setAnnouncement] = useState('')
  const prevMode = useRef(mode)
  useEffect(() => {
    if (prevMode.current !== mode) {
      setAnnouncement(
        `${MODE_LABEL[prevMode.current]} session ended. ${MODE_LABEL[mode]} started.`,
      )
      prevMode.current = mode
    }
  }, [mode])

  const handleBlur = useCallback((e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setFocusOpen(false)
    }
  }, [])

  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0
  const dashoffset = CIRCUMFERENCE * (1 - progress)
  const isBreak = mode !== 'focus'
  const panelTransition = shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }
  const ringButtonTransition = shouldReduceMotion
    ? { duration: 0 }
    : { delay: 0.9, type: 'spring' as const, stiffness: 200, damping: 18 }

  return (
    <div
      role="region"
      aria-label="Focus timer"
      className="fixed bottom-6 right-6 z-40 flex flex-row-reverse items-end gap-3"
      onMouseEnter={() => setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
      onFocus={() => setFocusOpen(true)}
      onBlur={handleBlur}
    >
      {/* Announced without reading the ticking countdown itself. */}
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      {/* Main ring button — start/pause */}
      <motion.button
        type="button"
        onClick={toggle}
        aria-label={
          running
            ? `Pause focus timer — ${formatSpoken(secondsLeft)} remaining`
            : 'Start focus timer'
        }
        className={`glass glass-hover relative grid h-14 w-14 shrink-0 place-items-center rounded-full ${FOCUS_RING}`}
        whileTap={{ scale: 0.92 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={ringButtonTransition}
      >
        <svg width="56" height="56" viewBox="0 0 56 56" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="28" cy="28" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
          <circle
            cx="28"
            cy="28"
            r={RADIUS}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
            style={{ transition: shouldReduceMotion ? 'none' : 'stroke-dashoffset 0.3s linear' }}
          />
        </svg>
        <span className="relative text-fg/70" aria-hidden="true">
          {isBreak ? <Coffee size={18} /> : <BrainCircuit size={18} />}
        </span>
      </motion.button>

      {/* Expanding session panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            className="glass flex w-72 flex-col gap-4 rounded-glass p-4"
            initial={{ opacity: 0, x: 12, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, y: 8, scale: 0.96 }}
            transition={panelTransition}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-widest text-fg/60">
                  {MODE_LABEL[mode]}
                </p>
                <p className="text-2xl font-semibold tabular-nums text-fg/90">
                  <span aria-hidden="true">{formatTime(secondsLeft)}</span>
                  <span className="sr-only">{formatSpoken(secondsLeft)} remaining</span>
                </p>
              </div>
              <SessionDots completed={sessionsCompleted} />
            </div>

            <div className="flex items-center justify-center gap-2">
              <IconButton label="Reset session" onClick={reset}>
                <RotateCcw size={15} />
              </IconButton>
              <button
                type="button"
                onClick={toggle}
                aria-label={running ? 'Pause timer' : 'Start timer'}
                className={`grid h-11 w-11 place-items-center rounded-full ${FOCUS_RING}`}
                style={{ background: 'var(--accent)', color: '#09090b' }}
              >
                {running ? (
                  <Pause size={18} fill="currentColor" />
                ) : (
                  <Play size={18} fill="currentColor" className="ml-0.5" />
                )}
              </button>
              <IconButton label="Skip to next session" onClick={skip}>
                <SkipForward size={15} />
              </IconButton>
            </div>

            <div className="space-y-2.5 border-t border-white/10 pt-3">
              <DurationRow
                id={`${panelId}-focus`}
                label="Focus"
                value={durations.focus}
                onChange={(v) => setDurations({ ...durations, focus: v })}
              />
              <DurationRow
                id={`${panelId}-short`}
                label="Short break"
                value={durations.short}
                onChange={(v) => setDurations({ ...durations, short: v })}
              />
              <DurationRow
                id={`${panelId}-long`}
                label="Long break"
                value={durations.long}
                onChange={(v) => setDurations({ ...durations, long: v })}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-full text-fg/70 transition-colors hover:bg-white/10 hover:text-fg ${FOCUS_RING}`}
    >
      {children}
    </button>
  )
}

function SessionDots({ completed }: { completed: number }) {
  const filled = completed % 4
  return (
    <div
      className="flex gap-1.5"
      title={`${completed} focus session${completed === 1 ? '' : 's'} completed`}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: i < filled ? 'var(--accent)' : 'rgba(255,255,255,0.14)' }}
        />
      ))}
    </div>
  )
}

function DurationRow({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <label htmlFor={id} className="text-fg/70">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label={`Decrease ${label} duration`}
          disabled={value <= 1}
          onClick={() => onChange(Math.max(1, value - 1))}
          className={`grid h-8 w-8 place-items-center rounded-full text-fg/60 transition-colors hover:bg-white/10 hover:text-fg disabled:pointer-events-none disabled:opacity-30 ${FOCUS_RING}`}
        >
          <Minus size={13} />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={1}
          max={90}
          step={1}
          value={value}
          onChange={(e) => {
            const n = Math.round(Number(e.target.value))
            if (!Number.isNaN(n)) onChange(Math.min(90, Math.max(1, n)))
          }}
          className={`w-12 rounded-lg border border-white/10 bg-white/[0.06] py-1 text-center tabular-nums text-fg/85 outline-none transition-colors focus:border-white/30 ${FOCUS_RING}`}
        />
        <button
          type="button"
          aria-label={`Increase ${label} duration`}
          disabled={value >= 90}
          onClick={() => onChange(Math.min(90, value + 1))}
          className={`grid h-8 w-8 place-items-center rounded-full text-fg/60 transition-colors hover:bg-white/10 hover:text-fg disabled:pointer-events-none disabled:opacity-30 ${FOCUS_RING}`}
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}

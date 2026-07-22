import { useCallback, useEffect, useRef, useState } from 'react'

export type PomodoroMode = 'focus' | 'short' | 'long'

export interface PomodoroDurations {
  focus: number
  short: number
  long: number
}

const STORAGE_KEY = 'sakura-clock:pomodoro:v1'
const SESSIONS_UNTIL_LONG_BREAK = 4

const DEFAULT_DURATIONS: PomodoroDurations = { focus: 25, short: 5, long: 15 }

function loadDurations(): PomodoroDurations {
  if (typeof window === 'undefined') return DEFAULT_DURATIONS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_DURATIONS
    const parsed = JSON.parse(raw) as { durations?: Partial<PomodoroDurations> }
    return { ...DEFAULT_DURATIONS, ...parsed.durations }
  } catch {
    return DEFAULT_DURATIONS
  }
}

function saveDurations(durations: PomodoroDurations): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ durations }))
  } catch {
    /* ignore write failures */
  }
}

/** Two-tone chime via WebAudio so completion doesn't depend on a bundled asset. */
function playChime(): void {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const now = ctx.currentTime
    ;[0, 0.18].forEach((offset, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = i === 0 ? 880 : 1174.66
      gain.gain.setValueAtTime(0, now + offset)
      gain.gain.linearRampToValueAtTime(0.2, now + offset + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.5)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + offset)
      osc.stop(now + offset + 0.55)
    })
    window.setTimeout(() => ctx.close(), 900)
  } catch {
    /* audio unavailable — silent fallback */
  }
}

function notify(mode: PomodoroMode): void {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  const body =
    mode === 'focus'
      ? 'Focus session complete — take a breather.'
      : `${mode === 'long' ? 'Long' : 'Short'} break's over — back to focus.`
  new Notification('Sakura Clock', { body, silent: true })
}

function nextMode(mode: PomodoroMode, sessionsCompleted: number): { mode: PomodoroMode; sessionsCompleted: number } {
  if (mode === 'focus') {
    const completed = sessionsCompleted + 1
    return { mode: completed % SESSIONS_UNTIL_LONG_BREAK === 0 ? 'long' : 'short', sessionsCompleted: completed }
  }
  return { mode: 'focus', sessionsCompleted }
}

export interface PomodoroState {
  mode: PomodoroMode
  running: boolean
  secondsLeft: number
  totalSeconds: number
  sessionsCompleted: number
  durations: PomodoroDurations
  start: () => void
  pause: () => void
  toggle: () => void
  reset: () => void
  skip: () => void
  setDurations: (d: PomodoroDurations) => void
}

/**
 * Focus/break timer (Pomodoro technique). Counts down from a wall-clock end
 * timestamp — like useClock — so it stays accurate through tab throttling
 * rather than drifting from repeated 1s decrements.
 */
export function usePomodoro(): PomodoroState {
  const [durations, setDurationsState] = useState<PomodoroDurations>(() => loadDurations())
  const [mode, setMode] = useState<PomodoroMode>('focus')
  const [running, setRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(() => durations.focus * 60)

  const modeRef = useRef(mode)
  const sessionsRef = useRef(sessionsCompleted)
  modeRef.current = mode
  sessionsRef.current = sessionsCompleted

  useEffect(() => saveDurations(durations), [durations])

  // Reset the clock whenever mode or its configured duration changes, but
  // only while stopped — a running countdown shouldn't jump under the user.
  useEffect(() => {
    if (!running) setSecondsLeft(durations[mode] * 60)
  }, [mode, durations, running])

  const advance = useCallback(() => {
    const { mode: next, sessionsCompleted: nextSessions } = nextMode(modeRef.current, sessionsRef.current)
    playChime()
    notify(modeRef.current)
    setRunning(false)
    setSessionsCompleted(nextSessions)
    setMode(next)
  }, [])

  useEffect(() => {
    if (!running) return
    const endAt = Date.now() + secondsLeft * 1000

    const id = window.setInterval(() => {
      const remaining = Math.round((endAt - Date.now()) / 1000)
      if (remaining <= 0) {
        window.clearInterval(id)
        setSecondsLeft(0)
        advance()
      } else {
        setSecondsLeft(remaining)
      }
    }, 250)

    return () => window.clearInterval(id)
    // secondsLeft is intentionally excluded — it's only the seed for endAt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, advance])

  const start = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])
  const toggle = useCallback(() => setRunning((r) => !r), [])

  const reset = useCallback(() => {
    setRunning(false)
    setSecondsLeft(durations[mode] * 60)
  }, [durations, mode])

  const skip = useCallback(() => {
    setRunning(false)
    const { mode: next, sessionsCompleted: nextSessions } = nextMode(modeRef.current, sessionsRef.current)
    setSessionsCompleted(nextSessions)
    setMode(next)
  }, [])

  const setDurations = useCallback((d: PomodoroDurations) => setDurationsState(d), [])

  return {
    mode,
    running,
    secondsLeft,
    totalSeconds: durations[mode] * 60,
    sessionsCompleted,
    durations,
    start,
    pause,
    toggle,
    reset,
    skip,
    setDurations,
  }
}

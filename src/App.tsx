import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleHelp, CloudRain, Expand, Settings2, Shrink } from 'lucide-react'
import { Background } from '@/components/Background'
import { Clock } from '@/components/Clock'
import { QuoteCard } from '@/components/QuoteCard'
import type { MusicPlayerHandle } from '@/components/MusicPlayer'
import { useDeviceInfo } from '@/hooks/useDeviceInfo'
import { useFps } from '@/hooks/useFps'
import { useFullscreen } from '@/hooks/useFullscreen'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSettings } from '@/hooks/useSettings'
import { hasSeenOnboarding, markOnboardingSeen } from '@/utils/storage'

// Non-critical panels are code-split so the clock paints first.
const WeatherCard = lazy(() =>
  import('@/components/WeatherCard').then((m) => ({ default: m.WeatherCard })),
)
const DeviceInfo = lazy(() =>
  import('@/components/DeviceInfo').then((m) => ({ default: m.DeviceInfo })),
)
const MusicPlayer = lazy(() =>
  import('@/components/MusicPlayer').then((m) => ({ default: m.MusicPlayer })),
)
const Settings = lazy(() =>
  import('@/components/Settings').then((m) => ({ default: m.Settings })),
)
const Onboarding = lazy(() =>
  import('@/components/Onboarding').then((m) => ({ default: m.Onboarding })),
)

export default function App() {
  const { settings, update } = useSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

  const stats = useDeviceInfo()
  const fps = useFps()

  const musicRef = useRef<MusicPlayerHandle>(null)

  useEffect(() => {
    if (!hasSeenOnboarding()) setOnboardingOpen(true)
  }, [])

  const closeOnboarding = useCallback(() => {
    markOnboardingSeen()
    setOnboardingOpen(false)
  }, [])

  const shortcuts = useMemo(
    () => ({
      f: toggleFullscreen,
      m: () => musicRef.current?.toggle(),
      s: () => setSettingsOpen((v) => !v),
      '?': () => setOnboardingOpen(true),
    }),
    [toggleFullscreen],
  )
  useKeyboardShortcuts(shortcuts)

  const toggleRain = useCallback(
    () => update('rain', !settings.rain),
    [update, settings.rain],
  )

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Background />

      {/* Top-right control dock */}
      <div className="fixed right-6 top-6 z-40 flex items-center gap-3">
        <ControlButton
          label="Toggle ambient rain"
          active={settings.rain}
          onClick={toggleRain}
        >
          <CloudRain size={18} />
        </ControlButton>
        <ControlButton label="Toggle fullscreen (F)" onClick={toggleFullscreen}>
          {isFullscreen ? <Shrink size={18} /> : <Expand size={18} />}
        </ControlButton>
        <ControlButton
          label="Open settings (S)"
          active={settingsOpen}
          onClick={() => setSettingsOpen(true)}
        >
          <Settings2 size={18} />
        </ControlButton>
        <ControlButton label="Show welcome guide (?)" onClick={() => setOnboardingOpen(true)}>
          <CircleHelp size={18} />
        </ControlButton>
      </div>

      {/*
        Weather & system panels are independent fixed-position overlays on
        large screens — like the control dock and music button — so the
        clock's centering never depends on their width. (A shared grid row
        was tried first, but at this clock size the row's content can exceed
        its container and overflow throws equal-column math off.) On small
        screens they fall back into the centered column below the clock.
      */}
      <div className="pointer-events-none fixed inset-y-0 left-0 z-20 hidden items-center pl-8 lg:flex">
        <div className="pointer-events-auto">
          <Suspense fallback={null}>
            <WeatherCard />
          </Suspense>
        </div>
      </div>
      {settings.systemPanel.visible && (
        <div className="pointer-events-none fixed inset-y-0 right-0 z-20 hidden items-center pr-8 lg:flex">
          <div className="pointer-events-auto">
            <Suspense fallback={null}>
              <DeviceInfo stats={stats} fps={fps} metrics={settings.systemPanel.metrics} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Main scene: purely the clock + quote, always dead-centre */}
      <main className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-10 px-4 py-16">
        <div className="flex flex-col items-center gap-10 lg:hidden">
          <Suspense fallback={null}>
            <WeatherCard />
          </Suspense>
        </div>

        <Clock />

        {settings.systemPanel.visible && (
          <div className="flex flex-col items-center gap-10 lg:hidden">
            <Suspense fallback={null}>
              <DeviceInfo stats={stats} fps={fps} metrics={settings.systemPanel.metrics} />
            </Suspense>
          </div>
        )}

        <QuoteCard />
      </main>

      {/* Floating music button */}
      <Suspense fallback={null}>
        <MusicPlayer ref={musicRef} />
      </Suspense>

      {/* Settings drawer */}
      <Suspense fallback={null}>
        <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </Suspense>

      {/* First-time welcome guide, reopenable via the "?" control */}
      <Suspense fallback={null}>
        <Onboarding open={onboardingOpen} onClose={closeOnboarding} />
      </Suspense>
    </div>
  )
}

function ControlButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className="glass glass-hover grid h-11 w-11 place-items-center rounded-full text-white/70"
      style={active ? { color: 'var(--accent)', borderColor: 'var(--accent)' } : undefined}
      whileTap={{ scale: 0.9 }}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={String(active)}
          initial={{ opacity: 0, rotate: -30 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 30 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

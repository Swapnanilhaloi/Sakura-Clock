import { memo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSettings } from '@/hooks/useSettings'
import { useDayPhase } from '@/hooks/useDayPhase'
import { SkyCanvas } from './SkyCanvas'

/**
 * The full ambient scene: an animated gradient sky, a glowing moon, slow
 * drifting clouds, a torii gate, and the particle canvas. The sky's colours
 * and star brightness shift through dawn/day/dusk/night on the clock's own
 * timezone (toggle via Settings → Atmosphere → Day/night cycle). Memoised so
 * clock ticks never re-render the background.
 */
function BackgroundBase() {
  const { settings } = useSettings()
  const intensity = settings.backgroundIntensity
  const phase = useDayPhase(settings.timezone, settings.dayNightCycle, settings.manualPhase)

  // Flips every text element app-wide (via html.daytime in index.css) to
  // near-black during the bright 'Day' phase, so it stays legible against
  // the pale sky — a global DOM toggle since text lives in sibling
  // components this background doesn't render.
  useEffect(() => {
    document.documentElement.classList.toggle('daytime', phase.key === 'day')
  }, [phase.key])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-ink-950">
      {/* Animated gradient sky, cross-fading between day-phase presets */}
      <div className="absolute inset-0" style={{ opacity: 0.55 + intensity * 0.45 }}>
        <AnimatePresence>
          <motion.div
            key={phase.key}
            aria-hidden
            className="absolute inset-0 animate-gradient-shift"
            style={{ backgroundImage: phase.gradient, backgroundSize: '300% 300%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: 'easeInOut' }}
          />
        </AnimatePresence>
        {/* Horizon glow, tinted per day-phase */}
        <AnimatePresence>
          <motion.div
            key={`${phase.key}-glow`}
            className="absolute inset-x-0 bottom-0 h-[45%]"
            style={{ background: phase.horizonGlow }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: 'easeInOut' }}
          />
        </AnimatePresence>
        {/* Top vignette for contrast behind the cards — faded out during the
            bright 'Day' phase, where it would just re-darken the corners
            that day-time black text relies on staying light. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 10%, transparent 40%, rgba(9,9,11,0.55) 100%)',
            opacity: phase.key === 'day' ? 0 : 1,
            transition: 'opacity 3s ease',
          }}
        />
      </div>

      {/* Moon, brightest at night and fading out through the day */}
      <Moon opacity={settings.stars ? phase.starOpacity : 0} />

      {/* Drifting clouds */}
      <Clouds intensity={intensity} />

      {/* Particle canvas: stars, particles, petals */}
      <SkyCanvas settings={settings} starOpacity={phase.starOpacity} />

      {/* Torii gate, standing alone as the scene's centerpiece */}
      <Torii />
    </div>
  )
}

const Clouds = memo(function Clouds({ intensity }: { intensity: number }) {
  const clouds = [
    { top: '12%', size: 420, blur: 40, dur: 90, delay: 0, opacity: 0.1 },
    { top: '26%', size: 300, blur: 30, dur: 70, delay: -20, opacity: 0.08 },
    { top: '40%', size: 520, blur: 55, dur: 120, delay: -60, opacity: 0.07 },
  ]
  return (
    <div aria-hidden className="absolute inset-0" style={{ opacity: intensity }}>
      {clouds.map((c, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            top: c.top,
            width: c.size,
            height: c.size * 0.45,
            filter: `blur(${c.blur}px)`,
            background:
              'radial-gradient(circle at 50% 50%, rgba(226,232,240,0.5) 0%, transparent 70%)',
            opacity: c.opacity,
          }}
          initial={{ x: '-30vw' }}
          animate={{ x: '120vw' }}
          transition={{
            duration: c.dur,
            delay: c.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
})

const Moon = memo(function Moon({ opacity }: { opacity: number }) {
  return (
    <div
      aria-hidden
      className="absolute"
      style={{
        top: '9%',
        right: '15%',
        opacity,
        transition: 'opacity 3s ease',
      }}
    >
      <div
        className="relative rounded-full"
        style={{
          width: 92,
          height: 92,
          background:
            'radial-gradient(circle at 35% 35%, #fdf6e3 0%, #e8e3d0 45%, #cfc9b8 100%)',
          boxShadow: '0 0 70px 12px rgba(253,246,227,0.22)',
        }}
      >
        {/* Craters */}
        <span
          className="absolute rounded-full"
          style={{ width: 15, height: 15, top: 22, left: 18, background: 'rgba(150,145,125,0.35)' }}
        />
        <span
          className="absolute rounded-full"
          style={{ width: 9, height: 9, top: 48, left: 50, background: 'rgba(150,145,125,0.3)' }}
        />
        <span
          className="absolute rounded-full"
          style={{ width: 6, height: 6, top: 30, left: 58, background: 'rgba(150,145,125,0.25)' }}
        />
      </div>
    </div>
  )
})

const TORII_RED = '#c1440e'
const TORII_RED_DARK = '#8f3009'
const TORII_CAP = '#241c18'

const Torii = memo(function Torii() {
  return (
    <div
      aria-hidden
      className="absolute left-1/2 bottom-0"
      style={{ transform: 'translateX(-50%)' }}
    >
      <svg
        width="220"
        height="192"
        viewBox="0 0 110 96"
        style={{ filter: 'drop-shadow(0 0 20px rgba(193,68,14,0.45))' }}
      >
        {/* Kasagi — top curved beam, with dark lacquered tips */}
        <path fill={TORII_CAP} d="M2,14 Q55,-8 108,14 L108,24 Q55,4 2,24 Z" />
        <path fill={TORII_RED} d="M9,15 Q55,-3 101,15 L101,22 Q55,7 9,22 Z" />
        {/* Shimaki — second beam beneath it */}
        <rect fill={TORII_RED} x="6" y="26" width="98" height="7" rx="1.5" />
        {/* Pillars, tapering slightly with a darker base */}
        <rect fill={TORII_RED} x="16" y="16" width="9" height="76" rx="1.5" />
        <rect fill={TORII_RED_DARK} x="15" y="80" width="11" height="12" rx="1" />
        <rect fill={TORII_RED} x="85" y="16" width="9" height="76" rx="1.5" />
        <rect fill={TORII_RED_DARK} x="84" y="80" width="11" height="12" rx="1" />
        {/* Nuki — tie beam */}
        <rect fill={TORII_RED} x="10" y="46" width="90" height="6" rx="1.5" />
        {/* Gakuzuka — central support, in the dark lacquer tone */}
        <rect fill={TORII_CAP} x="50" y="24" width="10" height="16" />
      </svg>
    </div>
  )
})

export const Background = memo(BackgroundBase)

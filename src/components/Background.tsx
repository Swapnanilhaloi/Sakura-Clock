import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSettings } from '@/hooks/useSettings'
import { useMousePosition } from '@/hooks/useMousePosition'
import { useDayPhase } from '@/hooks/useDayPhase'
import { SkyCanvas } from './SkyCanvas'

/**
 * The full ambient scene: an animated gradient sky, slow drifting clouds, a
 * layered mountain silhouette, and the particle canvas — all shifted gently by
 * the pointer for a parallax depth effect. The sky's colours and star
 * brightness shift through dawn/day/dusk/night on the clock's own timezone
 * (toggle via Settings → Atmosphere → Day/night cycle). Memoised so clock
 * ticks never re-render the background.
 */
function BackgroundBase() {
  const { settings } = useSettings()
  const parallax = useMousePosition(true)
  const intensity = settings.backgroundIntensity
  const phase = useDayPhase(settings.timezone, settings.dayNightCycle)

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
        {/* Top vignette for contrast behind the cards */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 10%, transparent 40%, rgba(9,9,11,0.55) 100%)',
          }}
        />
      </div>

      {/* Drifting clouds */}
      <Clouds parallaxX={parallax.x} intensity={intensity} />

      {/* Particle canvas: stars, particles, petals, rain */}
      <SkyCanvas
        settings={settings}
        parallaxX={parallax.x}
        parallaxY={parallax.y}
        starOpacity={phase.starOpacity}
      />

      {/* Mountain silhouettes, tinted per day-phase */}
      <Mountains
        parallaxX={parallax.x}
        parallaxY={parallax.y}
        far={phase.mountainFar}
        near={phase.mountainNear}
      />
    </div>
  )
}

const Clouds = memo(function Clouds({
  parallaxX,
  intensity,
}: {
  parallaxX: number
  intensity: number
}) {
  const clouds = [
    { top: '12%', size: 420, blur: 40, dur: 90, delay: 0, opacity: 0.1 },
    { top: '26%', size: 300, blur: 30, dur: 70, delay: -20, opacity: 0.08 },
    { top: '40%', size: 520, blur: 55, dur: 120, delay: -60, opacity: 0.07 },
  ]
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{ transform: `translateX(${parallaxX * -10}px)`, opacity: intensity }}
    >
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

const Mountains = memo(function Mountains({
  parallaxX,
  parallaxY,
  far,
  near,
}: {
  parallaxX: number
  parallaxY: number
  far: string
  near: string
}) {
  return (
    <div aria-hidden className="absolute inset-x-0 bottom-0">
      {/* Far range */}
      <svg
        className="absolute bottom-0 w-full"
        style={{ transform: `translate(${parallaxX * 8}px, ${parallaxY * 4}px)` }}
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        height="320"
      >
        <path
          style={{ fill: far, fillOpacity: 0.9, transition: 'fill 3s ease' }}
          d="M0,220 L180,140 L360,210 L560,110 L760,200 L980,120 L1180,205 L1440,150 L1440,320 L0,320 Z"
        />
      </svg>
      {/* Near range */}
      <svg
        className="absolute bottom-0 w-full"
        style={{ transform: `translate(${parallaxX * 16}px, ${parallaxY * 7}px)` }}
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        height="240"
      >
        <path
          style={{ fill: near, transition: 'fill 3s ease' }}
          d="M0,180 L220,90 L430,175 L680,70 L920,170 L1160,95 L1440,180 L1440,240 L0,240 Z"
        />
      </svg>
    </div>
  )
})

export const Background = memo(BackgroundBase)

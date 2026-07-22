import { memo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSettings } from '@/hooks/useSettings'
import { useMousePosition } from '@/hooks/useMousePosition'
import { useDayPhase } from '@/hooks/useDayPhase'
import { SkyCanvas } from './SkyCanvas'

/**
 * The full ambient scene: an animated gradient sky, a glowing moon, slow
 * drifting clouds and bird flocks, a layered mountain silhouette with a pine
 * treeline and torii gate, and the particle canvas — all shifted gently by
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
      <Moon
        opacity={settings.stars ? phase.starOpacity : 0}
        parallaxX={parallax.x}
        parallaxY={parallax.y}
      />

      {/* Drifting clouds */}
      <Clouds parallaxX={parallax.x} intensity={intensity} />

      {/* Distant bird flocks crossing the sky */}
      <BirdFlock parallaxX={parallax.x} />

      {/* Particle canvas: stars, particles, petals */}
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

      {/* Pine treeline, a shade darker than the near range for depth */}
      <Forest parallaxX={parallax.x} parallaxY={parallax.y} tint={darken(phase.mountainNear, 0.35)} />

      {/* Torii gate standing at the treeline */}
      <Torii parallaxX={parallax.x} parallaxY={parallax.y} tint={phase.mountainNear} />
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

const Moon = memo(function Moon({
  opacity,
  parallaxX,
  parallaxY,
}: {
  opacity: number
  parallaxX: number
  parallaxY: number
}) {
  return (
    <div
      aria-hidden
      className="absolute"
      style={{
        top: '9%',
        right: '15%',
        opacity,
        transition: 'opacity 3s ease',
        transform: `translate(${parallaxX * 10}px, ${parallaxY * 6}px)`,
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

const BIRD_FLOCKS = [
  { top: '17%', scale: 1, dur: 36, delay: 3 },
  { top: '27%', scale: 0.7, dur: 46, delay: 22 },
]

const BirdFlock = memo(function BirdFlock({ parallaxX }: { parallaxX: number }) {
  return (
    <div aria-hidden className="absolute inset-0" style={{ transform: `translateX(${parallaxX * -4}px)` }}>
      {BIRD_FLOCKS.map((f, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: f.top, opacity: 0.4 }}
          initial={{ x: '-10vw' }}
          animate={{ x: '110vw' }}
          transition={{
            duration: f.dur,
            delay: f.delay,
            repeat: Infinity,
            repeatDelay: 16,
            ease: 'easeInOut',
          }}
        >
          <svg width={40 * f.scale} height={16 * f.scale} viewBox="0 0 40 16" fill="none">
            {[0, 12, 24].map((dx, j) => (
              <motion.path
                key={j}
                d={`M${dx},8 Q${dx + 4},2 ${dx + 8},8 Q${dx + 12},2 ${dx + 16},8`}
                stroke="rgba(226,232,240,0.7)"
                strokeWidth="1.4"
                strokeLinecap="round"
                animate={{ scaleY: [1, 0.4, 1] }}
                transition={{ duration: 0.5 + j * 0.06, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: `${dx + 8}px 8px` }}
              />
            ))}
          </svg>
        </motion.div>
      ))}
    </div>
  )
})

/** Deterministic pseudo-random in [0,1) so the treeline is stable across renders. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

interface TreeSpec {
  x: number
  h: number
  w: number
}

const TREE_COUNT = 46
const TREES: TreeSpec[] = Array.from({ length: TREE_COUNT }, (_, i) => {
  const r = pseudoRandom(i)
  return {
    x: (i / TREE_COUNT) * 1440 + (r - 0.5) * 24,
    h: 30 + r * 46,
    w: 16 + r * 10,
  }
})

/** A simple three-tier evergreen silhouette, tip at (x, base - h). */
function pinePath(x: number, h: number, w: number): string {
  const base = 96
  return [
    `M${x},${base}`,
    `L${x - w * 0.5},${base - h * 0.32} L${x - w * 0.22},${base - h * 0.32}`,
    `L${x - w * 0.42},${base - h * 0.62} L${x - w * 0.16},${base - h * 0.62}`,
    `L${x},${base - h}`,
    `L${x + w * 0.16},${base - h * 0.62} L${x + w * 0.42},${base - h * 0.62}`,
    `L${x + w * 0.22},${base - h * 0.32} L${x + w * 0.5},${base - h * 0.32} Z`,
  ].join(' ')
}

const Forest = memo(function Forest({
  parallaxX,
  parallaxY,
  tint,
}: {
  parallaxX: number
  parallaxY: number
  tint: string
}) {
  return (
    <svg
      aria-hidden
      className="absolute bottom-0 w-full"
      style={{ transform: `translate(${parallaxX * 20}px, ${parallaxY * 8}px)` }}
      viewBox="0 0 1440 96"
      preserveAspectRatio="none"
      height="96"
    >
      <g style={{ fill: tint, transition: 'fill 3s ease' }}>
        {TREES.map((t, i) => (
          <path key={i} d={pinePath(t.x, t.h, t.w)} />
        ))}
      </g>
    </svg>
  )
})

const Torii = memo(function Torii({
  parallaxX,
  parallaxY,
  tint,
}: {
  parallaxX: number
  parallaxY: number
  tint: string
}) {
  return (
    <div
      aria-hidden
      className="absolute"
      style={{
        bottom: '2%',
        right: '14%',
        transform: `translate(${parallaxX * 16}px, ${parallaxY * 7}px)`,
      }}
    >
      <svg
        width="110"
        height="96"
        viewBox="0 0 110 96"
        style={{ filter: 'drop-shadow(0 0 14px var(--accent-soft))', opacity: 0.85 }}
      >
        <g style={{ fill: tint, transition: 'fill 3s ease' }}>
          {/* Kasagi — top curved beam */}
          <path d="M2,14 Q55,-8 108,14 L108,24 Q55,4 2,24 Z" />
          {/* Shimaki — second beam beneath it */}
          <rect x="6" y="26" width="98" height="7" rx="1.5" />
          {/* Pillars */}
          <rect x="16" y="16" width="9" height="76" rx="1.5" />
          <rect x="85" y="16" width="9" height="76" rx="1.5" />
          {/* Nuki — tie beam */}
          <rect x="10" y="46" width="90" height="6" rx="1.5" />
          {/* Gakuzuka — central support */}
          <rect x="50" y="24" width="10" height="16" />
        </g>
      </svg>
    </div>
  )
})

/** Mixes a #rrggbb colour toward black by `amount` (0–1). */
function darken(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const r = Math.round(parseInt(h.slice(0, 2), 16) * (1 - amount))
  const g = Math.round(parseInt(h.slice(2, 4), 16) * (1 - amount))
  const b = Math.round(parseInt(h.slice(4, 6), 16) * (1 - amount))
  return `rgb(${r}, ${g}, ${b})`
}

export const Background = memo(BackgroundBase)

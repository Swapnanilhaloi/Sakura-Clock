import { useEffect, useRef } from 'react'
import type { Settings } from '@/types'
import { getAccent } from '@/utils/constants'

interface SkyCanvasProps {
  settings: Pick<Settings, 'sakura' | 'stars' | 'particleAmount' | 'accent'>
  /** Star brightness multiplier from the current day-phase, 0–1. */
  starOpacity: number
}

interface Star {
  x: number
  y: number
  r: number
  phase: number
  speed: number
}
interface Particle {
  x: number
  y: number
  r: number
  vy: number
  drift: number
  phase: number
  alpha: number
}
interface Petal {
  /** Anchor x — the centre the petal drifts around as it sways, not its drawn position. */
  x: number
  y: number
  size: number
  vy: number
  sway: number
  swaySpeed: number
  /** Per-petal phase offset so sways and tumbles don't all sync up. */
  phase: number
  angle: number
  spin: number
  tone: number
}

/**
 * A single-canvas particle engine. Stars, glowing particles and sakura petals
 * all share one requestAnimationFrame loop so the whole ambience costs one
 * draw pass per frame. Live settings flow in through a ref, which means the
 * loop is created once and never torn down on prop changes.
 */
export function SkyCanvas({ settings, starOpacity }: SkyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const live = useRef({ settings, starOpacity })
  live.current = { settings, starOpacity }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = 1

    let stars: Star[] = []
    let particles: Particle[] = []
    let petals: Petal[] = []

    const rand = (min: number, max: number) => min + Math.random() * (max - min)

    const buildStars = () => {
      const count = Math.round((width * height) / 9000)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.7,
        r: rand(0.4, 1.4),
        phase: Math.random() * Math.PI * 2,
        speed: rand(0.4, 1.2),
      }))
    }

    const buildParticles = () => {
      const amt = live.current.settings.particleAmount
      const count = Math.round(((width * height) / 26000) * (0.3 + amt))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: rand(0.6, 2),
        vy: rand(0.05, 0.25),
        drift: rand(0.2, 0.7),
        phase: Math.random() * Math.PI * 2,
        alpha: rand(0.15, 0.6),
      }))
    }

    const buildPetals = () => {
      const amt = live.current.settings.particleAmount
      const count = Math.round(((width * height) / 32000) * (0.4 + amt))
      // Spawn already spread through the visible band (plus a little above,
      // to feed the fall) so the scene reads as populated immediately
      // instead of every petal starting off-screen and trickling in.
      petals = Array.from({ length: count }, () => makePetal(rand(-height * 0.3, height)))
    }

    const makePetal = (startY: number): Petal => ({
      x: Math.random() * width,
      y: startY,
      size: rand(10, 20),
      vy: rand(0.5, 1.3),
      sway: rand(20, 55),
      swaySpeed: rand(0.6, 1.4),
      phase: Math.random() * Math.PI * 2,
      angle: Math.random() * Math.PI * 2,
      spin: rand(-0.03, 0.03),
      tone: Math.random(),
    })

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildStars()
      buildParticles()
      buildPetals()
    }

    resize()
    window.addEventListener('resize', resize)

    // Rebuild density-dependent fields when the particle knob moves, without
    // tearing down the animation loop.
    const rebuild = () => {
      buildParticles()
      buildPetals()
    }
    canvas.addEventListener('rebuild', rebuild)

    let raf = 0
    let t = 0

    const draw = () => {
      const { settings: s, starOpacity: starOp } = live.current
      t += reduce ? 0 : 1
      const accent = getAccent(s.accent)

      ctx.clearRect(0, 0, width, height)

      // --- Stars ------------------------------------------------------------
      if (s.stars && starOp > 0.01) {
        for (const st of stars) {
          const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.02 * st.speed + st.phase))
          ctx.beginPath()
          ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(226, 232, 240, ${tw * starOp})`
          ctx.fill()
        }
      }

      // --- Glowing particles ------------------------------------------------
      if (particles.length) {
        for (const p of particles) {
          if (!reduce) {
            p.y -= p.vy
            p.x += Math.sin(t * 0.01 + p.phase) * p.drift * 0.4
            if (p.y < -4) {
              p.y = height + 4
              p.x = Math.random() * width
            }
          }
          const a = p.alpha * (0.6 + 0.4 * Math.sin(t * 0.03 + p.phase))
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = hexToRgba(accent.soft, Math.max(0, a))
          ctx.shadowBlur = 8
          ctx.shadowColor = accent.value
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      // --- Sakura petals ----------------------------------------------------
      if (s.sakura) {
        for (const pet of petals) {
          if (!reduce) {
            // Flutter the fall speed a little instead of a constant drop —
            // real petals catch air and speed up/slow down as they turn.
            pet.y += pet.vy * (0.75 + 0.35 * Math.sin(t * 0.03 * pet.swaySpeed + pet.phase))
            pet.angle += pet.spin
            if (pet.y > height + 20) Object.assign(pet, makePetal(-20))
          }
          // Sway around the anchor x (pet.x) by its own amplitude/speed,
          // rather than moving the anchor itself — keeps drift bounded.
          const swayX = Math.sin(t * 0.015 * pet.swaySpeed + pet.phase) * pet.sway
          // Squash vertically in sync with rotation for a tumbling,
          // edge-on-then-face-on flip as the petal spins through the fall.
          const tumble = 0.55 + 0.45 * Math.cos(pet.angle * 2)
          drawPetal(ctx, pet, swayX, tumble)
        }
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('rebuild', rebuild)
    }
    // Loop is intentionally created once; live data flows via the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Rebuild particle/petal counts when their density knob changes.
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) canvas.dispatchEvent(new Event('rebuild'))
  }, [settings.particleAmount])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}

/** Draw a five-petal-ish soft sakura shape as two mirrored bezier lobes. */
function drawPetal(ctx: CanvasRenderingContext2D, p: Petal, swayX: number, tumble = 1) {
  const tones = [
    ['#F9A8D4', '#F472B6'],
    ['#FBCFE8', '#F9A8D4'],
    ['#FDE2F0', '#FBCFE8'],
  ] as const
  const [c1, c2] = tones[Math.floor(p.tone * tones.length) % tones.length]

  ctx.save()
  ctx.translate(p.x + swayX, p.y)
  ctx.rotate(p.angle)
  ctx.scale(1, tumble)
  const s = p.size
  const grad = ctx.createLinearGradient(0, -s, 0, s)
  grad.addColorStop(0, hexToRgba(c1, 0.95))
  grad.addColorStop(1, hexToRgba(c2, 0.8))
  ctx.fillStyle = grad
  ctx.beginPath()
  // A single soft petal lobe.
  ctx.moveTo(0, -s * 0.5)
  ctx.bezierCurveTo(s * 0.5, -s * 0.5, s * 0.5, s * 0.5, 0, s * 0.6)
  ctx.bezierCurveTo(-s * 0.5, s * 0.5, -s * 0.5, -s * 0.5, 0, -s * 0.5)
  ctx.fill()
  ctx.restore()
}

/** Convert #rrggbb to an rgba() string with the given alpha. */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

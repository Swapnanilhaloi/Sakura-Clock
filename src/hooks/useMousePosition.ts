import { useEffect, useState } from 'react'

export interface Parallax {
  /** Normalised pointer offset from centre, roughly -1 … 1 on each axis. */
  x: number
  y: number
}

/**
 * Tracks the pointer as a normalised offset from the viewport centre, smoothed
 * via requestAnimationFrame so consumers get a gentle, jitter-free parallax.
 */
export function useMousePosition(enabled = true): Parallax {
  const [pos, setPos] = useState<Parallax>({ x: 0, y: 0 })

  useEffect(() => {
    if (!enabled) {
      setPos({ x: 0, y: 0 })
      return
    }

    let targetX = 0
    let targetY = 0
    let curX = 0
    let curY = 0
    let raf = 0

    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2
      targetY = (e.clientY / window.innerHeight - 0.5) * 2
    }

    const loop = () => {
      // Exponential smoothing toward the target.
      curX += (targetX - curX) * 0.06
      curY += (targetY - curY) * 0.06
      setPos({ x: curX, y: curY })
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  return pos
}

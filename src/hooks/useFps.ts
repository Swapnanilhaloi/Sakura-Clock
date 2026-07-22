import { useEffect, useRef, useState } from 'react'

/**
 * Rolling FPS estimate driven by requestAnimationFrame. Updates the exposed
 * value at most ~2×/second to avoid churning React on every frame.
 */
export function useFps(): number {
  const [fps, setFps] = useState(60)
  const frames = useRef(0)
  const last = useRef(performance.now())
  const raf = useRef(0)

  useEffect(() => {
    const loop = (t: number) => {
      frames.current += 1
      const elapsed = t - last.current
      if (elapsed >= 500) {
        setFps(Math.round((frames.current * 1000) / elapsed))
        frames.current = 0
        last.current = t
      }
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  return fps
}

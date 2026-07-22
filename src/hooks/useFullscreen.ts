import { useCallback, useEffect, useState } from 'react'

/** Fullscreen toggle with reactive state that stays in sync with the API. */
export function useFullscreen(): { isFullscreen: boolean; toggle: () => void } {
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== 'undefined' && !!document.fullscreenElement,
  )

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {})
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {})
    }
  }, [])

  return { isFullscreen, toggle }
}

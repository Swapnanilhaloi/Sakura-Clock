import { useEffect, useState } from 'react'

export interface GeolocationState {
  status: 'idle' | 'loading' | 'success' | 'error'
  coords: { lat: number; lon: number } | null
}

/**
 * Requests the browser's geolocation once on mount. Silent by design — no
 * retry UI and no error surfaced to the user; callers should fall back to a
 * sensible default (e.g. mock weather) when status lands on 'error', which
 * covers unsupported browsers, denied permission, and timeouts alike.
 */
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({ status: 'idle', coords: null })

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState({ status: 'error', coords: null })
      return
    }

    let cancelled = false
    setState({ status: 'loading', coords: null })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return
        setState({
          status: 'success',
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
        })
      },
      () => {
        if (cancelled) return
        setState({ status: 'error', coords: null })
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 },
    )

    return () => {
      cancelled = true
    }
  }, [])

  return state
}

import { useEffect, useMemo, useState } from 'react'
import type { DeviceStats } from '@/types'
import { detectBrowser, detectDeviceType, detectOS } from '@/utils/device'

/**
 * Collects live device stats: battery level (where the Battery Status API is
 * available), online/offline state, screen resolution, and parsed UA labels.
 */
export function useDeviceInfo(): DeviceStats {
  const [battery, setBattery] = useState<number | null>(null)
  const [charging, setCharging] = useState(false)
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )
  const [resolution, setResolution] = useState(
    typeof window !== 'undefined' ? `${window.screen.width} × ${window.screen.height}` : '—',
  )

  // Static, UA-derived labels only need to be computed once.
  const staticInfo = useMemo(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    return {
      browser: detectBrowser(ua),
      os: detectOS(ua),
      deviceType: detectDeviceType(ua),
    }
  }, [])

  // Online / offline.
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  // Resolution (handles multi-monitor drag / DPI changes).
  useEffect(() => {
    const update = () => setResolution(`${window.screen.width} × ${window.screen.height}`)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Battery Status API (Chromium only; gracefully absent elsewhere).
  useEffect(() => {
    let mounted = true
    let mgr: BatteryManager | null = null

    const sync = () => {
      if (!mgr || !mounted) return
      setBattery(Math.round(mgr.level * 100))
      setCharging(mgr.charging)
    }

    navigator.getBattery?.().then((b) => {
      if (!mounted) return
      mgr = b
      sync()
      b.addEventListener('levelchange', sync)
      b.addEventListener('chargingchange', sync)
    })

    return () => {
      mounted = false
      if (mgr) {
        mgr.removeEventListener('levelchange', sync)
        mgr.removeEventListener('chargingchange', sync)
      }
    }
  }, [])

  return { battery, charging, online, resolution, ...staticInfo }
}

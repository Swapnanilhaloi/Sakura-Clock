import { useEffect, useState } from 'react'
import type { WeatherData } from '@/types'
import { fetchWeather, MOCK_WEATHER } from '@/utils/weather'
import { useGeolocation } from './useGeolocation'

/**
 * Live weather for the user's current GPS location. Stays on a fixed mock
 * payload until location + a successful fetch both land, and quietly keeps
 * showing the last good value (mock or live) if the network request fails —
 * there's no error state in this UI, just a graceful hold.
 */
export function useWeather(): WeatherData {
  const { status, coords } = useGeolocation()
  const [weather, setWeather] = useState<WeatherData>(MOCK_WEATHER)

  useEffect(() => {
    if (status !== 'success' || !coords) return

    const controller = new AbortController()
    fetchWeather(coords, controller.signal)
      .then(setWeather)
      .catch(() => {
        // Network hiccup or blocked request — keep whatever was showing.
      })

    return () => controller.abort()
  }, [status, coords])

  return weather
}

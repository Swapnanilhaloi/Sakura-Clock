import type { WeatherData } from '@/types'

/**
 * Mock weather payload. Shaped to loosely mirror an OpenWeather response so
 * swapping in a live API later is a small change (see fetchWeather stub below).
 */
export const MOCK_WEATHER: WeatherData = {
  location: 'Kolkata, IN',
  condition: 'Light rain',
  icon: 'rain',
  temperature: 24,
  feelsLike: 26,
  humidity: 82,
  windSpeed: 11,
  sunrise: '05:12',
  sunset: '18:24',
}

/**
 * Placeholder for a live integration. Wire up an OpenWeather key and flip the
 * consumer to await this instead of returning the mock. Left intentionally
 * unused so the app runs fully offline out of the box.
 *
 * @example
 *   const w = await fetchWeather({ lat: 22.57, lon: 88.36, apiKey: KEY })
 */
export async function fetchWeather(params: {
  lat: number
  lon: number
  apiKey: string
  units?: 'metric' | 'imperial'
}): Promise<WeatherData> {
  const { lat, lon, apiKey, units = 'metric' } = params
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Weather request failed: ${res.status}`)
  const d = await res.json()

  const time = (unix: number) =>
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(unix * 1000))

  const main: string = d.weather?.[0]?.main ?? 'Clear'
  const iconMap: Record<string, WeatherData['icon']> = {
    Clear: 'clear',
    Clouds: 'cloudy',
    Rain: 'rain',
    Drizzle: 'rain',
    Thunderstorm: 'rain',
  }

  return {
    location: `${d.name}, ${d.sys?.country ?? ''}`,
    condition: d.weather?.[0]?.description ?? main,
    icon: iconMap[main] ?? 'partly',
    temperature: Math.round(d.main?.temp ?? 0),
    feelsLike: Math.round(d.main?.feels_like ?? 0),
    humidity: d.main?.humidity ?? 0,
    windSpeed: Math.round((d.wind?.speed ?? 0) * 3.6),
    sunrise: time(d.sys?.sunrise ?? 0),
    sunset: time(d.sys?.sunset ?? 0),
  }
}

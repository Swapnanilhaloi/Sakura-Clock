import type { WeatherData } from '@/types'

/** Fallback payload shown before GPS location resolves, or if it's unavailable. */
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

interface Coordinates {
  lat: number
  lon: number
}

/** WMO weather codes (Open-Meteo's `weather_code`) collapsed to our icon set. */
const WEATHER_CODE_MAP: Record<number, { icon: WeatherData['icon']; condition: string }> = {
  0: { icon: 'clear', condition: 'Clear sky' },
  1: { icon: 'partly', condition: 'Mainly clear' },
  2: { icon: 'partly', condition: 'Partly cloudy' },
  3: { icon: 'cloudy', condition: 'Overcast' },
  45: { icon: 'cloudy', condition: 'Fog' },
  48: { icon: 'cloudy', condition: 'Depositing rime fog' },
  51: { icon: 'rain', condition: 'Light drizzle' },
  53: { icon: 'rain', condition: 'Drizzle' },
  55: { icon: 'rain', condition: 'Dense drizzle' },
  61: { icon: 'rain', condition: 'Slight rain' },
  63: { icon: 'rain', condition: 'Rain' },
  65: { icon: 'rain', condition: 'Heavy rain' },
  71: { icon: 'cloudy', condition: 'Slight snow' },
  73: { icon: 'cloudy', condition: 'Snow' },
  75: { icon: 'cloudy', condition: 'Heavy snow' },
  80: { icon: 'rain', condition: 'Rain showers' },
  81: { icon: 'rain', condition: 'Rain showers' },
  82: { icon: 'rain', condition: 'Violent rain showers' },
  95: { icon: 'rain', condition: 'Thunderstorm' },
  96: { icon: 'rain', condition: 'Thunderstorm with hail' },
  99: { icon: 'rain', condition: 'Thunderstorm with hail' },
}

function describeWeatherCode(code: number, isDay: boolean): { icon: WeatherData['icon']; condition: string } {
  const entry = WEATHER_CODE_MAP[code] ?? { icon: 'partly', condition: 'Unsettled' }
  // Open-Meteo doesn't have a distinct "clear night" code — swap the icon
  // ourselves so a cloudless midnight doesn't show a sun.
  if (!isDay && (entry.icon === 'clear' || entry.icon === 'partly')) {
    return { icon: 'night', condition: entry.condition }
  }
  return entry
}

/** Best-effort "City, Country" label for a coordinate pair — no API key required. */
async function reverseGeocode({ lat, lon }: Coordinates, signal?: AbortSignal): Promise<string | null> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    const res = await fetch(url, { signal })
    if (!res.ok) return null
    const d = await res.json()
    const city: string | undefined = d.city || d.locality || d.principalSubdivision
    const country: string | undefined = d.countryCode
    if (!city) return null
    return country ? `${city}, ${country}` : city
  } catch {
    return null
  }
}

/**
 * Live current weather for a coordinate pair via Open-Meteo — free and
 * keyless, unlike OpenWeather. Paired with a reverse-geocode lookup for the
 * location label; either can fail independently without breaking the other.
 */
export async function fetchWeather(
  { lat, lon }: Coordinates,
  signal?: AbortSignal,
): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day` +
    `&daily=sunrise,sunset&timezone=auto`

  const [payload, location] = await Promise.all([
    fetch(url, { signal }).then((res) => {
      if (!res.ok) throw new Error(`Weather request failed: ${res.status}`)
      return res.json()
    }),
    reverseGeocode({ lat, lon }, signal),
  ])

  // Open-Meteo returns local ISO strings like "2026-07-22T05:32" for the
  // requested location (via timezone=auto) — the "HH:MM" tail is exactly
  // what the UI wants, no Date parsing/timezone juggling needed.
  const time = (iso: string | undefined) => iso?.split('T')[1] ?? '—'

  const { icon, condition } = describeWeatherCode(
    payload.current?.weather_code ?? 0,
    payload.current?.is_day !== 0,
  )

  return {
    location: location ?? MOCK_WEATHER.location,
    condition,
    icon,
    temperature: Math.round(payload.current?.temperature_2m ?? 0),
    feelsLike: Math.round(payload.current?.apparent_temperature ?? 0),
    humidity: Math.round(payload.current?.relative_humidity_2m ?? 0),
    windSpeed: Math.round(payload.current?.wind_speed_10m ?? 0),
    sunrise: time(payload.daily?.sunrise?.[0]),
    sunset: time(payload.daily?.sunset?.[0]),
  }
}

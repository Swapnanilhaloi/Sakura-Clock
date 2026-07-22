/**
 * Shared application types.
 */

export type AccentKey = 'violet' | 'sky' | 'pink' | 'mint' | 'amber'

export interface AccentOption {
  key: AccentKey
  label: string
  /** Primary accent colour (hex). */
  value: string
  /** Secondary tone used for gradients / glows. */
  soft: string
}

export interface Settings {
  /** Use 24-hour formatting when true, otherwise 12-hour with AM/PM. */
  hour24: boolean
  /** Render the seconds segment on the clock. */
  showSeconds: boolean
  /** Selected accent colour key. */
  accent: AccentKey
  /** Background brightness / opacity multiplier, 0–1. */
  backgroundIntensity: number
  /** Density multiplier for particles & petals, 0–1. */
  particleAmount: number
  /** Clock font size multiplier, roughly 0.6–1.6. */
  clockSize: number
  /** Toggle falling sakura petals. */
  sakura: boolean
  /** Toggle the animated star field. */
  stars: boolean
  /** IANA timezone id used for the clock. */
  timezone: string
  /** What the floating music player streams. */
  music: MusicSource
  /** Shift the sky's colours through dawn/day/dusk/night based on the clock's timezone. */
  dayNightCycle: boolean
}

/** A YouTube playlist or single video the music player streams from. */
export interface MusicSource {
  type: 'playlist' | 'video'
  /** Playlist id (e.g. "UU…", "PL…") or an 11-character video id. */
  id: string
  /** Friendly label shown in Settings; falls back to the id when absent. */
  label?: string
}

export interface ClockData {
  time: string
  weekday: string
  date: string
  ampm: string
  timezone: string
}

export interface WeatherData {
  location: string
  condition: string
  icon: WeatherIcon
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  sunrise: string
  sunset: string
}

export type WeatherIcon = 'clear' | 'cloudy' | 'rain' | 'partly' | 'night'

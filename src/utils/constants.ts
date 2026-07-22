import type { AccentKey, AccentOption, MusicSource, Settings } from '@/types'

/** Selectable accent colours. Kept muted per the "no bright colors" brief. */
export const ACCENTS: AccentOption[] = [
  { key: 'violet', label: 'Twilight', value: '#A78BFA', soft: '#C4B5FD' },
  { key: 'sky', label: 'Rainfall', value: '#7DD3FC', soft: '#BAE6FD' },
  { key: 'pink', label: 'Sakura', value: '#F9A8D4', soft: '#FBCFE8' },
  { key: 'mint', label: 'Meadow', value: '#6EE7B7', soft: '#A7F3D0' },
  { key: 'amber', label: 'Lantern', value: '#FCD34D', soft: '#FDE68A' },
]

export const ACCENT_MAP: Record<AccentKey, AccentOption> = ACCENTS.reduce(
  (acc, a) => ({ ...acc, [a.key]: a }),
  {} as Record<AccentKey, AccentOption>,
)

export function getAccent(key: AccentKey): AccentOption {
  return ACCENT_MAP[key] ?? ACCENTS[0]
}

export const DEFAULT_TIMEZONE = 'Asia/Kolkata'

/**
 * "All uploads" playlist for the SAKURA RONIN YouTube channel
 * (channel id UCfXI8o8dYcdIN2J1nXwS0xw → uploads playlist UU…), streamed live
 * via the YouTube IFrame Player API. Nothing is downloaded or rehosted.
 */
export const DEFAULT_MUSIC_SOURCE: MusicSource = {
  type: 'playlist',
  id: 'UUfXI8o8dYcdIN2J1nXwS0xw',
  label: 'SAKURA RONIN — Lofi',
}

/**
 * Quick-pick music sources offered in Settings, alongside pasting a custom
 * link. Each is a channel's "all uploads" playlist (channel id with its
 * leading UC swapped for UU).
 */
export const MUSIC_PRESETS: MusicSource[] = [
  DEFAULT_MUSIC_SOURCE,
  {
    type: 'playlist',
    id: 'UUf20FXp1sQHap63XFiIZtdw',
    label: 'Sakura Reggae',
  },
]

export const DEFAULT_SETTINGS: Settings = {
  hour24: true,
  showSeconds: false,
  accent: 'violet',
  backgroundIntensity: 0.9,
  particleAmount: 0.7,
  clockSize: 1,
  sakura: true,
  stars: true,
  timezone: DEFAULT_TIMEZONE,
  music: DEFAULT_MUSIC_SOURCE,
  dayNightCycle: true,
}

export const STORAGE_KEY = 'sakura-clock:settings:v1'

/** A curated list of common IANA timezones for the settings picker. */
export const TIMEZONES: string[] = [
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Dubai',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC',
]

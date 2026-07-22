import type { Settings } from '@/types'
import { DEFAULT_SETTINGS, STORAGE_KEY } from './constants'

const ONBOARDING_KEY = 'sakura-clock:onboarded:v1'

/** Read persisted settings, merging over defaults so new keys are safe. */
export function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<Settings>
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

/** Persist settings; failures (private mode, quota) are swallowed. */
export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    /* ignore write failures */
  }
}

/** Whether the first-time welcome guide has already been dismissed. */
export function hasSeenOnboarding(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(ONBOARDING_KEY) === '1'
  } catch {
    return true
  }
}

export function markOnboardingSeen(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ONBOARDING_KEY, '1')
  } catch {
    /* ignore write failures */
  }
}

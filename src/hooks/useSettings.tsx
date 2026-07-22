import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Settings } from '@/types'
import { DEFAULT_SETTINGS, getAccent } from '@/utils/constants'
import { loadSettings, saveSettings } from '@/utils/storage'

interface SettingsContextValue {
  settings: Settings
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  reset: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings())

  // Persist on every change.
  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  // Reflect the accent into CSS custom properties so plain CSS + Tailwind
  // arbitrary values can consume it (var(--accent)).
  useEffect(() => {
    const accent = getAccent(settings.accent)
    const root = document.documentElement
    root.style.setProperty('--accent', accent.value)
    root.style.setProperty('--accent-soft', accent.soft)
  }, [settings.accent])

  const update = useCallback<SettingsContextValue['update']>((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [])

  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider')
  return ctx
}

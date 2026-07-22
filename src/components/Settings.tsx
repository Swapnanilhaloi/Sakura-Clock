import { AnimatePresence, motion } from 'framer-motion'
import { Check, Moon, Music, RotateCcw, Sun, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { AccentKey, Settings as SettingsType } from '@/types'
import { useSettings } from '@/hooks/useSettings'
import { ACCENTS, MUSIC_PRESETS, TIMEZONES } from '@/utils/constants'
import { parseYouTubeSource } from '@/utils/youtube'

interface SettingsProps {
  open: boolean
  onClose: () => void
}

/** Slide-in settings drawer. Every change persists via the settings context. */
export function Settings({ open, onClose }: SettingsProps) {
  const { settings, update, reset } = useSettings()

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            className="glass fixed right-0 top-0 z-50 flex h-full w-[min(88vw,26rem)] flex-col rounded-l-glass rounded-r-none border-r-0"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            role="dialog"
            aria-label="Settings"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold tracking-wide">Settings</h2>
                <p className="text-xs font-medium text-fg/65">Saved automatically to this device</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close settings"
                className="grid h-9 w-9 place-items-center rounded-full text-fg/60 transition-colors hover:bg-white/10 hover:text-fg"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
              {/* Time */}
              <Section title="Time">
                <ToggleRow
                  label="24-hour format"
                  checked={settings.hour24}
                  onChange={(v) => update('hour24', v)}
                />
                <ToggleRow
                  label="Show seconds"
                  checked={settings.showSeconds}
                  onChange={(v) => update('showSeconds', v)}
                />
                <SelectRow
                  label="Timezone"
                  value={settings.timezone}
                  options={TIMEZONES}
                  onChange={(v) => update('timezone', v)}
                />
              </Section>

              {/* Appearance */}
              <Section title="Appearance">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-fg/85">Accent colour</p>
                  <div className="flex flex-wrap gap-3">
                    {ACCENTS.map((a) => (
                      <AccentSwatch
                        key={a.key}
                        colorKey={a.key}
                        color={a.value}
                        label={a.label}
                        active={settings.accent === a.key}
                        onSelect={() => update('accent', a.key)}
                      />
                    ))}
                  </div>
                </div>
                <SliderRow
                  label="Clock size"
                  value={settings.clockSize}
                  min={0.6}
                  max={1.5}
                  step={0.05}
                  format={(v) => `${Math.round(v * 100)}%`}
                  onChange={(v) => update('clockSize', v)}
                />
              </Section>

              {/* Atmosphere */}
              <Section title="Atmosphere">
                <SliderRow
                  label="Background intensity"
                  value={settings.backgroundIntensity}
                  min={0.2}
                  max={1}
                  step={0.05}
                  format={(v) => `${Math.round(v * 100)}%`}
                  onChange={(v) => update('backgroundIntensity', v)}
                />
                <SliderRow
                  label="Particle amount"
                  value={settings.particleAmount}
                  min={0}
                  max={1}
                  step={0.05}
                  format={(v) => `${Math.round(v * 100)}%`}
                  onChange={(v) => update('particleAmount', v)}
                />
                <ToggleRow
                  label="Sakura petals"
                  checked={settings.sakura}
                  onChange={(v) => update('sakura', v)}
                />
                <ToggleRow
                  label="Stars"
                  checked={settings.stars}
                  onChange={(v) => update('stars', v)}
                />
                <ToggleRow
                  label="Day/night cycle"
                  checked={settings.dayNightCycle}
                  onChange={(v) => update('dayNightCycle', v)}
                />
                <PhaseRow
                  value={settings.manualPhase}
                  disabled={settings.dayNightCycle}
                  onChange={(v) => update('manualPhase', v)}
                />
              </Section>

              {/* Music */}
              <Section title="Music">
                <MusicSourceField
                  current={settings.music}
                  onApply={(source) => update('music', source)}
                />
              </Section>
            </div>

            <footer className="border-t border-white/10 px-6 py-4">
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-2 text-sm font-medium text-fg/70 transition-colors hover:text-fg"
              >
                <RotateCcw size={15} />
                Reset to defaults
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-fg/60">
        {title}
      </h3>
      {children}
    </section>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-medium text-fg/85">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
        style={{ background: checked ? 'var(--accent)' : 'rgba(255,255,255,0.14)' }}
      >
        <motion.span
          className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        />
      </button>
    </div>
  )
}

function PhaseRow({
  value,
  disabled,
  onChange,
}: {
  value: 'day' | 'night'
  disabled: boolean
  onChange: (v: 'day' | 'night') => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={`text-sm font-medium ${disabled ? 'text-fg/40' : 'text-fg/85'}`}>Manual sky</span>
      <div className="flex gap-1 rounded-full border border-white/10 bg-white/[0.06] p-0.5">
        {(
          [
            { key: 'day' as const, label: 'Day', Icon: Sun },
            { key: 'night' as const, label: 'Night', Icon: Moon },
          ]
        ).map(({ key, label, Icon }) => {
          const active = value === key
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(key)}
              aria-pressed={active}
              aria-label={label}
              title={label}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={
                active
                  ? { background: 'var(--accent)', color: '#09090b' }
                  : { color: 'rgba(244,244,245,0.8)' }
              }
            >
              <Icon size={12} />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-fg/85">{label}</span>
        <span className="font-medium tabular-nums text-fg/65">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-range w-full"
        aria-label={label}
      />
    </div>
  )
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-fg/85">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-[11rem] rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-fg/90 outline-none transition-colors focus:border-white/25"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-ink-850 text-white">
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function MusicSourceField({
  current,
  onApply,
}: {
  current: SettingsType['music']
  onApply: (source: SettingsType['music']) => void
}) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  const apply = () => {
    if (!draft.trim()) return
    const parsed = parseYouTubeSource(draft)
    if (!parsed) {
      setError("Couldn't read a playlist or video from that link.")
      return
    }
    onApply(parsed)
    setDraft('')
    setError(null)
  }

  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-medium text-fg/90"
        title={current.id}
      >
        <Music size={14} className="shrink-0 text-fg/60" />
        <span className="min-w-0 flex-1 truncate">
          {current.label ?? (current.type === 'playlist' ? 'Custom playlist' : 'Custom video')}
        </span>
        <span className="shrink-0 text-[0.65rem] uppercase tracking-wider text-fg/55">
          {current.type}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {MUSIC_PRESETS.map((preset) => {
          const active = current.id === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApply(preset)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? 'text-[#09090b]' : 'text-fg/85 hover:bg-white/10'
              }`}
              style={
                active
                  ? { background: 'var(--accent)', borderColor: 'var(--accent)' }
                  : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)' }
              }
            >
              {preset.label ?? preset.id}
            </button>
          )
        })}
      </div>

      <div className="space-y-1.5">
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              if (error) setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') apply()
            }}
            placeholder="Paste a YouTube playlist or video URL"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-fg/90 outline-none transition-colors placeholder:font-normal placeholder:text-fg/45 focus:border-white/25"
          />
          <button
            type="button"
            onClick={apply}
            className="shrink-0 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors"
            style={{ background: 'var(--accent)', color: '#09090b' }}
          >
            Set
          </button>
        </div>
        {error && <p className="text-xs text-red-300/80">{error}</p>}
        <p className="text-xs font-medium text-fg/55">
          Works with any playlist link, or a single video/live-stream link to
          loop.
        </p>
      </div>
    </div>
  )
}

function AccentSwatch({
  color,
  label,
  active,
  onSelect,
}: {
  colorKey: AccentKey
  color: string
  label: string
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full transition-transform hover:scale-110"
      style={{
        background: color,
        boxShadow: active ? `0 0 0 2px #09090b, 0 0 0 4px ${color}` : 'none',
      }}
    >
      {active && <Check size={16} className="text-black/70" strokeWidth={3} />}
    </button>
  )
}

// Re-export the settings type for convenience where the drawer is consumed.
export type { SettingsType }

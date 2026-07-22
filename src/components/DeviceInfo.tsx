import { memo } from 'react'
import {
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Cpu,
  Gauge,
  Globe,
  Monitor,
  Smartphone,
  Wifi,
  WifiOff,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { DeviceStats, SystemMetricKey } from '@/types'
import { GlassCard } from './GlassCard'

interface DeviceInfoProps {
  stats: DeviceStats
  fps: number
  /** Which stat rows to render — customised from Settings → System panel. */
  metrics: Record<SystemMetricKey, boolean>
}

/** Compact glass panel of live device / session diagnostics. */
function DeviceInfoBase({ stats, fps, metrics }: DeviceInfoProps) {
  const DeviceIcon = stats.deviceType === 'Desktop' ? Monitor : Smartphone
  const BatteryIcon = batteryIcon(stats.battery)

  return (
    <GlassCard
      className="w-60 p-5"
      initial={{ opacity: 0, x: 28, filter: 'blur(10px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className="mb-4 flex items-center gap-2">
        <Cpu size={15} strokeWidth={1.6} style={{ color: 'var(--accent-soft)' }} />
        <p className="text-xs font-semibold uppercase tracking-widest text-white/55">
          System
        </p>
      </div>

      <ul className="space-y-3 text-sm">
        {metrics.battery && (
          <Row
            icon={stats.charging ? Zap : BatteryIcon}
            label="Battery"
            value={
              stats.battery == null
                ? 'N/A'
                : `${stats.battery}%${stats.charging ? ' · charging' : ''}`
            }
          />
        )}
        {metrics.network && (
          <Row
            icon={stats.online ? Wifi : WifiOff}
            label="Network"
            value={stats.online ? 'Online' : 'Offline'}
            tone={stats.online ? 'ok' : 'warn'}
          />
        )}
        {metrics.fps && (
          <Row icon={Gauge} label="FPS" value={`${fps}`} tone={fps >= 50 ? 'ok' : 'warn'} />
        )}
        {metrics.device && <Row icon={DeviceIcon} label="Device" value={stats.deviceType} />}
        {metrics.browser && <Row icon={Globe} label="Browser" value={stats.browser} />}
        {metrics.os && <Row icon={Monitor} label="OS" value={stats.os} />}
        {metrics.screen && <Row icon={Monitor} label="Screen" value={stats.resolution} />}
      </ul>
    </GlassCard>
  )
}

function Row({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: LucideIcon
  label: string
  value: string
  tone?: 'default' | 'ok' | 'warn'
}) {
  const toneColor =
    tone === 'ok' ? 'var(--accent-soft)' : tone === 'warn' ? '#fca5a5' : undefined
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2.5 text-white/45">
        <Icon size={15} strokeWidth={1.6} />
        <span className="text-[0.8rem]">{label}</span>
      </span>
      <span
        className="truncate text-right text-[0.8rem] font-medium text-white/80"
        style={toneColor ? { color: toneColor } : undefined}
      >
        {value}
      </span>
    </li>
  )
}

function batteryIcon(level: number | null): LucideIcon {
  if (level == null) return BatteryWarning
  if (level > 66) return BatteryFull
  if (level > 33) return BatteryMedium
  if (level > 12) return BatteryLow
  return BatteryWarning
}

export const DeviceInfo = memo(DeviceInfoBase)

import { memo } from 'react'
import { motion } from 'framer-motion'
import {
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Wind,
  type LucideIcon,
} from 'lucide-react'
import type { WeatherData, WeatherIcon } from '@/types'
import { MOCK_WEATHER } from '@/utils/mockWeather'
import { GlassCard } from './GlassCard'

const ICONS: Record<WeatherIcon, LucideIcon> = {
  clear: Sun,
  cloudy: Cloud,
  rain: CloudRain,
  partly: CloudSun,
  night: Moon,
}

interface WeatherCardProps {
  weather?: WeatherData
}

/** Ambient weather card. Uses mock data by default (see fetchWeather stub). */
function WeatherCardBase({ weather = MOCK_WEATHER }: WeatherCardProps) {
  const Icon = ICONS[weather.icon]

  return (
    <GlassCard
      className="w-64 p-5"
      initial={{ opacity: 0, x: -28, filter: 'blur(10px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/45">
            {weather.location}
          </p>
          <p className="mt-1 text-sm capitalize text-white/70">{weather.condition}</p>
        </div>
        <motion.div
          className="grid h-11 w-11 place-items-center rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--accent-soft)' }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={24} strokeWidth={1.6} />
        </motion.div>
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span className="text-5xl font-semibold tabular-nums leading-none text-glow">
          {weather.temperature}°
        </span>
        <span className="mb-1 text-xs text-white/45">feels {weather.feelsLike}°</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric icon={Droplets} label="Humidity" value={`${weather.humidity}%`} />
        <Metric icon={Wind} label="Wind" value={`${weather.windSpeed} km/h`} />
        <Metric icon={Sunrise} label="Sunrise" value={weather.sunrise} />
        <Metric icon={Sunset} label="Sunset" value={weather.sunset} />
      </div>
    </GlassCard>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={16} strokeWidth={1.6} className="shrink-0 text-white/40" />
      <div className="min-w-0">
        <p className="text-[0.65rem] uppercase tracking-wider text-white/40">{label}</p>
        <p className="truncate text-sm font-medium text-white/80">{value}</p>
      </div>
    </div>
  )
}

export const WeatherCard = memo(WeatherCardBase)

import { forwardRef, useImperativeHandle, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Disc3,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { useYouTubePlaylist } from '@/hooks/useYouTubePlaylist'
import { videoThumbnail } from '@/utils/youtube'

export interface MusicPlayerHandle {
  /** Toggle playback from an external trigger (keyboard shortcut). */
  toggle: () => void
}

/**
 * Floating circular music button. Streams the playlist/video configured in
 * Settings via a hidden YouTube IFrame player — disc spins while playing; an
 * expanding panel shows the track's thumbnail, full title, skip controls and
 * a volume slider. Fades to a dim, unobtrusive state while paused and idle,
 * brightening on hover/focus or as soon as playback starts.
 */
export const MusicPlayer = forwardRef<MusicPlayerHandle>(function MusicPlayer(_props, ref) {
  const { settings } = useSettings()
  const { playing, title, videoId, volume, canSkip, toggle, next, previous, setVolume } =
    useYouTubePlaylist(settings.music)
  const [open, setOpen] = useState(false)

  useImperativeHandle(ref, () => ({ toggle }))

  return (
    <div
      className="fixed bottom-6 left-6 z-40 flex items-end gap-3"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      {/* Entrance pop-in — separate from the play/pause fade below so the two
          opacity animations don't fight each other. */}
      <motion.div
        className="shrink-0"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 200, damping: 18 }}
      >
        {/* Main disc button — dims to stay out of the way while paused and
            idle, brightening on hover/focus or as soon as playback starts. */}
        <motion.button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause music' : 'Play music'}
          className="glass glass-hover relative grid h-14 w-14 shrink-0 place-items-center rounded-full"
          whileTap={{ scale: 0.92 }}
          animate={{ opacity: playing || open ? 1 : 0.4 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <motion.div
            className="absolute inset-0 grid place-items-center overflow-hidden rounded-full text-fg/25"
            animate={{ rotate: playing ? 360 : 0 }}
            transition={
              playing
                ? { duration: 4, repeat: Infinity, ease: 'linear' }
                : { duration: 0.4 }
            }
          >
            {videoId ? (
              <img
                src={videoThumbnail(videoId)}
                alt=""
                className="h-full w-full rounded-full object-cover"
                draggable={false}
              />
            ) : (
              <Disc3 size={44} strokeWidth={1.1} />
            )}
          </motion.div>
          <span
            className="relative grid h-7 w-7 place-items-center rounded-full"
            style={{ background: 'var(--accent)', color: '#09090b' }}
          >
            {playing ? (
              <Pause size={14} fill="currentColor" />
            ) : (
              <Play size={14} fill="currentColor" className="ml-0.5" />
            )}
          </span>
        </motion.button>
      </motion.div>

      {/* Expanding now-playing panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="glass flex w-72 flex-col gap-3 rounded-glass p-4"
            initial={{ opacity: 0, x: -12, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -12, y: 8, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/5">
                {videoId && (
                  <img
                    src={videoThumbnail(videoId)}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.65rem] uppercase tracking-widest text-fg/40">
                  Now playing
                </p>
                <p className="break-words text-sm font-medium leading-snug text-fg/85">
                  {title ?? 'Loading…'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <IconButton
                  label="Previous track"
                  onClick={previous}
                  disabled={!canSkip}
                >
                  <SkipBack size={16} />
                </IconButton>
                <IconButton label={playing ? 'Pause' : 'Play'} onClick={toggle}>
                  {playing ? (
                    <Pause size={16} fill="currentColor" />
                  ) : (
                    <Play size={16} fill="currentColor" />
                  )}
                </IconButton>
                <IconButton label="Next track" onClick={next} disabled={!canSkip}>
                  <SkipForward size={16} />
                </IconButton>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVolume(volume === 0 ? 60 : 0)}
                  aria-label="Mute"
                  className="text-fg/60 transition-colors hover:text-fg"
                >
                  {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="accent-range w-20"
                  aria-label="Volume"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

function IconButton({
  label,
  onClick,
  disabled = false,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-full text-fg/70 transition-colors hover:bg-white/10 hover:text-fg disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  )
}

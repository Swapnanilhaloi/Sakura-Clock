import { AnimatePresence, motion } from 'framer-motion'
import { BrainCircuit, Expand, Music4, Settings2, Sparkles, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface OnboardingProps {
  open: boolean
  onClose: () => void
}

const TIPS: Array<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: Settings2,
    title: 'Make it yours',
    body: 'Open Settings (top right) to change the accent colour, clock size, and background mood.',
  },
  {
    icon: Music4,
    title: 'Bring your own music',
    body: 'The floating disc streams a lofi playlist by default — paste any YouTube playlist or video link in Settings → Music to swap it.',
  },
  {
    icon: BrainCircuit,
    title: 'Study & work sessions',
    body: 'The ring button (bottom right) is a Pomodoro-style focus timer — 25-minute focus blocks with short and long breaks, fully adjustable.',
  },
  {
    icon: Expand,
    title: 'Keyboard shortcuts',
    body: 'F for fullscreen, M to play/pause music, P for the focus timer, S for Settings.',
  },
]

/**
 * A centred welcome card shown once on first visit (tracked in localStorage)
 * — a quick orientation rather than a full walkthrough. Reopenable anytime
 * via the "?" button in the control dock.
 */
export function Onboarding({ open, onClose }: OnboardingProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass w-full max-w-md rounded-glass p-7"
              role="dialog"
              aria-label="Welcome"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={18} style={{ color: 'var(--accent)' }} />
                  <h2 className="text-lg font-semibold tracking-wide">
                    Welcome to 桜時計
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close welcome guide"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-fg/60 transition-colors hover:bg-white/10 hover:text-fg"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="mb-6 text-sm font-medium leading-relaxed text-fg/80">
                A quiet corner of your screen — a clock, some weather, and a
                little ambience. Here's what's here.
              </p>

              <ul className="space-y-4">
                {TIPS.map((tip) => (
                  <li key={tip.title} className="flex gap-3">
                    <div
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--accent-soft)' }}
                    >
                      <tip.icon size={16} strokeWidth={1.7} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-fg/85">{tip.title}</p>
                      <p className="text-xs font-medium leading-relaxed text-fg/70">{tip.body}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={onClose}
                className="mt-7 w-full rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)', color: '#09090b' }}
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useQuote } from '@/hooks/useQuote'

/** A calm, anime-flavoured line that fades to a new one every minute. */
function QuoteCardBase() {
  const { quote, index } = useQuote(60_000)

  return (
    <motion.div
      className="pointer-events-none flex max-w-xl items-center justify-center gap-3 rounded-full px-6 py-2 text-center backdrop-blur-md"
      style={{
        background: 'rgba(9,9,11,0.35)',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <Sparkles
        size={16}
        strokeWidth={1.6}
        className="shrink-0"
        style={{ color: 'var(--accent)' }}
      />
      <div className="relative min-h-[1.75rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            className="text-sm font-normal italic tracking-wide text-fg/85 sm:text-base"
            initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(8px)' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            “{quote}”
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export const QuoteCard = memo(QuoteCardBase)

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

type GlassCardProps = HTMLMotionProps<'div'> & {
  /** Enable the subtle hover lift + border brighten. */
  interactive?: boolean
}

/**
 * The shared frosted-glass surface. Every panel in the app builds on this so
 * radius, blur, border and shadow stay perfectly consistent.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { interactive = true, className = '', children, ...rest },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      className={[
        'glass rounded-glass',
        interactive ? 'glass-hover' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </motion.div>
  )
})

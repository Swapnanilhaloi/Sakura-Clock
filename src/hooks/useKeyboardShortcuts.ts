import { useEffect } from 'react'

type Handlers = Record<string, () => void>

/**
 * Registers single-key shortcuts. Ignores events originating from form fields
 * and any modifier combos so it never fights with browser / OS shortcuts.
 */
export function useKeyboardShortcuts(handlers: Handlers): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable
      ) {
        return
      }

      const fn = handlers[e.key.toLowerCase()]
      if (fn) {
        e.preventDefault()
        fn()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handlers])
}

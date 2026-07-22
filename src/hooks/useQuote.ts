import { useEffect, useState } from 'react'
import { QUOTES, nextQuoteIndex } from '@/utils/quotes'

/**
 * Returns the current quote, rotating to a new one every `intervalMs`
 * (default: one minute). The consumer animates the fade transition.
 */
export function useQuote(intervalMs = 60_000): { quote: string; index: number } {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * QUOTES.length))

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => nextQuoteIndex(current, Math.random()))
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return { quote: QUOTES[index], index }
}

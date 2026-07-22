/**
 * A small library of calm, anime-flavoured lines. Rotated once a minute.
 */
export const QUOTES: string[] = [
  'The sky is never the same twice.',
  'Every sunset carries tomorrow.',
  'Even the longest night gives way to morning.',
  'We are all made of the same falling light.',
  'Somewhere, the rain is writing you a letter.',
  'Slow down — the clouds are in no hurry.',
  'A quiet heart hears the whole world.',
  'The stars remember every wish.',
  'Petals fall so that spring can begin again.',
  'Distance is only the sky learning your name.',
  'Rest here a while; the moon will keep watch.',
  'Some feelings can only be spoken by the wind.',
  'Tomorrow is a door the evening leaves open.',
  'The city breathes softer after the rain.',
  'Hold this moment gently — it is already leaving.',
  'Every ending is a horizon, not a wall.',
  'Light travels far to find the ones who wait.',
  'Let the silence be a place, not an absence.',
]

/** Pick a quote index that differs from the previous one when possible. */
export function nextQuoteIndex(current: number, seed: number): number {
  if (QUOTES.length < 2) return 0
  let next = Math.floor(seed * QUOTES.length) % QUOTES.length
  if (next === current) next = (next + 1) % QUOTES.length
  return next
}

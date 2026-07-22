import type { MusicSource } from '@/types'

const PLAYLIST_ID_RE = /^[A-Za-z0-9_-]{10,64}$/
const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/

/**
 * Parses a pasted YouTube URL (or a bare id) into a {@link MusicSource}.
 * Accepts playlist links, watch links opened from within a playlist, plain
 * video/short links, and youtu.be short links. Returns null when nothing
 * recognisable is found so callers can show an inline error instead of
 * silently accepting garbage.
 */
export function parseYouTubeSource(input: string): MusicSource | null {
  const raw = input.trim()
  if (!raw) return null

  // Bare id pasted directly, no URL.
  if (!raw.includes('/') && !raw.includes('.')) {
    if (VIDEO_ID_RE.test(raw)) return { type: 'video', id: raw }
    if (PLAYLIST_ID_RE.test(raw)) return { type: 'playlist', id: raw }
    return null
  }

  let url: URL
  try {
    url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '')
  if (!/(^|\.)youtube\.com$/.test(host) && host !== 'youtu.be') return null

  const list = url.searchParams.get('list')
  if (list && PLAYLIST_ID_RE.test(list)) return { type: 'playlist', id: list }

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0]
    if (VIDEO_ID_RE.test(id)) return { type: 'video', id }
    return null
  }

  const v = url.searchParams.get('v')
  if (v && VIDEO_ID_RE.test(v)) return { type: 'video', id: v }

  const shortsMatch = url.pathname.match(/^\/shorts\/([A-Za-z0-9_-]{11})/)
  if (shortsMatch) return { type: 'video', id: shortsMatch[1] }

  const liveMatch = url.pathname.match(/^\/live\/([A-Za-z0-9_-]{11})/)
  if (liveMatch) return { type: 'video', id: liveMatch[1] }

  const embedMatch = url.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})/)
  if (embedMatch) return { type: 'video', id: embedMatch[1] }

  return null
}

/** Best-effort thumbnail URL for a given video id. */
export function videoThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

import { useCallback, useEffect, useRef, useState } from 'react'
import type { MusicSource } from '@/types'
import type { YTPlayer, YTPlayerEvent } from '@/types/youtube'

let apiReadyPromise: Promise<void> | null = null

/** Loads the YouTube IFrame API script once, sharing the promise across callers. */
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (apiReadyPromise) return apiReadyPromise

  apiReadyPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })

  return apiReadyPromise
}

export interface YouTubePlaylistState {
  ready: boolean
  playing: boolean
  /** Full, untruncated title of the current video. */
  title: string | null
  /** Current video id, for building a thumbnail URL. */
  videoId: string | null
  volume: number
  /** Whether next()/previous() do anything (false for a single-video source). */
  canSkip: boolean
  toggle: () => void
  next: () => void
  previous: () => void
  setVolume: (v: number) => void
}

/**
 * Drives a hidden YouTube IFrame player — either through an entire playlist
 * (shuffled fresh on every load) or a single looping video — used to stream
 * ambient background audio, controlled by play/pause and skip affordances.
 * Streams directly from YouTube; nothing is downloaded or cached.
 */
export function useYouTubePlaylist(source: MusicSource): YouTubePlaylistState {
  const playerRef = useRef<YTPlayer | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [title, setTitle] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [volume, setVolumeState] = useState(60)
  // Survives the effect teardown below, so swapping the source mid-playback
  // (e.g. from Settings) can resume automatically instead of going silent.
  const wasPlayingRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    setReady(false)
    setPlaying(false)
    setTitle(null)
    setVideoId(null)

    // Detached, zero-size host — the API needs a real element to mount into,
    // but nothing should ever be visible or interactive.
    const host = document.createElement('div')
    host.style.position = 'fixed'
    host.style.width = '0px'
    host.style.height = '0px'
    host.style.overflow = 'hidden'
    host.style.opacity = '0'
    host.style.pointerEvents = 'none'
    document.body.appendChild(host)

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT) return

      const player = new window.YT.Player(host, {
        height: '0',
        width: '0',
        ...(source.type === 'video' ? { videoId: source.id } : {}),
        playerVars: {
          ...(source.type === 'playlist'
            ? { listType: 'playlist' as const, list: source.id }
            : {}),
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (e: YTPlayerEvent) => {
            e.target.setVolume(volume)
            // Shuffle playlist sources so each visit opens on a different
            // track rather than always the playlist's first upload.
            if (source.type === 'playlist') e.target.setShuffle(true)
            if (wasPlayingRef.current) e.target.playVideo()
            setReady(true)
          },
          onStateChange: (e: YTPlayerEvent) => {
            const states = window.YT!.PlayerState
            const isPlaying = e.data === states.PLAYING
            setPlaying(isPlaying)
            wasPlayingRef.current = isPlaying
            if (e.data === states.PLAYING || e.data === states.CUED) {
              const data = e.target.getVideoData()
              setTitle(data.title || null)
              setVideoId(data.video_id || null)
            }
          },
        },
      })
      playerRef.current = player
    })

    return () => {
      cancelled = true
      playerRef.current?.destroy()
      playerRef.current = null
      host.remove()
    }
    // Player is recreated whenever the source changes; volume flows via setVolume().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source.type, source.id])

  const toggle = useCallback(() => {
    const player = playerRef.current
    const states = window.YT?.PlayerState
    if (!player || !states) return
    if (player.getPlayerState() === states.PLAYING) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }, [])

  const next = useCallback(() => {
    if (source.type !== 'playlist') return
    playerRef.current?.nextVideo()
  }, [source.type])

  const previous = useCallback(() => {
    if (source.type !== 'playlist') return
    playerRef.current?.previousVideo()
  }, [source.type])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    playerRef.current?.setVolume(v)
  }, [])

  return {
    ready,
    playing,
    title,
    videoId,
    volume,
    canSkip: source.type === 'playlist',
    toggle,
    next,
    previous,
    setVolume,
  }
}

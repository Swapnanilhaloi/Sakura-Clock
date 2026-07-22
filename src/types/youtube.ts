/**
 * Minimal ambient typings for the YouTube IFrame Player API — just enough
 * surface for a hidden audio-only playlist player. The official package has
 * no first-party @types, so this is hand-rolled rather than pulling in an
 * unofficial dependency for a handful of methods.
 */

export interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  nextVideo(): void
  previousVideo(): void
  getPlayerState(): number
  setVolume(volume: number): void
  getVolume(): number
  getVideoData(): { title?: string; video_id?: string }
  destroy(): void
}

export interface YTPlayerEvent {
  target: YTPlayer
  data: number
}

export interface YTPlayerVars {
  listType?: 'playlist'
  list?: string
  autoplay?: 0 | 1
  controls?: 0 | 1
  disablekb?: 0 | 1
  modestbranding?: 0 | 1
  rel?: 0 | 1
  playsinline?: 0 | 1
}

export interface YTPlayerOptions {
  height: string
  width: string
  /** Only set for a single-video source; omit when using playerVars.list. */
  videoId?: string
  playerVars: YTPlayerVars
  events: {
    onReady?: (e: YTPlayerEvent) => void
    onStateChange?: (e: YTPlayerEvent) => void
    onError?: (e: YTPlayerEvent) => void
  }
}

export interface YTNamespace {
  Player: new (element: HTMLElement, options: YTPlayerOptions) => YTPlayer
  PlayerState: {
    UNSTARTED: number
    ENDED: number
    PLAYING: number
    PAUSED: number
    BUFFERING: number
    CUED: number
  }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

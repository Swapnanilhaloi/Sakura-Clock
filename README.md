# 桜時計 · Sakura Clock

A premium, anime-inspired desktop clock — a calm, cinematic, distraction-free
ambient screen in the spirit of Makoto Shinkai skies, Studio Ghibli warmth, and
rainy-evening lofi cafés. Built with **React + Vite + TypeScript**, **Tailwind
CSS**, **Framer Motion**, and **Lucide** icons. Dark mode only.

![sky](public/sakura.svg)

## ✨ Features

- **Cinematic background** — animated gradient sky with true-to-life
  dawn/day/dusk/night colouring, slow drifting clouds, a glowing moon, distant
  bird flocks, a layered mountain silhouette with a pine treeline and torii
  gate, twinkling stars, glowing particles, and falling sakura petals. All
  rendered through a single `requestAnimationFrame` canvas loop for a steady
  60 FPS.
- **Live clock** — large digital time with weekday, full date, and timezone,
  formatted with `Intl.DateTimeFormat` and aligned to the second boundary.
- **Weather card** — live temperature, feels-like, humidity, wind, sunrise &
  sunset for the user's actual GPS location (via the browser's geolocation +
  the free, keyless Open-Meteo API); falls back to a fixed demo payload if
  location access is denied or unavailable — see below.
- **Focus timer** — a Pomodoro-style floating timer: 25-minute focus blocks
  with short/long breaks, adjustable durations, session dots, a completion
  chime, and an optional browser notification.
- **Anime quotes** — a gentle line that fades to a new one every minute.
- **Music player** — floating disc button that streams the
  [SAKURA RONIN](https://www.youtube.com/@SAKURARONIN44) lofi playlist via a
  hidden YouTube IFrame player. Hover it for the full "now playing" card:
  thumbnail, untruncated title, previous/next skip, and a volume slider.
- **Day/night cycle** — the sky's gradient, horizon glow, mountain tint, and
  star brightness shift through dawn → morning → day → dusk → evening → night
  based on the clock's own timezone, cross-fading smoothly at each boundary.
  Toggle it off in Settings to keep the original fixed evening sky.
- **Settings drawer** — 12/24-hour, seconds, accent colour, background
  intensity, particle amount, clock size, sakura/stars/day-night toggles,
  timezone, and the music source (paste any YouTube playlist or video URL).
  Everything persists to `localStorage`.
- **Atmospherics** — glassmorphism, backdrop blur, pointer parallax, and soft
  fade / slide / blur-reveal transitions throughout.
- **First-time welcome guide** — a short orientation card on first visit
  (dismissal remembered in `localStorage`), reopenable anytime via the "?"
  button in the control dock or the `?` shortcut.
- **Extras** — fullscreen mode and keyboard shortcuts.

## ⌨️ Keyboard shortcuts

| Key | Action              |
| --- | ------------------- |
| `F` | Toggle fullscreen   |
| `M` | Play / pause music  |
| `P` | Start / pause focus timer |
| `S` | Toggle settings     |
| `?` | Show welcome guide  |

## 🚀 Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## 🌦️ Live weather

On load, `useGeolocation` (in
[`src/hooks/useGeolocation.ts`](src/hooks/useGeolocation.ts)) asks the browser
for the user's position via the standard Geolocation API — that's the native
permission prompt, nothing custom. Once coordinates land, `useWeather` (in
[`src/hooks/useWeather.ts`](src/hooks/useWeather.ts)) fetches current
conditions from [Open-Meteo](https://open-meteo.com) — free, no API key — and
reverse-geocodes the coordinates to a "City, Country" label via BigDataCloud's
free client API. Both live in
[`src/utils/weather.ts`](src/utils/weather.ts).

If permission is denied, geolocation is unsupported, or a request fails, the
card just quietly stays on `MOCK_WEATHER` (or whatever it last successfully
fetched) — there's no error state in the UI.

## 🗂️ Project structure

```
src/
  components/    Clock, WeatherCard, QuoteCard, Settings, Background,
                 SkyCanvas, MusicPlayer, PomodoroTimer, GlassCard, Onboarding
  hooks/         useClock, useSettings, usePomodoro, useQuote, useWeather,
                 useGeolocation, useMousePosition, useFullscreen,
                 useKeyboardShortcuts, useYouTubePlaylist, useDayPhase
  utils/         time, storage, quotes, weather, constants, youtube, dayPhase
  types/         shared TypeScript interfaces, youtube (IFrame API typings)
```

### 🎵 About the music player

Playback streams live from YouTube via the official
[IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
— nothing is downloaded, cached, or rehosted. A web page cannot read what's
playing elsewhere on your system (another tab, Spotify, the OS mixer); that's
a deliberate browser sandboxing restriction, not a limitation of this app.

Users can point the player at any playlist or single video from Settings →
Music by pasting a link — `parseYouTubeSource` in
[`src/utils/youtube.ts`](src/utils/youtube.ts) accepts `playlist?list=…`
links, `watch?v=…` links, `youtu.be/…` short links, and `/shorts/`/`/live/`
links. Switching sources mid-playback resumes automatically if something was
already playing. The built-in default lives in `DEFAULT_MUSIC_SOURCE` in
[`src/utils/constants.ts`](src/utils/constants.ts) — any channel's "all
uploads" playlist id is `UU` + the channel id with its leading `UC` removed.

Non-critical panels (weather, music, focus timer, settings) are lazy-loaded so
the clock paints first; components are memoised to avoid re-rendering on each
tick.

## 🎨 Customisation

- **Accent colours** live in [`src/utils/constants.ts`](src/utils/constants.ts).
- **Quotes** live in [`src/utils/quotes.ts`](src/utils/quotes.ts).
- **Palette / radii / animations** are in
  [`tailwind.config.js`](tailwind.config.js).

Built with care for a quiet corner of your screen. 🌸

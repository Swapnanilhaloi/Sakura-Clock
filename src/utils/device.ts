/**
 * Best-effort user-agent parsing for the device info panel. Deliberately
 * lightweight — no external UA library, just enough for a friendly label.
 */

export function detectBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return 'Edge'
  if (/OPR\/|Opera/.test(ua)) return 'Opera'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Chrome'
  if (/Chromium\//.test(ua)) return 'Chromium'
  if (/Safari\//.test(ua)) return 'Safari'
  return 'Unknown'
}

export function detectOS(ua: string): string {
  if (/Windows NT 10/.test(ua)) return 'Windows'
  if (/Windows/.test(ua)) return 'Windows'
  if (/Mac OS X/.test(ua)) return 'macOS'
  if (/Android/.test(ua)) return 'Android'
  if (/(iPhone|iPad|iPod)/.test(ua)) return 'iOS'
  if (/Linux/.test(ua)) return 'Linux'
  return 'Unknown'
}

export function detectDeviceType(ua: string): string {
  if (/iPad|Tablet/.test(ua)) return 'Tablet'
  if (/Mobi|Android|iPhone/.test(ua)) return 'Mobile'
  return 'Desktop'
}

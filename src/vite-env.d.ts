/// <reference types="vite/client" />

// The Battery Status API is not in the standard TS DOM lib yet.
interface BatteryManager extends EventTarget {
  readonly charging: boolean
  readonly chargingTime: number
  readonly dischargingTime: number
  readonly level: number
  onchargingchange: ((this: BatteryManager, ev: Event) => unknown) | null
  onlevelchange: ((this: BatteryManager, ev: Event) => unknown) | null
}

interface Navigator {
  getBattery?: () => Promise<BatteryManager>
  readonly deviceMemory?: number
}

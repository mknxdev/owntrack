export type ConfigService = {
  name: string
  label?: string
  trackingScriptUrl: string
  handlers: Object & { init: Function }
}
export type Config = {
  services: ConfigService[]
}
export type TrackingServiceConsent = {
  srv: string
  v: boolean
  r: boolean
}
export type TrackingService = TrackingServiceConsent & {
  label: string
}

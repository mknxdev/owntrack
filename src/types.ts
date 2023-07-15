export type ConfigService = {
  name: string
  label?: string
  trackingScriptUrl: string
  onInit: Function
  handlers: Object
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

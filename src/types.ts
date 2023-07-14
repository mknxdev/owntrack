type ConfigService = {
  name: string
  label: string
  trackingScriptUrl: string
  trckingCode: Function
}
export type Config = {
  services: ConfigService[]
}
export type TrackingServiceConsent = {
  name: string
  consent: boolean
  reviewed: boolean
}
export type TrackingService = TrackingServiceConsent & {
  label: string
}

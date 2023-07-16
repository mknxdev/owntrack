import ServiceWrapper from './TrackingServiceWrapper'

export type ConfigService = {
  name: string
  label?: string
  trackingScriptUrl: string
  onInit: Function
  handlers: object
}
export type Config = {
  services: ConfigService[]
}
export type Consent = {
  value: boolean
  reviewed: boolean
}
export type TrackingService = {
  name: string
  consent: Consent
  sw: ServiceWrapper
}
export type TrackingServiceConsent = {
  srv: string
  v: boolean
  r: boolean
}

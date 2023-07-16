import TrackingServiceWrapper from './TrackingServiceWrapper'

export type ConfigService = {
  name: string
  label?: string
  type?: string
  description?: string
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
export type TrackingServiceLayer = {
  isEditable: boolean
  name: string
  type?: string
  description?: string
  consent: Consent
  tsw: TrackingServiceWrapper
}
export type TrackingServiceConsent = {
  srv: string
  v: boolean
  r: boolean
}

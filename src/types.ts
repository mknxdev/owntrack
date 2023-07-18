import TrackingService from './TrackingService'

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
export type TrackingServiceContainer = {
  isEditable: boolean
  name: string
  type?: string
  description?: string
  consent: Consent
  tsw: TrackingService
}
export type TrackingServiceConsent = {
  srv: string
  v: boolean
  r: boolean
}
